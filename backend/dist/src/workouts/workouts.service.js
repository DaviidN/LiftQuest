"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkoutsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const users_service_1 = require("../users/users.service");
let WorkoutsService = class WorkoutsService {
    prisma;
    usersService;
    constructor(prisma, usersService) {
        this.prisma = prisma;
        this.usersService = usersService;
    }
    async create(userId, dto) {
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];
        const minPastDate = new Date(now);
        minPastDate.setDate(now.getDate() - 7);
        const minPastStr = minPastDate.toISOString().split('T')[0];
        if (dto.date > todayStr) {
            throw new common_1.BadRequestException('Workout date cannot be in the future.');
        }
        if (dto.date < minPastStr) {
            throw new common_1.BadRequestException('Workout date cannot be more than 7 days in the past.');
        }
        const dayStart = new Date(dto.date);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(dto.date);
        dayEnd.setHours(23, 59, 59, 999);
        const workoutsToday = await this.prisma.workout.count({
            where: {
                userId,
                date: { gte: dayStart, lte: dayEnd },
            },
        });
        if (workoutsToday >= 5) {
            throw new common_1.BadRequestException('You can log a maximum of 5 workouts per day.');
        }
        let xpEarned = 0;
        let newPR = false;
        if (dto.type === 'strength' && dto.exercises) {
            xpEarned += dto.exercises.length * 10;
            for (const exercise of dto.exercises) {
                const maxWeight = Math.max(...exercise.sets.map(s => s.weight));
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
                        if (previousMax > previousBest)
                            previousBest = previousMax;
                    }
                }
                if (maxWeight > previousBest && previousBest > 0) {
                    xpEarned += 20;
                    newPR = true;
                }
                for (const set of exercise.sets) {
                    const estimated1RM = this.calculate1RM([set]);
                    const intensity = set.weight / estimated1RM;
                    let setXP = set.weight * set.reps * (1 + intensity);
                    if (set.reps <= 3) {
                        setXP *= 1.3;
                    }
                    xpEarned += Math.floor(setXP / 10);
                }
            }
        }
        else {
            const calPerMin = dto.calories / (dto.time / 60);
            const cardioXP = dto.calories * 0.5 + calPerMin * 5 + dto.time * 0.2;
            xpEarned = Math.floor(cardioXP / 10);
        }
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
        await this.usersService.updateXP(userId, xpEarned);
        return workout;
    }
    async findAll(userId) {
        return this.prisma.workout.findMany({
            where: { userId },
            include: {
                exercises: {
                    include: {
                        sets: true,
                    },
                },
            },
            orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
        });
    }
    async findOne(userId, workoutId) {
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
    async delete(userId, workoutId) {
        const workout = await this.prisma.workout.findFirst({
            where: { id: workoutId, userId },
        });
        if (workout) {
            await this.usersService.updateXP(userId, -workout.xpEarned);
            await this.prisma.workout.delete({
                where: { id: workoutId },
            });
        }
        return { deleted: true };
    }
    async getVolumeData(userId, days = 30) {
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
            volume: workout.exercises.reduce((sum, ex) => sum + ex.sets.reduce((s, set) => s + (set.weight * set.reps), 0), 0),
        }));
    }
    calculate1RM(sets) {
        if (sets.length === 0)
            return 0;
        const { weight, reps } = sets[0];
        if (reps === 1)
            return weight;
        return Math.round(weight * (1 + reps / 30));
    }
};
exports.WorkoutsService = WorkoutsService;
exports.WorkoutsService = WorkoutsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        users_service_1.UsersService])
], WorkoutsService);
//# sourceMappingURL=workouts.service.js.map