import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { UsersService } from '../users/users.service';

const ACHIEVEMENTS = [
  { code: 'FIRST_WORKOUT', name: 'First Blood', description: 'First workout', icon: '🥇', xp: 50 },
  { code: 'THREE_IN_WEEK', name: 'Consistency', description: '3 workouts in a week', icon: '📅', xp: 100 },
  { code: 'NEW_PR', name: 'Stronger', description: 'New personal record', icon: '⚡', xp: 150 },
  { code: 'PR_MADNESS', name: 'PR Madness', description: '5 new PRs in a month', icon: '🏆', xp: 500 },
  { code: 'STREAK_7', name: 'On Fire', description: '7 days in a row', icon: '🔥', xp: 250 },
  { code: 'TOTAL_100', name: 'Century', description: '100 workouts total', icon: '💯', xp: 10000 },
  { code: 'CARDIO_BEAST', name: 'Cardio King', description: '10 cardio workouts', icon: '🚴', xp: 400},
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

    // New PR
    const hasNewPR = workouts.some(w => w.type === 'strength' && w.prAchieved);
    if (hasNewPR && !unlockedCodes.includes('NEW_PR')) {
      await this.unlockAchievement(userId, 'NEW_PR');
      unlocked.push('NEW_PR');
    }

    // 5 PRs in a month
    const lastMonthPRs = workouts
      .filter(w => {
        const diff = Date.now() - new Date(w.date).getTime();
        return w.type === 'strength' && w.prAchieved && diff < 30 * 24 * 60 * 60 * 1000;
      });

    if (lastMonthPRs.length >= 5 && !unlockedCodes.includes('PR_MADNESS')) {
      await this.unlockAchievement(userId, 'PR_MADNESS');
      unlocked.push('PR_MADNESS');
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

    // Check CARDIO_BEAST
    const cardioCount = workouts.filter(w => w.type === 'cardio').length;
    if (cardioCount >= 10 && !unlockedCodes.includes('CARDIO_BEAST')) {
      await this.unlockAchievement(userId, 'CARDIO_BEAST');
      unlocked.push('CARDIO_BEAST');
    }

    // Check STREAK_7
    let streak = 0;
    if (workouts.length > 0) {
      const sorted = [...workouts].sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      streak = 1;
      let lastDate = new Date(sorted[0].date);

      for (let i = 1; i < sorted.length; i++) {
        const workoutDate = new Date(sorted[i].date);
        const diff = Math.floor((lastDate.getTime() - workoutDate.getTime()) / (1000 * 60 * 60 * 24));
        if (diff === 1) {
          streak++;
          lastDate = workoutDate;
        } else if (diff > 1) {
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