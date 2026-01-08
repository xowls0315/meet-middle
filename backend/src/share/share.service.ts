import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Share } from './entities/share.entity';

export interface ShareData {
  anchor: { lat: number; lng: number };
  participants: Array<{ label: string; lat: number; lng: number }>;
  final: {
    placeId: string;
    name: string;
    address: string;
    lat: number;
    lng: number;
    placeUrl?: string;
    distance?: number;
  };
  candidates: Array<{
    placeId: string;
    name: string;
    address: string;
    lat: number;
    lng: number;
    placeUrl?: string;
    distance?: number;
  }>;
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

  async create(
    data: ShareData,
    userName?: string,
  ): Promise<{ shareId: string; url: string }> {
    // 데이터 최소화: candidates 최대 10개 제한 및 좌표 소수점 6자리 제한
    const normalizedData: ShareData & { userName?: string } = {
      ...data,
      anchor: {
        lat: Number(data.anchor.lat.toFixed(6)),
        lng: Number(data.anchor.lng.toFixed(6)),
      },
      participants: data.participants.map((p) => ({
        ...p,
        lat: Number(p.lat.toFixed(6)),
        lng: Number(p.lng.toFixed(6)),
      })),
      final: {
        ...data.final,
        lat: Number(data.final.lat.toFixed(6)),
        lng: Number(data.final.lng.toFixed(6)),
      },
      candidates: data.candidates.slice(0, 10).map((c) => ({
        ...c,
        lat: Number(c.lat.toFixed(6)),
        lng: Number(c.lng.toFixed(6)),
      })),
      ...(userName ? { userName } : {}), // 로그인한 경우에만 userName 저장
    };

    // shareId 생성 (UUID)
    const shareId = uuidv4();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7일 후

    const share = this.shareRepository.create({
      shareId,
      data: normalizedData,
      expiresAt,
    });

    await this.shareRepository.save(share);

    // 만료된 항목 정리 (백그라운드)
    this.cleanExpiredShares().catch((err) => {
      this.logger.error('Failed to clean expired shares', err);
    });

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const shareUrl = `${frontendUrl}/share/${shareId}`;

    return {
      shareId,
      url: shareUrl,
    };
  }

  async findOne(shareId: string): Promise<Partial<ShareData>> {
    const share = await this.shareRepository.findOne({
      where: { shareId },
    });

    if (!share) {
      throw new NotFoundException('공유 링크를 찾을 수 없습니다.');
    }

    // TTL 처리: 만료 확인
    if (share.expiresAt < new Date()) {
      await this.shareRepository.remove(share);
      throw new NotFoundException('공유 링크가 만료되었습니다.');
    }

    // 명세서에 맞게 응답 형식 조정 (participants는 선택적)
    const { anchor, final, candidates, participants, userName } = share.data;
    const result: Partial<ShareData> = {
      anchor,
      final,
      ...(candidates && candidates.length > 0 ? { candidates } : {}),
      ...(participants && participants.length > 0 ? { participants } : {}),
    };

    // 로그인한 사용자가 공유한 경우 user 정보 추가
    if (userName) {
      result.user = {
        nickname: userName,
      };
    }

    return result;
  }

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

