import { Test, TestingModule } from '@nestjs/testing';
import { WorkoutsService } from './workouts.service';
import { PrismaService } from 'prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { BadRequestException } from '@nestjs/common';

const mockPrisma = {
  workout: {
    count: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
  },
};

const mockUsersService = {
  updateXP: jest.fn(),
};

const TODAY = new Date().toISOString().split('T')[0];

describe('WorkoutsService', () => {
  let service: WorkoutsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkoutsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: UsersService, useValue: mockUsersService },
      ],
    }).compile();

    service = module.get<WorkoutsService>(WorkoutsService);

    jest.resetAllMocks();
  });

  describe('create', () => {
    describe('date validation', () => {
      it('should throw when date is in the future', async () => {
        const futureDate = new Date(Date.now() + 86400000).toISOString().split('T')[0];

        await expect(
          service.create('user-1', { date: futureDate, type: 'cardio', calories: 300, time: 30 }),
        ).rejects.toThrow(BadRequestException);
      });

      it('should throw when date is more than 7 days in the past', async () => {
        const oldDate = new Date(Date.now() - 8 * 86400000).toISOString().split('T')[0];

        await expect(
          service.create('user-1', { date: oldDate, type: 'cardio', calories: 300, time: 30 }),
        ).rejects.toThrow(BadRequestException);
      });
    });

    describe('rate limiting', () => {
      it('should throw when user already has 5 workouts today', async () => {
        mockPrisma.workout.count.mockResolvedValue(5);

        await expect(
          service.create('user-1', { date: TODAY, type: 'cardio', calories: 300, time: 30 }),
        ).rejects.toThrow(BadRequestException);
      });
    });

    describe('cardio workout', () => {
      it('should create a cardio workout and update XP', async () => {
        mockPrisma.workout.count.mockResolvedValue(0);
        const created = { id: 'w-1', type: 'cardio', xpEarned: 10, exercises: [] };
        mockPrisma.workout.create.mockResolvedValue(created);

        const result = await service.create('user-1', {
          date: TODAY,
          type: 'cardio',
          calories: 300,
          time: 30,
        });

        expect(mockPrisma.workout.create).toHaveBeenCalled();
        expect(mockUsersService.updateXP).toHaveBeenCalledWith('user-1', expect.any(Number));
        expect(result).toBe(created);
      });
    });

    describe('strength workout', () => {
      const strengthDto = {
        date: TODAY,
        type: 'strength',
        exercises: [
          {
            name: 'Squat',
            sets: [
              { weight: 100, reps: 5 },
              { weight: 110, reps: 3 },
            ],
          },
        ],
      };

      it('should create a strength workout without a PR when no previous workouts exist', async () => {
        mockPrisma.workout.count.mockResolvedValue(0);
        mockPrisma.workout.findMany.mockResolvedValue([]);
        const created = { id: 'w-2', type: 'strength', xpEarned: 50, prAchieved: false, exercises: [] };
        mockPrisma.workout.create.mockResolvedValue(created);

        await service.create('user-1', strengthDto);

        expect(mockPrisma.workout.create).toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({ prAchieved: false }),
          }),
        );
      });

      it('should detect a PR and award bonus XP when new max exceeds previous best', async () => {
        mockPrisma.workout.count.mockResolvedValue(0);
        mockPrisma.workout.findMany.mockResolvedValue([
          {
            exercises: [
              { name: 'Squat', sets: [{ weight: 80, reps: 5 }] },
            ],
          },
        ]);
        mockPrisma.workout.create.mockResolvedValue({ id: 'w-3', exercises: [] });

        await service.create('user-1', strengthDto);

        expect(mockPrisma.workout.create).toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({ prAchieved: true }),
          }),
        );
      });

      it('should not flag PR when new max does not exceed previous best', async () => {
        mockPrisma.workout.count.mockResolvedValue(0);
        mockPrisma.workout.findMany.mockResolvedValue([
          {
            exercises: [
              { name: 'Squat', sets: [{ weight: 150, reps: 5 }] },
            ],
          },
        ]);
        mockPrisma.workout.create.mockResolvedValue({ id: 'w-4', exercises: [] });

        await service.create('user-1', strengthDto);

        expect(mockPrisma.workout.create).toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({ prAchieved: false }),
          }),
        );
      });
    });
  });

  describe('delete', () => {
    it('should subtract XP and delete the workout', async () => {
      mockPrisma.workout.findFirst.mockResolvedValue({ id: 'w-1', xpEarned: 50 });
      mockPrisma.workout.delete.mockResolvedValue({});

      const result = await service.delete('user-1', 'w-1');

      expect(mockUsersService.updateXP).toHaveBeenCalledWith('user-1', -50);
      expect(mockPrisma.workout.delete).toHaveBeenCalledWith({ where: { id: 'w-1' } });
      expect(result).toEqual({ deleted: true });
    });

    it('should return deleted true without touching XP when workout is not found', async () => {
      mockPrisma.workout.findFirst.mockResolvedValue(null);

      const result = await service.delete('user-1', 'nonexistent');

      expect(mockUsersService.updateXP).not.toHaveBeenCalled();
      expect(mockPrisma.workout.delete).not.toHaveBeenCalled();
      expect(result).toEqual({ deleted: true });
    });
  });

  describe('findAll', () => {
    it('should return all workouts for the user', async () => {
      const workouts = [{ id: 'w-1' }, { id: 'w-2' }];
      mockPrisma.workout.findMany.mockResolvedValue(workouts);

      const result = await service.findAll('user-1');

      expect(mockPrisma.workout.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { userId: 'user-1' } }),
      );
      expect(result).toBe(workouts);
    });
  });

  describe('findOne', () => {
    it('should return a single workout', async () => {
      const workout = { id: 'w-1' };
      mockPrisma.workout.findFirst.mockResolvedValue(workout);

      const result = await service.findOne('user-1', 'w-1');

      expect(result).toBe(workout);
    });
  });
});
