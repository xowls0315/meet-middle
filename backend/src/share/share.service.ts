import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Share } from './entities/share.entity';

// 상수 정의
const COORDINATE_PRECISION = 6; // 좌표 소수점 자리수
const MAX_CANDIDATES = 10; // 최대 후보 장소 개수
const SHARE_EXPIRY_DAYS = 7; // 공유 링크 유효 기간 (일)
const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

// 타입 정의
export interface Place {
  placeId: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  placeUrl?: string;
  distance?: number;
}

export interface Participant {
  label: string;
  lat: number;
  lng: number;
}

export interface ShareData {
  anchor: { lat: number; lng: number };
  participants: Participant[];
  final: Place;
  candidates: Place[];
  used?: { category: string; radius: number };
  user?: {
    nickname: string;
  };
}

@Injectable()
export class ShareService {
  private readonly logger = new Logger(ShareService.name);

  constructor(
    @InjectRepository(Share)
    private shareRepository: Repository<Share>,
  ) {}

  /**
   * 좌표를 소수점 6자리로 정규화
   */
  private normalizeCoordinate(value: number): number {
    return Number(value.toFixed(COORDINATE_PRECISION));
  }

  /**
   * 좌표 객체 정규화
   */
  private normalizeCoordinates(coords: { lat: number; lng: number }): { lat: number; lng: number } {
    return {
      lat: this.normalizeCoordinate(coords.lat),
      lng: this.normalizeCoordinate(coords.lng),
    };
  }

  /**
   * 장소 데이터 정규화
   */
  private normalizePlace(place: Place): Place {
    return {
      ...place,
      ...this.normalizeCoordinates(place),
    };
  }

  /**
   * 공유 데이터 정규화
   */
  private normalizeShareData(data: ShareData, userName?: string): ShareData & { userName?: string } {
    return {
      ...data,
      anchor: this.normalizeCoordinates(data.anchor),
      participants: data.participants.map((p) => ({
        ...p,
        ...this.normalizeCoordinates(p),
      })),
      final: this.normalizePlace(data.final),
      candidates: data.candidates.slice(0, MAX_CANDIDATES).map((c) => this.normalizePlace(c)),
      ...(userName && { userName }),
    };
  }

  /**
   * 공유 링크 생성
   */
  async create(
    data: ShareData,
    userName?: string,
  ): Promise<{ shareId: string; url: string }> {
    const normalizedData = this.normalizeShareData(data, userName);

    const shareId = uuidv4();
    const expiresAt = new Date(Date.now() + SHARE_EXPIRY_DAYS * MILLISECONDS_PER_DAY);

    const share = this.shareRepository.create({
      shareId,
      data: normalizedData,
      expiresAt,
    });

    await this.shareRepository.save(share);

    // 만료된 항목 정리 (백그라운드, 에러는 무시)
    this.cleanExpiredShares().catch((err) => {
      this.logger.error('Failed to clean expired shares', err);
    });

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const shareUrl = `${frontendUrl}/share/${shareId}`;

    return { shareId, url: shareUrl };
  }

  /**
   * 카카오 placeUrl 정규화 및 생성
   */
  private normalizePlaceUrl(placeUrl: string | undefined, placeId: string): string {
    // place_url이 있고 올바른 형식이면 그대로 사용
    if (placeUrl && placeUrl.startsWith('http')) {
      // 카카오 place_url 형식 검증 및 수정
      // 카카오 API는 때때로 http://place.map.kakao.com/{place_id} 형식으로 반환하지만
      // 실제로는 http://place.map.kakao.com/m/{place_id} 형식이 필요함
      if (placeUrl.includes('place.map.kakao.com') && !placeUrl.includes('/m/')) {
        // /m/ 경로가 없으면 추가
        const placeIdFromUrl = placeUrl.split('/').pop() || placeId;
        return `http://place.map.kakao.com/m/${placeIdFromUrl}`;
      }
      return placeUrl;
    }

    // place_url이 없거나 잘못된 형식이면 placeId로부터 생성
    // 카카오 장소 URL 형식: http://place.map.kakao.com/m/{place_id}
    return `http://place.map.kakao.com/m/${placeId}`;
  }

  /**
   * 공유 링크 조회
   */
  async findOne(shareId: string): Promise<Partial<ShareData>> {
    const share = await this.shareRepository.findOne({
      where: { shareId },
    });

    if (!share) {
      throw new NotFoundException('공유 링크를 찾을 수 없습니다.');
    }

    // 만료 확인 및 삭제
    if (share.expiresAt < new Date()) {
      await this.shareRepository.remove(share);
      throw new NotFoundException('공유 링크가 만료되었습니다.');
    }

    // 응답 데이터 구성
    const { anchor, final, candidates, participants, userName } = share.data;
    
    // final 장소의 placeUrl이 없으면 생성
    const finalWithUrl = {
      ...final,
      placeUrl: this.normalizePlaceUrl(final.placeUrl, final.placeId),
    };

    // candidates의 placeUrl도 정규화
    const candidatesWithUrl = candidates?.map((candidate) => ({
      ...candidate,
      placeUrl: this.normalizePlaceUrl(candidate.placeUrl, candidate.placeId),
    }));

    const result: Partial<ShareData> = {
      anchor,
      final: finalWithUrl,
      ...(candidatesWithUrl && candidatesWithUrl.length > 0 && { candidates: candidatesWithUrl }),
      ...(participants?.length > 0 && { participants }),
      ...(userName && {
        user: {
          nickname: userName,
        },
      }),
    };

    return result;
  }

  /**
   * 만료된 공유 링크 정리
   */
  private async cleanExpiredShares(): Promise<void> {
    const now = new Date();
    const result = await this.shareRepository.delete({
      expiresAt: LessThan(now),
    });

    if (result.affected && result.affected > 0) {
      this.logger.log(`Cleaned ${result.affected} expired shares`);
    }
  }
}

