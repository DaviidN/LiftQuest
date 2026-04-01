import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        totalXP: true,
        createdAt: true,
        _count: {
          select: {
            workouts: true,
            unlockedAchievements: true,
          },
        },
      },
    });

    return user;
  }

  async updateXP(userId: string, xpToAdd: number) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        totalXP: {
          increment: xpToAdd,
        },
      },
    });
  }

  async getStats(userId: string) {
    const workouts = await this.prisma.workout.findMany({
      where: { userId },
      include: {
        exercises: {
          include: {
            sets: true,
          },
        },
      },
      orderBy: { date: 'desc' },
    });

    const strengthWorkouts = workouts.filter(w => w.type === 'strength');
    const airbikeWorkouts = workouts.filter(w => w.type === 'airbike');

    // Calculate current streak
    let currentStreak = 0;
    if (workouts.length > 0) {
      const sorted = [...workouts].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      let lastDate = new Date(sorted[0].date);
      
      for (const workout of sorted) {
        const workoutDate = new Date(workout.date);
        const diff = Math.floor((lastDate.getTime() - workoutDate.getTime()) / (1000 * 60 * 60 * 24));
        if (diff <= 1) {
          currentStreak++;
          lastDate = workoutDate;
        } else {
          break;
        }
      }
    }

    return {
      totalWorkouts: workouts.length,
      strengthWorkouts: strengthWorkouts.length,
      airbikeWorkouts: airbikeWorkouts.length,
      currentStreak,
    };
  }
}