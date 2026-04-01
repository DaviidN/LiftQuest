import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { CreateWorkoutDto } from './dto/create-workout.dto';

@Injectable()
export class WorkoutsService {
  constructor(
    private prisma: PrismaService,
    private usersService: UsersService,
  ) {}

  async create(userId: string, dto: CreateWorkoutDto) {
    // Calculate XP
    let xpEarned = 50; // Base XP

    if (dto.type === 'strength' && dto.exercises) {
      xpEarned += dto.exercises.length * 10;

      // Check for PRs
      for (const exercise of dto.exercises) {
        const best1RM = this.calculate1RM(exercise.sets);
        
        // Get previous best for this exercise
        const previousWorkouts = await this.prisma.workout.findMany({
          where: {
            userId,
            type: 'strength',
          },
          include: {
            exercises: {
              where: {
                name: exercise.name,
              },
              include: {
                sets: true,
              },
            },
          },
        });

        let previousBest = 0;
        for (const workout of previousWorkouts) {
          for (const ex of workout.exercises) {
            const rm = this.calculate1RM(ex.sets);
            if (rm > previousBest) previousBest = rm;
          }
        }

        if (best1RM > previousBest && previousBest > 0) {
          xpEarned += 20; // PR bonus
        }
      }
    } else {
      xpEarned += 30; // Cardio bonus
    }

    // Create workout
    const workout = await this.prisma.workout.create({
      data: {
        userId,
        date: new Date(dto.date),
        type: dto.type,
        xpEarned,
        time: dto.time,
        calories: dto.calories,
        distance: dto.distance,
        exercises: dto.exercises ? {
          create: dto.exercises.map(ex => ({
            name: ex.name,
            sets: {
              create: ex.sets,
            },
          })),
        } : undefined,
      },
      include: {
        exercises: {
          include: {
            sets: true,
          },
        },
      },
    });

    // Update user XP
    await this.usersService.updateXP(userId, xpEarned);

    return workout;
  }

  async findAll(userId: string) {
    return this.prisma.workout.findMany({
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
  }

  async findOne(userId: string, workoutId: string) {
    return this.prisma.workout.findFirst({
      where: {
        id: workoutId,
        userId,
      },
      include: {
        exercises: {
          include: {
            sets: true,
          },
        },
      },
    });
  }

  async delete(userId: string, workoutId: string) {
    // Get workout to subtract XP
    const workout = await this.prisma.workout.findFirst({
      where: { id: workoutId, userId },
    });

    if (workout) {
      // Subtract XP
      await this.usersService.updateXP(userId, -workout.xpEarned);
      
      // Delete workout (exercises and sets cascade)
      await this.prisma.workout.delete({
        where: { id: workoutId },
      });
    }

    return { deleted: true };
  }

  async getVolumeData(userId: string, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const workouts = await this.prisma.workout.findMany({
      where: {
        userId,
        type: 'strength',
        date: {
          gte: startDate,
        },
      },
      include: {
        exercises: {
          include: {
            sets: true,
          },
        },
      },
      orderBy: { date: 'asc' },
    });

    return workouts.map(workout => ({
      date: workout.date.toISOString().split('T')[0],
      volume: workout.exercises.reduce((sum, ex) => 
        sum + ex.sets.reduce((s, set) => s + (set.weight * set.reps), 0), 0
      ),
    }));
  }

  private calculate1RM(sets: any[]): number {
    let max = 0;
    for (const set of sets) {
      const rm = set.reps === 1 
        ? set.weight 
        : Math.round(set.weight * (1 + set.reps / 30));
      if (rm > max) max = rm;
    }
    return max;
  }
}