import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  Index,
  BeforeInsert,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

@Entity('shares')
@Index(['expiresAt'])
export class Share {
  @PrimaryColumn('uuid')
  id: string;

  @BeforeInsert()
  generateId() {
    if (!this.id) this.id = uuidv4();
  }

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
    userName?: string; // 로그인한 사용자가 공유한 경우 저장
  };

  @CreateDateColumn()
  createdAt: Date;

  @Column()
  expiresAt: Date;
}

