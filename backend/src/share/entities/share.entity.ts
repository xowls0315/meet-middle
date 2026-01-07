import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';

@Entity('shares')
@Index(['expiresAt'])
export class Share {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  shareId: string;

  @Column('jsonb')
  data: {
    anchor: { lat: number; lng: number };
    participants: Array<{ label: string; lat: number; lng: number }>;
    final: {
      placeId: string;
      name: string;
      address: string;
      lat: number;
      lng: number;
      placeUrl?: string;
      distance?: number;
    };
    candidates: Array<{
      placeId: string;
      name: string;
      address: string;
      lat: number;
      lng: number;
      placeUrl?: string;
      distance?: number;
    }>;
    used?: { category: string; radius: number };
  };

  @Column({ nullable: true })
  userId: string | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'userId' })
  user: User | null;

  @CreateDateColumn()
  createdAt: Date;

  @Column()
  expiresAt: Date;
}

