import { Controller, Get, Post, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AchievementsService } from './achievements.service';

@Controller('achievements')
export class AchievementsController {
  constructor(private achievementsService: AchievementsService) {}

  @Get()
  findAll() {
    return this.achievementsService.findAll();
  }

  @Get('user')
  @UseGuards(JwtAuthGuard)
  getUserAchievements(@Request() req) {
    return this.achievementsService.getUserAchievements(req.user.id);
  }

  @Post('check')
  @UseGuards(JwtAuthGuard)
  checkAchievements(@Request() req) {
    return this.achievementsService.checkAndUnlock(req.user.id);
  }
}