import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';

const ACHIEVEMENTS = [
  { code: 'FIRST_WORKOUT', name: 'First Blood', description: 'Complete your first workout', icon: '🥉', xp: 50 },
  { code: 'THREE_IN_WEEK', name: 'Consistency', description: '3 workouts in a week', icon: '🥈', xp: 100 },
  { code: 'NEW_PR', name: 'Stronger', description: 'Set a new personal record', icon: '🔥', xp: 150 },
  { code: 'STREAK_7', name: 'On Fire', description: '7 day workout streak', icon: '⚡', xp: 200 },
  { code: 'TOTAL_100', name: 'Century', description: '100 total workouts', icon: '💯', xp: 500 },
  { code: 'AIRBIKE_BEAST', name: 'Cardio King', description: '10 airbike workouts', icon: '🚴', xp: 150 },
];

@Injectable()
export class AchievementsService implements OnModuleInit {
  constructor(
    private prisma: PrismaService,
    private usersService: UsersService,
  ) {}

  async onModuleInit() {
    // Seed achievements on startup
    for (const achievement of ACHIEVEMENTS) {
      await this.prisma.achievement.upsert({
        where: { code: achievement.code },
        update: achievement,
        create: achievement,
      });
    }
  }

  async findAll() {
    return this.prisma.achievement.findMany();
  }

  async getUserAchievements(userId: string) {
    return this.prisma.userAchievement.findMany({
      where: { userId },
      include: {
        achievement: true,
      },
      orderBy: { unlockedAt: 'desc' },
    });
  }

  async checkAndUnlock(userId: string) {
    const unlocked: string[] = [];

    // Get user's workouts
    const workouts = await this.prisma.workout.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
    });

    // Get already unlocked achievements
    const userAchievements = await this.prisma.userAchievement.findMany({
      where: { userId },
      include: { achievement: true },
    });

    const unlockedCodes = userAchievements.map(ua => ua.achievement.code);

    // Check FIRST_WORKOUT
    if (workouts.length === 1 && !unlockedCodes.includes('FIRST_WORKOUT')) {
      await this.unlockAchievement(userId, 'FIRST_WORKOUT');
      unlocked.push('FIRST_WORKOUT');
    }

    // Check THREE_IN_WEEK
    const lastWeek = workouts.filter(w => {
      const diff = Date.now() - new Date(w.date).getTime();
      return diff < 7 * 24 * 60 * 60 * 1000;
    });
    if (lastWeek.length >= 3 && !unlockedCodes.includes('THREE_IN_WEEK')) {
      await this.unlockAchievement(userId, 'THREE_IN_WEEK');
      unlocked.push('THREE_IN_WEEK');
    }

    // Check TOTAL_100
    if (workouts.length >= 100 && !unlockedCodes.includes('TOTAL_100')) {
      await this.unlockAchievement(userId, 'TOTAL_100');
      unlocked.push('TOTAL_100');
    }

    // Check AIRBIKE_BEAST
    const airbikeCount = workouts.filter(w => w.type === 'airbike').length;
    if (airbikeCount >= 10 && !unlockedCodes.includes('AIRBIKE_BEAST')) {
      await this.unlockAchievement(userId, 'AIRBIKE_BEAST');
      unlocked.push('AIRBIKE_BEAST');
    }

    // Check STREAK_7
    let streak = 0;
    if (workouts.length > 0) {
      const sorted = [...workouts].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      let lastDate = new Date(sorted[0].date);
      
      for (const workout of sorted) {
        const workoutDate = new Date(workout.date);
        const diff = Math.floor((lastDate.getTime() - workoutDate.getTime()) / (1000 * 60 * 60 * 24));
        if (diff <= 1) {
          streak++;
          lastDate = workoutDate;
        } else {
          break;
        }
      }
    }
    if (streak >= 7 && !unlockedCodes.includes('STREAK_7')) {
      await this.unlockAchievement(userId, 'STREAK_7');
      unlocked.push('STREAK_7');
    }

    return unlocked;
  }

  private async unlockAchievement(userId: string, code: string) {
    const achievement = await this.prisma.achievement.findUnique({
      where: { code },
    });

    if (!achievement) return;

    // Create user achievement
    await this.prisma.userAchievement.create({
      data: {
        userId,
        achievementId: achievement.id,
      },
    });

    // Add XP bonus
    await this.usersService.updateXP(userId, achievement.xp);
  }
}