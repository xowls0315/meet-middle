import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { SearchService } from './search.service';
import { KakaoLocalService } from '../kakao-local/kakao-local.service';

describe('SearchService', () => {
  let service: SearchService;
  let kakaoLocalService: KakaoLocalService;
  let cacheManager: any;

  const mockKakaoLocalService = {
    searchKeyword: jest.fn(),
  };

  const mockCacheManager = {
    get: jest.fn(),
    set: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchService,
        {
          provide: KakaoLocalService,
          useValue: mockKakaoLocalService,
        },
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
      ],
    }).compile();

    service = module.get<SearchService>(SearchService);
    kakaoLocalService = module.get<KakaoLocalService>(KakaoLocalService);
    cacheManager = module.get(CACHE_MANAGER);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('suggest', () => {
    it('should return empty array if query length < 2', async () => {
      const result = await service.suggest('a');
      expect(result).toEqual([]);
      expect(mockKakaoLocalService.searchKeyword).not.toHaveBeenCalled();
    });

    it('should return empty array if query is empty', async () => {
      const result = await service.suggest('');
      expect(result).toEqual([]);
      expect(mockKakaoLocalService.searchKeyword).not.toHaveBeenCalled();
    });

    it('should normalize query (trim and lowercase)', async () => {
      mockCacheManager.get.mockResolvedValue(null);
      mockKakaoLocalService.searchKeyword.mockResolvedValue([]);

      await service.suggest('  SEOUL  ');

      expect(mockKakaoLocalService.searchKeyword).toHaveBeenCalledWith(
        'seoul',
        10,
      );
    });

    it('should return cached result if available', async () => {
      const cachedResult = [
        {
          placeId: '1',
          name: 'Cached Place',
          address: 'Cached Address',
          lat: 37.5665,
          lng: 126.9780,
        },
      ];
      mockCacheManager.get.mockResolvedValue(cachedResult);

      const result = await service.suggest('seoul');

      expect(result).toEqual(cachedResult);
      expect(mockKakaoLocalService.searchKeyword).not.toHaveBeenCalled();
    });

    it('should limit results to 10', async () => {
      mockCacheManager.get.mockResolvedValue(null);
      const manyResults = Array.from({ length: 15 }, (_, i) => ({
        placeId: `${i}`,
        name: `Place ${i}`,
        address: `Address ${i}`,
        lat: 37.5665,
        lng: 126.9780,
      }));
      mockKakaoLocalService.searchKeyword.mockResolvedValue(manyResults);

      const result = await service.suggest('seoul');

      expect(result.length).toBe(10);
      expect(mockCacheManager.set).toHaveBeenCalledWith(
        expect.any(String),
        expect.arrayContaining([]),
        60000,
      );
    });
  });
});

