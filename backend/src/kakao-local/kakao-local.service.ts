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
      this.logger.warn('KAKAO_REST_KEY is not set');
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
      placeUrl: doc.place_url,
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
      placeUrl: doc.place_url,
      distance: doc.distance ? Number(doc.distance) : undefined,
    }));
  }
}

