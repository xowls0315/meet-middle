import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { ShareController } from './share.controller';
import { ShareService } from './share.service';
import { Share } from './entities/share.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Share]),
    ThrottlerModule,
    AuthModule, // OptionalJwtAuthGuard가 JwtStrategy를 사용하기 위해 필요
  ],
  controllers: [ShareController],
  providers: [ShareService],
})
export class ShareModule {}

