import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { KakaoLocalService } from '../kakao-local/kakao-local.service';
import { PlaceDto } from '../common/dto/place.dto';

@Injectable()
export class SearchService {
  constructor(
    private readonly kakaoLocalService: KakaoLocalService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async suggest(query: string): Promise<PlaceDto[]> {
    // q.length < 2 → 즉시 [] 반환 (외부 호출 방지)
    if (!query || query.trim().length < 2) {
      return [];
    }

    // q normalize (trim, 소문자)
    const normalizedQuery = query.trim().toLowerCase();

    // 캐시 확인 (TTL 60초)
    const cacheKey = `suggest:${normalizedQuery}`;
    const cached = await this.cacheManager.get<PlaceDto[]>(cacheKey);
    if (cached) {
      return cached;
    }

    // 카카오 API 호출
    const results = await this.kakaoLocalService.searchKeyword(
      normalizedQuery,
      10,
    );

    // 결과 정규화 (최대 10개)
    const normalizedResults = results.slice(0, 10);

    // 캐시 저장 (TTL 60초)
    await this.cacheManager.set(cacheKey, normalizedResults, 60000);

    return normalizedResults;
  }
}

