import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../users/users.service';
import { PrismaService } from 'prisma/prisma.service';
import { AchievementsService } from './achievements.service';

const mockPrisma = {
    achievement: {
      findUnique: jest.fn(),
    },
    userAchievement: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn()
    },
    
    workout: {
        findMany: jest.fn()
    }
}

const mockUsersService = {
    updateXP: jest.fn(),
};

describe('AchievementsService', () => {
    let service: AchievementsService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AchievementsService,
                { provide: PrismaService, useValue: mockPrisma },
                { provide: UsersService, useValue: mockUsersService },
            ],
        }).compile();

        service = module.get<AchievementsService>(AchievementsService);
        
        jest.resetAllMocks();
    });

    describe('checkAndUnlock', () => {
        const userId = '1';

        it('should unlock FIRST_WORKOUT achievement', async () => {

            mockPrisma.workout.findMany.mockResolvedValueOnce([
                {
                    'id': '1',
                    'type': 'cardio',
                    'date': new Date(),
                    userId,
                    prAChieved: false
                }
            ]);

            mockPrisma.userAchievement.findMany.mockResolvedValueOnce([]);

            mockPrisma.achievement.findUnique.mockResolvedValueOnce(
            {
                id: 'ach1',
                code: 'FIRST_WORKOUT',
                xp: 50 
            });
            mockPrisma.userAchievement.create.mockResolvedValueOnce({});       
            mockUsersService.updateXP.mockResolvedValueOnce({});

            await service.checkAndUnlock(userId);

            expect(mockPrisma.userAchievement.create).toHaveBeenCalledWith(
                {
                    data: {
                        userId,
                        achievementId: 'ach1'
                    }
                }
            );
        })

        it('should not unlock FIRST_WORKOUT achievement if already unlocked', async () => {

            mockPrisma.workout.findMany.mockResolvedValueOnce([
                {
                    'id': '1',
                    'type': 'cardio',
                    'date': new Date(),
                    userId,
                    prAChieved: false
                }
            ]);

            mockPrisma.userAchievement.findMany.mockResolvedValueOnce([
                {
                    userId,
                    achievementId: 'ach1',
                    achievement: {
                        code: 'FIRST_WORKOUT'
                    }
                }
            ]);

            await service.checkAndUnlock(userId);

            expect(mockPrisma.userAchievement.create).not.toHaveBeenCalled();
        });

        it('should unlock THREE_IN_WEEK achievement', async () => {
            mockPrisma.workout.findMany.mockResolvedValueOnce([
                {
                    'id': '1',
                    'type': 'cardio',
                    'date': new Date(),
                    userId,
                    prAChieved: false
                },
                {
                    'id': '2',
                    'type': 'strength',
                    'date': new Date(),
                    userId,
                    prAChieved: false
                },
                {
                    'id': '3',
                    'type': 'cardio',
                    'date': new Date(),
                    userId,
                    prAChieved: false
                }
            ]);

             mockPrisma.userAchievement.findMany.mockResolvedValueOnce([]);

            mockPrisma.achievement.findUnique.mockResolvedValueOnce(
            {
                id: 'ach2',
                code: 'THREE_IN_WEEK',
                xp: 100
            });
            mockPrisma.userAchievement.create.mockResolvedValueOnce({});       
            mockUsersService.updateXP.mockResolvedValueOnce({});

            await service.checkAndUnlock(userId);

            expect(mockPrisma.userAchievement.create).toHaveBeenCalledWith(
                {
                    data: {
                        userId,
                        achievementId: 'ach2'
                    }
                }
            );
        });

        it('should not unlock THREE_IN_WEEK achievement if not enough workouts', async () => {
            mockPrisma.workout.findMany.mockResolvedValueOnce([{
                    'id': '1',
                    'type': 'cardio',
                    'date': new Date(),
                    userId,
                    prAChieved: false
                },
                {
                    'id': '2',
                    'type': 'strength',
                    'date': new Date(),
                    userId,
                    prAChieved: false
                }]);
                
            mockPrisma.userAchievement.findMany.mockResolvedValueOnce([]);

            await service.checkAndUnlock(userId);
            expect(mockPrisma.userAchievement.create).not.toHaveBeenCalled();
        });

        it('should unlock STREAK_7 achievement', async () => {
            const today = new Date();

            const workouts = Array.from({ length: 7 }, (_, i) => {
                const date = new Date(today);
                date.setDate(today.getDate() - i);
                return { id: String(i + 1), type: 'cardio', date, userId, prAchieved: false };
            });

            mockPrisma.workout.findMany.mockResolvedValueOnce(workouts);
            mockPrisma.userAchievement.findMany.mockResolvedValueOnce([        
                { userId, 
                  achievementId: 'ach2',
                  achievement: { code: 'THREE_IN_WEEK' }
                }
            ]);

            mockPrisma.achievement.findUnique.mockResolvedValueOnce(
            {
                id: 'ach3',
                code: 'STREAK_7',
                xp: 200
            });
            
            mockPrisma.userAchievement.create.mockResolvedValueOnce({});       
            mockUsersService.updateXP.mockResolvedValueOnce({});

            await service.checkAndUnlock(userId);

            expect(mockPrisma.userAchievement.create).toHaveBeenCalledWith(
                {
                    data: {
                        userId,
                        achievementId: 'ach3'
                    }
                }
            );
        });

        it('should return empty array if no achievements unlocked', async () => {
            mockPrisma.workout.findMany.mockResolvedValueOnce([]);
            mockPrisma.userAchievement.findMany.mockResolvedValueOnce([]);

            const result = await service.checkAndUnlock(userId);

            expect(result).toEqual([]);
            expect(mockPrisma.userAchievement.create).not.toHaveBeenCalled();
        });
    });
});