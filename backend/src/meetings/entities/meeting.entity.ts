import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  BeforeInsert,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../../auth/entities/user.entity';

@Entity('meetings')
export class Meeting {
  @PrimaryColumn('uuid')
  id: string;

  @BeforeInsert()
  generateId() {
    if (!this.id) this.id = uuidv4();
  }

  @Column('uuid')
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column('jsonb')
  data: {
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
      label: string; // "A", "B", "C", "D"
      name: string; // 장소 이름
      address?: string; // 장소 주소 (선택적)
    }>;
  };

  @CreateDateColumn()
  createdAt: Date;
}

