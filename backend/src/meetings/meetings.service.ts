import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Meeting } from './entities/meeting.entity';

interface MeetingData {
  final: {
    placeId: string;
    name: string;
    address: string;
    lat: number;
    lng: number;
    placeUrl: string;
    distance?: number;
  };
  participantCount: number;
  participants: Array<{
    label: string;
    name: string;
    address?: string;
  }>;
}

@Injectable()
export class MeetingsService {
  constructor(
    @InjectRepository(Meeting)
    private meetingRepository: Repository<Meeting>,
  ) {}

  async create(
    userId: string,
    createMeetingDto: MeetingData,
  ): Promise<{ id: string; createdAt: string }> {
    // participants 배열 길이와 participantCount 검증
    if (createMeetingDto.participants.length !== createMeetingDto.participantCount) {
      throw new BadRequestException(
        `participants 배열 길이(${createMeetingDto.participants.length})가 participantCount(${createMeetingDto.participantCount})와 일치하지 않습니다.`,
      );
    }

    // 데이터 최소화 및 정규화
    const normalizedData = {
      final: {
        ...createMeetingDto.final,
        // 좌표 소수점 6자리 제한
        lat: Number(createMeetingDto.final.lat.toFixed(6)),
        lng: Number(createMeetingDto.final.lng.toFixed(6)),
      },
      participantCount: createMeetingDto.participantCount,
      participants: createMeetingDto.participants.map((p) => ({
        label: p.label,
        name: p.name,
        ...(p.address ? { address: p.address } : {}),
      })),
    };

    const meeting = this.meetingRepository.create({
      userId,
      data: normalizedData,
    });

    const saved = await this.meetingRepository.save(meeting);

    return {
      id: saved.id,
      createdAt: saved.createdAt.toISOString(),
    };
  }

  async findAll(userId: string): Promise<
    Array<{
      id: string;
      createdAt: string;
      final: {
        placeId: string;
        name: string;
        address: string;
        lat: number;
        lng: number;
        placeUrl: string;
        distance?: number;
      };
      participantCount: number;
      participants: Array<{
        label: string;
        name: string;
        address?: string;
      }>;
    }>
  > {
    const meetings = await this.meetingRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });

    return meetings.map((meeting) => ({
      id: meeting.id,
      createdAt: meeting.createdAt.toISOString(),
      final: meeting.data.final,
      participantCount: meeting.data.participantCount,
      // 기존 데이터 호환성을 위해 participants가 없으면 빈 배열 반환
      participants: meeting.data.participants || [],
    }));
  }

  async remove(userId: string, id: string): Promise<void> {
    const meeting = await this.meetingRepository.findOne({
      where: { id },
    });

    if (!meeting) {
      throw new NotFoundException('기록을 찾을 수 없습니다.');
    }

    if (meeting.userId !== userId) {
      throw new ForbiddenException('권한이 없습니다.');
    }

    await this.meetingRepository.remove(meeting);
  }
}

