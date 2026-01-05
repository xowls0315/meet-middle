import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';

@Entity('meetings')
export class Meeting {
  @PrimaryGeneratedColumn('uuid')
  id: string;

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
  };

  @CreateDateColumn()
  createdAt: Date;
}

