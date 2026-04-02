import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
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
    let xpEarned = 0; // Base XP
    let newPR = false; 
    
    if (dto.type === 'strength' && dto.exercises) {
      xpEarned += dto.exercises.length * 10;

      // Check for PRs
      for (const exercise of dto.exercises) {
        const maxWeight = Math.max(...exercise.sets.map(s => s.weight));
        
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
            const previousMax = Math.max(...ex.sets.map(s => s.weight));
            if (previousMax > previousBest) previousBest = previousMax;
          }
        }

        if (maxWeight > previousBest && previousBest > 0) {
          xpEarned += 20;
          newPR = true;
        }

        // Base XP based on intensity for each set
        for (const set of exercise.sets) {
          const estimated1RM = this.calculate1RM([set]);
          const intensity = set.weight / estimated1RM;

          let setXP = set.weight * set.reps * (1 + intensity);

          // Bonus for heavy singles/doubles/triples
          if (set.reps <= 3) {
            setXP *= 1.3;
          }

          xpEarned += Math.floor(setXP / 10);

      }
    }
    } else {
      // Airbike XP based on calories, time, and intensity
      const calPerMin = dto.calories! / (dto.time! / 60);
      const airBikeXP = dto.calories! * 0.5 + calPerMin * 5 + dto.time! * 0.2;
      xpEarned = Math.floor(airBikeXP / 10); // Scale down for balance
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
        prAchieved: newPR,
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
    if (sets.length === 0) return 0;

    const { weight, reps } = sets[0];
    if (reps === 1) return weight;
    return Math.round(weight * (1 + reps / 30)); 
  }
}