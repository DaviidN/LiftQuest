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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let UsersService = class UsersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getProfile(userId) {
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
    async updateXP(userId, xpToAdd) {
        return this.prisma.user.update({
            where: { id: userId },
            data: {
                totalXP: {
                    increment: xpToAdd,
                },
            },
        });
    }
    async getStats(userId) {
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
        let currentStreak = 0;
        if (workouts.length > 0) {
            const sorted = [...workouts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            let lastDate = new Date(sorted[0].date);
            for (const workout of sorted) {
                const workoutDate = new Date(workout.date);
                const diff = Math.floor((lastDate.getTime() - workoutDate.getTime()) / (1000 * 60 * 60 * 24));
                if (diff <= 1) {
                    currentStreak++;
                    lastDate = workoutDate;
                }
                else {
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
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map