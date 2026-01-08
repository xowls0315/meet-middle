import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { RecommendService } from './recommend.service';
import { KakaoLocalService } from '../kakao-local/kakao-local.service';

describe('RecommendService', () => {
  let service: RecommendService;
  let kakaoLocalService: KakaoLocalService;
  let cacheManager: any;

  const mockKakaoLocalService = {
    searchCategory: jest.fn(),
  };

  const mockCacheManager = {
    get: jest.fn(),
    set: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecommendService,
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

    service = module.get<RecommendService>(RecommendService);
    kakaoLocalService = module.get<KakaoLocalService>(KakaoLocalService);
    cacheManager = module.get(CACHE_MANAGER);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('recommend', () => {
    const validParticipants = [
      { label: 'A', lat: 37.5665, lng: 126.9780 },
      { label: 'B', lat: 37.5651, lng: 126.9895 },
    ];

    it('should validate participants count (2-4)', async () => {
      const invalidParticipants = [{ label: 'A', lat: 37.5665, lng: 126.9780 }];
      await expect(service.recommend(invalidParticipants)).rejects.toThrow(
        '참가자는 2~4명이어야 합니다',
      );
    });

    it('should validate duplicate labels', async () => {
      const invalidParticipants = [
        { label: 'A', lat: 37.5665, lng: 126.9780 },
        { label: 'A', lat: 37.5651, lng: 126.9895 },
      ];
      await expect(service.recommend(invalidParticipants)).rejects.toThrow(
        '참가자 라벨은 중복될 수 없습니다',
      );
    });

    it('should validate label range (A-D)', async () => {
      const invalidParticipants = [
        { label: 'E', lat: 37.5665, lng: 126.9780 },
        { label: 'F', lat: 37.5651, lng: 126.9895 },
      ];
      await expect(service.recommend(invalidParticipants)).rejects.toThrow(
        '참가자 라벨은 A, B, C, D 중 하나여야 합니다',
      );
    });

    it('should calculate anchor correctly', async () => {
      mockCacheManager.get.mockResolvedValue(null);
      mockKakaoLocalService.searchCategory.mockResolvedValue([
        {
          placeId: '1',
          name: 'Test Place',
          address: 'Test Address',
          lat: 37.5658,
          lng: 126.9837,
          distance: 100,
        },
      ]);

      const result = await service.recommend(validParticipants);

      expect(result.anchor.lat).toBeCloseTo(37.5658, 4);
      expect(result.anchor.lng).toBeCloseTo(126.9837, 4);
    });

    it('should return cached result if available', async () => {
      const cachedResult = {
        anchor: { lat: 37.5658, lng: 126.9837 },
        final: { placeId: '1', name: 'Cached', address: 'Addr', lat: 37.5, lng: 126.9 },
        candidates: [],
        used: { category: 'SW8', radius: 2000 },
      };
      mockCacheManager.get.mockResolvedValue(cachedResult);

      const result = await service.recommend(validParticipants);

      expect(result).toEqual(cachedResult);
      expect(mockKakaoLocalService.searchCategory).not.toHaveBeenCalled();
    });

    it('should follow fallback logic (SW8 -> CT1 -> PO3 -> AT4)', async () => {
      mockCacheManager.get.mockResolvedValue(null);
      mockKakaoLocalService.searchCategory
        .mockResolvedValueOnce([]) // SW8, 2000m 실패
        .mockResolvedValueOnce([]) // SW8, 5000m 실패
        .mockResolvedValueOnce([]) // SW8, 10000m 실패
        .mockResolvedValueOnce([]) // SW8, 20000m 실패
        .mockResolvedValueOnce([
          {
            placeId: '1',
            name: 'CT1 Place',
            address: 'CT1 Address',
            lat: 37.5658,
            lng: 126.9837,
            distance: 500,
          },
        ]); // CT1, 2000m 성공

      const result = await service.recommend(validParticipants);

      expect(result.final).toBeTruthy();
      expect(result.used?.category).toBe('CT1');
      expect(result.used?.radius).toBe(2000);
      expect(mockKakaoLocalService.searchCategory).toHaveBeenCalledTimes(5);
    });

    it('should respect MAX_ATTEMPTS limit', async () => {
      mockCacheManager.get.mockResolvedValue(null);
      mockKakaoLocalService.searchCategory.mockResolvedValue([]);

      const result = await service.recommend(validParticipants);

      expect(result.final).toBeNull();
      expect(result.candidates).toEqual([]);
      expect(mockKakaoLocalService.searchCategory).toHaveBeenCalledTimes(16); // MAX_ATTEMPTS
    });
  });
});

