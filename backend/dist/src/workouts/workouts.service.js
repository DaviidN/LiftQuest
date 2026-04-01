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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkoutsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const users_service_1 = require("../users/users.service");
let WorkoutsService = class WorkoutsService {
    prisma;
    usersService;
    constructor(prisma, usersService) {
        this.prisma = prisma;
        this.usersService = usersService;
    }
    async create(userId, dto) {
        let xpEarned = 50;
        if (dto.type === 'strength' && dto.exercises) {
            xpEarned += dto.exercises.length * 10;
            for (const exercise of dto.exercises) {
                const best1RM = this.calculate1RM(exercise.sets);
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
                        if (rm > previousBest)
                            previousBest = rm;
                    }
                }
                if (best1RM > previousBest && previousBest > 0) {
                    xpEarned += 20;
                }
            }
        }
        else {
            xpEarned += 30;
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
            orderBy: { date: 'desc' },
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
        let max = 0;
        for (const set of sets) {
            const rm = set.reps === 1
                ? set.weight
                : Math.round(set.weight * (1 + set.reps / 30));
            if (rm > max)
                max = rm;
        }
        return max;
    }
};
exports.WorkoutsService = WorkoutsService;
exports.WorkoutsService = WorkoutsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _a : Object, users_service_1.UsersService])
], WorkoutsService);
//# sourceMappingURL=workouts.service.js.map