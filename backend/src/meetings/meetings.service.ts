import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
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
    // 데이터 최소화: final만 저장 (candidates, participants 저장 안 함)
    const normalizedData = {
      final: {
        ...createMeetingDto.final,
        // 좌표 소수점 6자리 제한
        lat: Number(createMeetingDto.final.lat.toFixed(6)),
        lng: Number(createMeetingDto.final.lng.toFixed(6)),
      },
      participantCount: createMeetingDto.participantCount,
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

