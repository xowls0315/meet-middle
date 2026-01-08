import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ShareService } from './share.service';
import { Share } from './entities/share.entity';

describe('ShareService', () => {
  let service: ShareService;
  let repository: Repository<Share>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShareService,
        {
          provide: getRepositoryToken(Share),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ShareService>(ShareService);
    repository = module.get<Repository<Share>>(getRepositoryToken(Share));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should limit candidates to 10', async () => {
      const data = {
        anchor: { lat: 37.5665, lng: 126.9780 },
        participants: [{ label: 'A', lat: 37.5665, lng: 126.9780 }],
        final: {
          placeId: '1',
          name: 'Final',
          address: 'Address',
          lat: 37.5665,
          lng: 126.9780,
        },
        candidates: Array.from({ length: 15 }, (_, i) => ({
          placeId: `${i}`,
          name: `Candidate ${i}`,
          address: `Address ${i}`,
          lat: 37.5665,
          lng: 126.9780,
        })),
      };

      mockRepository.create.mockReturnValue({});
      mockRepository.save.mockResolvedValue({ shareId: 'test-id' });

      await service.create(data);

      const savedData = mockRepository.create.mock.calls[0][0];
      expect(savedData.data.candidates.length).toBe(10);
    });

    it('should round coordinates to 6 decimal places', async () => {
      const data = {
        anchor: { lat: 37.5665123456, lng: 126.9780123456 },
        participants: [{ label: 'A', lat: 37.5665123456, lng: 126.9780123456 }],
        final: {
          placeId: '1',
          name: 'Final',
          address: 'Address',
          lat: 37.5665123456,
          lng: 126.9780123456,
        },
        candidates: [],
      };

      mockRepository.create.mockReturnValue({});
      mockRepository.save.mockResolvedValue({ shareId: 'test-id' });

      await service.create(data);

      const savedData = mockRepository.create.mock.calls[0][0];
      expect(savedData.data.anchor.lat).toBe(37.566512);
      expect(savedData.data.anchor.lng).toBe(126.978012);
    });
  });

  describe('findOne', () => {
    it('should throw NotFoundException if share not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('invalid-id')).rejects.toThrow(
        '공유 링크를 찾을 수 없습니다',
      );
    });

    it('should throw NotFoundException if share expired', async () => {
      const expiredShare = {
        shareId: 'expired-id',
        data: {},
        expiresAt: new Date(Date.now() - 1000),
      };
      mockRepository.findOne.mockResolvedValue(expiredShare);
      mockRepository.remove.mockResolvedValue(expiredShare);

      await expect(service.findOne('expired-id')).rejects.toThrow(
        '공유 링크가 만료되었습니다',
      );
    });

    it('should return share data if valid', async () => {
      const shareData = {
        anchor: { lat: 37.5665, lng: 126.9780 },
        participants: [],
        final: { placeId: '1', name: 'Test', address: 'Addr', lat: 37.5, lng: 126.9 },
        candidates: [],
      };
      const share = {
        shareId: 'valid-id',
        data: shareData,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      };
      mockRepository.findOne.mockResolvedValue(share);

      const result = await service.findOne('valid-id');

      expect(result).toEqual(shareData);
    });
  });
});

