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
exports.AchievementsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const users_service_1 = require("../users/users.service");
const ACHIEVEMENTS = [
    { code: 'FIRST_WORKOUT', name: 'First Blood', description: 'First workout', icon: '🥇', xp: 50 },
    { code: 'THREE_IN_WEEK', name: 'Consistency', description: '3 workouts in a week', icon: '📅', xp: 100 },
    { code: 'NEW_PR', name: 'Stronger', description: 'New personal record', icon: '⚡', xp: 150 },
    { code: 'PR_MADNESS', name: 'PR Madness', description: '5 new PRs in a month', icon: '🏆', xp: 500 },
    { code: 'STREAK_7', name: 'On Fire', description: '7 days in a row', icon: '🔥', xp: 250 },
    { code: 'TOTAL_100', name: 'Century', description: '100 workouts total', icon: '💯', xp: 10000 },
    { code: 'CARDIO_BEAST', name: 'Cardio King', description: '10 cardio workouts', icon: '🚴', xp: 400 },
];
let AchievementsService = class AchievementsService {
    prisma;
    usersService;
    constructor(prisma, usersService) {
        this.prisma = prisma;
        this.usersService = usersService;
    }
    async onModuleInit() {
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
    async getUserAchievements(userId) {
        return this.prisma.userAchievement.findMany({
            where: { userId },
            include: {
                achievement: true,
            },
            orderBy: { unlockedAt: 'desc' },
        });
    }
    async checkAndUnlock(userId) {
        const unlocked = [];
        const workouts = await this.prisma.workout.findMany({
            where: { userId },
            orderBy: { date: 'desc' },
        });
        const userAchievements = await this.prisma.userAchievement.findMany({
            where: { userId },
            include: { achievement: true },
        });
        const unlockedCodes = userAchievements.map(ua => ua.achievement.code);
        if (workouts.length === 1 && !unlockedCodes.includes('FIRST_WORKOUT')) {
            await this.unlockAchievement(userId, 'FIRST_WORKOUT');
            unlocked.push('FIRST_WORKOUT');
        }
        const hasNewPR = workouts.some(w => w.type === 'strength' && w.prAchieved);
        if (hasNewPR && !unlockedCodes.includes('NEW_PR')) {
            await this.unlockAchievement(userId, 'NEW_PR');
            unlocked.push('NEW_PR');
        }
        const lastMonthPRs = workouts
            .filter(w => {
            const diff = Date.now() - new Date(w.date).getTime();
            return w.type === 'strength' && w.prAchieved && diff < 30 * 24 * 60 * 60 * 1000;
        });
        if (lastMonthPRs.length >= 5 && !unlockedCodes.includes('PR_MADNESS')) {
            await this.unlockAchievement(userId, 'PR_MADNESS');
            unlocked.push('PR_MADNESS');
        }
        const lastWeek = workouts.filter(w => {
            const diff = Date.now() - new Date(w.date).getTime();
            return diff < 7 * 24 * 60 * 60 * 1000;
        });
        if (lastWeek.length >= 3 && !unlockedCodes.includes('THREE_IN_WEEK')) {
            await this.unlockAchievement(userId, 'THREE_IN_WEEK');
            unlocked.push('THREE_IN_WEEK');
        }
        if (workouts.length >= 100 && !unlockedCodes.includes('TOTAL_100')) {
            await this.unlockAchievement(userId, 'TOTAL_100');
            unlocked.push('TOTAL_100');
        }
        const cardioCount = workouts.filter(w => w.type === 'cardio').length;
        if (cardioCount >= 10 && !unlockedCodes.includes('CARDIO_BEAST')) {
            await this.unlockAchievement(userId, 'CARDIO_BEAST');
            unlocked.push('CARDIO_BEAST');
        }
        let streak = 0;
        if (workouts.length > 0) {
            const sorted = [...workouts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            streak = 1;
            let lastDate = new Date(sorted[0].date);
            for (let i = 1; i < sorted.length; i++) {
                const workoutDate = new Date(sorted[i].date);
                const diff = Math.floor((lastDate.getTime() - workoutDate.getTime()) / (1000 * 60 * 60 * 24));
                if (diff === 1) {
                    streak++;
                    lastDate = workoutDate;
                }
                else if (diff > 1) {
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
    async unlockAchievement(userId, code) {
        const achievement = await this.prisma.achievement.findUnique({
            where: { code },
        });
        if (!achievement)
            return;
        await this.prisma.userAchievement.create({
            data: {
                userId,
                achievementId: achievement.id,
            },
        });
        await this.usersService.updateXP(userId, achievement.xp);
    }
};
exports.AchievementsService = AchievementsService;
exports.AchievementsService = AchievementsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        users_service_1.UsersService])
], AchievementsService);
//# sourceMappingURL=achievements.service.js.map