import { Injectable, Inject, BadRequestException, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { KakaoLocalService } from '../kakao-local/kakao-local.service';
import { PlaceDto } from '../common/dto/place.dto';
import { logRecommendAttempt } from '../common/decorators/api-log.decorator';

interface Participant {
  label: string;
  lat: number;
  lng: number;
}

export interface RecommendResult {
  anchor: { lat: number; lng: number };
  final: PlaceDto | null;
  candidates: PlaceDto[];
  used: { category: string; radius: number } | null;
  message?: string;
}

const MAX_ATTEMPTS = 16; // 4카테고리 × 4반경
const CATEGORIES = ['SW8', 'CT1', 'PO3', 'AT4']; // 지하철역, 문화시설, 공공기관, 관광명소
const RADIUSES = [2000, 5000, 10000, 20000]; // 미터 단위

@Injectable()
export class RecommendService {
  private readonly logger = new Logger(RecommendService.name);

  constructor(
    private readonly kakaoLocalService: KakaoLocalService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async recommend(
    participants: Participant[],
    category?: 'SW8' | 'CT1' | 'PO3' | 'AT4',
  ): Promise<RecommendResult> {
    // Validation: participants 2~4명, label A~D 중복 없음, 좌표 유효 범위
    this.validateParticipants(participants);

    // Anchor 계산: 평균 좌표
    const anchor = this.calculateAnchor(participants);

    // category가 지정된 경우 해당 카테고리만 검색, 없으면 모든 카테고리 순회
    const categoriesToSearch = category ? [category] : CATEGORIES;

    // 캐시 확인 (anchor+category+radius 기준, TTL 5분)
    const cacheKey = this.getCacheKey(anchor, category);
    const cached = await this.cacheManager.get<RecommendResult>(cacheKey);
    if (cached) {
      return cached;
    }

    // 랜드마크 폴백 로직
    let attempts = 0;
    let final: PlaceDto | null = null;
    let candidates: PlaceDto[] = [];
    let used: { category: string; radius: number } | null = null;

    for (const cat of categoriesToSearch) {
      for (const radius of RADIUSES) {
        attempts++;
        if (attempts > MAX_ATTEMPTS) {
          this.logger.warn(`Max attempts (${MAX_ATTEMPTS}) reached`);
          break;
        }

        try {
          this.logger.debug(
            `Attempt ${attempts}: Searching category ${cat} with radius ${radius}m at (${anchor.lng}, ${anchor.lat})`,
          );

          const results = await this.kakaoLocalService.searchCategory(
            cat,
            anchor.lng, // x: 경도
            anchor.lat, // y: 위도
            radius,
            15,
          );

          this.logger.debug(
            `Attempt ${attempts}: Found ${results.length} results`,
          );

          if (results.length > 0) {
            final = results[0];
            candidates = results.slice(0, 10); // 최대 10개
            used = { category: cat, radius };
            this.logger.log(
              `Found landmark: ${final.name} using category ${cat}, radius ${radius}m`,
            );
            break;
          }
        } catch (error: any) {
          // 429 에러는 상위로 전파
          if (error.response?.status === 429) {
            this.logger.error('Kakao API rate limit exceeded');
            throw error;
          }
          // 다른 에러는 로깅하고 다음 시도
          this.logger.error(
            `Category search failed: ${cat}, radius: ${radius}, error: ${error.message}`,
            error.stack,
          );
        }
      }

      if (final) {
        break;
      }
    }

    if (!final) {
      this.logger.warn(
        `No landmark found after ${attempts} attempts at anchor (${anchor.lat}, ${anchor.lng})`,
      );
    }

    // 로깅: attempts, used category/radius, anchor 좌표
    logRecommendAttempt(anchor, used, attempts);

    const result: RecommendResult = {
      anchor,
      final,
      candidates,
      used,
      ...(final
        ? {}
        : { message: '추천 가능한 랜드마크를 찾지 못했습니다.' }),
    };

    // 캐시 저장 (TTL 5분)
    await this.cacheManager.set(cacheKey, result, 300000);

    return result;
  }

  private validateParticipants(participants: Participant[]): void {
    // 참가자 수 2~4명
    if (participants.length < 2 || participants.length > 4) {
      throw new BadRequestException('참가자는 2~4명이어야 합니다.');
    }

    // label A~D 중복 체크
    const labels = participants.map((p) => p.label);
    const uniqueLabels = new Set(labels);
    if (labels.length !== uniqueLabels.size) {
      throw new BadRequestException('참가자 라벨은 중복될 수 없습니다.');
    }

    // label이 A~D 중 하나인지 확인
    const validLabels = ['A', 'B', 'C', 'D'];
    for (const label of labels) {
      if (!validLabels.includes(label)) {
        throw new BadRequestException(
          `참가자 라벨은 A, B, C, D 중 하나여야 합니다. (현재: ${label})`,
        );
      }
    }

    // 좌표 유효 범위 검증
    for (const participant of participants) {
      if (
        participant.lat < -90 ||
        participant.lat > 90 ||
        participant.lng < -180 ||
        participant.lng > 180
      ) {
        throw new BadRequestException(
          `유효하지 않은 좌표입니다. (lat: ${participant.lat}, lng: ${participant.lng})`,
        );
      }
    }
  }

  private calculateAnchor(participants: Participant[]): {
    lat: number;
    lng: number;
  } {
    const sumLat = participants.reduce((sum, p) => sum + p.lat, 0);
    const sumLng = participants.reduce((sum, p) => sum + p.lng, 0);
    const count = participants.length;

    // 좌표를 소수점 6자리로 반올림 (응답 형식에 맞춤)
    return {
      lat: Number((sumLat / count).toFixed(6)),
      lng: Number((sumLng / count).toFixed(6)),
    };
  }

  private getCacheKey(
    anchor: { lat: number; lng: number },
    category?: string,
  ): string {
    // 좌표를 소수점 6자리로 반올림하여 캐시 키 생성
    const lat = anchor.lat.toFixed(6);
    const lng = anchor.lng.toFixed(6);
    // category가 있으면 캐시 키에 포함
    return category
      ? `recommend:${lat},${lng}:${category}`
      : `recommend:${lat},${lng}`;
  }
}

