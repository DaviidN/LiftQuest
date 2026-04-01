import { Module } from '@nestjs/common';
import { AchievementsController } from './achievements.controller';
import { AchievementsService } from './achievements.service';
import { UsersModule } from '../users/users.module';

@Module({
  controllers: [AchievementsController],
  providers: [AchievementsService],
  imports: [UsersModule],
})
export class AchievementsModule {}