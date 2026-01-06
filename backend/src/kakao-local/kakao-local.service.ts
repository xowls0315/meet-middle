import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import { TooManyRequestsException } from '../common/exceptions/too-many-requests.exception';
import { PlaceDto } from '../common/dto/place.dto';
import { logKakaoCall } from '../common/decorators/api-log.decorator';

export interface KakaoKeywordResponse {
  documents: Array<{
    id: string;
    place_name: string;
    address_name: string;
    road_address_name?: string;
    x: string;
    y: string;
    place_url?: string;
  }>;
  meta: {
    total_count: number;
    pageable_count: number;
    is_end: boolean;
  };
}

export interface KakaoCategoryResponse {
  documents: Array<{
    id: string;
    place_name: string;
    address_name: string;
    road_address_name?: string;
    x: string;
    y: string;
    place_url?: string;
    distance?: string;
  }>;
  meta: {
    total_count: number;
    pageable_count: number;
    is_end: boolean;
  };
}

@Injectable()
export class KakaoLocalService {
  private readonly logger = new Logger(KakaoLocalService.name);
  private readonly httpClient: AxiosInstance;
  private readonly restApiKey: string;
  private readonly baseURL = 'https://dapi.kakao.com/v2/local';

  constructor(private configService: ConfigService) {
    this.restApiKey = this.configService.get<string>('KAKAO_REST_KEY') || '';

    if (!this.restApiKey) {
      this.logger.error('KAKAO_REST_KEY is not set. Kakao Local API calls will fail.');
    }

    this.httpClient = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        Authorization: `KakaoAK ${this.restApiKey}`,
      },
    });
  }

  /**
   * 키워드 검색 (자동완성용)
   */
  async searchKeyword(query: string, size: number = 10): Promise<PlaceDto[]> {
    try {
      const response = await this.httpClient.get<KakaoKeywordResponse>(
        '/search/keyword',
        {
          params: {
            query: query.trim(),
            size: Math.min(size, 15), // 최대 15개
          },
        },
      );

      // 디버깅: 실제 카카오 API 응답 로깅
      if (response.data.documents.length > 0) {
        this.logger.debug(
          `Kakao API place_url example: ${response.data.documents[0].place_url}`,
        );
        this.logger.debug(
          `Kakao API place_id example: ${response.data.documents[0].id}`,
        );
      }

      const places = this.normalizeKeywordResults(response.data.documents);
      logKakaoCall('searchKeyword', { query, size }, places);
      return places;
    } catch (error: any) {
      logKakaoCall('searchKeyword', { query, size }, undefined, error);

      if (error.response?.status === 429) {
        throw new TooManyRequestsException('KAKAO_RATE_LIMIT');
      }

      throw error;
    }
  }

  /**
   * 카테고리 검색 (랜드마크용)
   */
  async searchCategory(
    category: string,
    x: number,
    y: number,
    radius: number,
    size: number = 15,
  ): Promise<PlaceDto[]> {
    try {
      const response = await this.httpClient.get<KakaoCategoryResponse>(
        '/search/category',
        {
          params: {
            category_group_code: category,
            x: x.toString(),
            y: y.toString(),
            radius: radius,
            sort: 'distance',
            size: Math.min(size, 15),
          },
        },
      );

      // 디버깅: 실제 카카오 API 응답 로깅
      if (response.data.documents.length > 0) {
        this.logger.debug(
          `Kakao API place_url example: ${response.data.documents[0].place_url}`,
        );
        this.logger.debug(
          `Kakao API place_id example: ${response.data.documents[0].id}`,
        );
      }

      const places = this.normalizeCategoryResults(response.data.documents);
      logKakaoCall(
        'searchCategory',
        { category, x, y, radius, size },
        places,
      );
      return places;
    } catch (error: any) {
      logKakaoCall(
        'searchCategory',
        { category, x, y, radius, size },
        undefined,
        error,
      );

      if (error.response?.status === 429) {
        throw new TooManyRequestsException('KAKAO_RATE_LIMIT');
      }

      throw error;
    }
  }

  /**
   * 키워드 검색 결과 정규화
   */
  private normalizeKeywordResults(
    documents: KakaoKeywordResponse['documents'],
  ): PlaceDto[] {
    return documents.map((doc) => ({
      placeId: doc.id,
      name: doc.place_name,
      address: doc.road_address_name || doc.address_name,
      lat: parseFloat(doc.y),
      lng: parseFloat(doc.x),
      placeUrl: this.normalizePlaceUrl(doc.place_url, doc.id),
    }));
  }

  /**
   * 카테고리 검색 결과 정규화
   */
  private normalizeCategoryResults(
    documents: KakaoCategoryResponse['documents'],
  ): PlaceDto[] {
    return documents.map((doc) => ({
      placeId: doc.id,
      name: doc.place_name,
      address: doc.road_address_name || doc.address_name,
      lat: parseFloat(doc.y),
      lng: parseFloat(doc.x),
      placeUrl: this.normalizePlaceUrl(doc.place_url, doc.id),
      distance: doc.distance ? Number(doc.distance) : undefined,
    }));
  }

  /**
   * 카카오 placeUrl 정규화
   * 카카오 API의 place_url이 없거나 잘못된 형식일 경우 올바른 형식으로 생성
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
}

