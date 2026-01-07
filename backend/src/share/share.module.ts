import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { ShareController } from './share.controller';
import { ShareService } from './share.service';
import { Share } from './entities/share.entity';
import { User } from '../auth/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Share, User]), ThrottlerModule],
  controllers: [ShareController],
  providers: [ShareService],
})
export class ShareModule {}

