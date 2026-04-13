"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = __importStar(require("bcrypt"));
const crypto_1 = require("crypto");
const email_service_1 = require("../email/email.service");
let UsersService = class UsersService {
    prisma;
    jwtService;
    emailService;
    constructor(prisma, jwtService, emailService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.emailService = emailService;
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
    async updateEmail(userId, updatedEmail, currentPassword) {
        const isEmailUsed = await this.prisma.user.findFirst({
            where: { email: updatedEmail }
        });
        if (isEmailUsed) {
            throw new common_1.ConflictException('Email is already in use');
        }
        const user = await this.prisma.user.findFirst({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.NotFoundException('User does not exist');
        }
        const isCurrentPasswordCorrect = await bcrypt.compare(currentPassword, user.password);
        if (!isCurrentPasswordCorrect) {
            throw new common_1.UnauthorizedException('Incorrect password');
        }
        if (user.email === updatedEmail) {
            throw new common_1.ConflictException('New email must be different');
        }
        const verificationToken = (0, crypto_1.randomUUID)();
        const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
        const updatedUser = await this.prisma.user.update({
            where: { id: userId },
            data: {
                email: updatedEmail,
                isEmailVerified: false,
                emailVerificationToken: verificationToken,
                emailVerificationExpires: verificationExpires,
            }
        });
        await this.emailService.sendVerificationEmail(updatedUser.email, updatedUser.username, verificationToken, 'email-update');
        const token = this.jwtService.sign({
            sub: user.id,
            email: updatedUser.email,
        });
        return {
            token,
            user: {
                id: updatedUser.id,
                email: updatedUser.email,
                username: updatedUser.username,
                totalXP: updatedUser.totalXP,
                isEmailVerified: updatedUser.isEmailVerified,
            },
        };
    }
    async updateUsername(userId, updatedUsername) {
        const isUsernameUsed = await this.prisma.user.findFirst({
            where: { username: updatedUsername }
        });
        if (isUsernameUsed) {
            throw new common_1.ConflictException('Username already in use');
        }
        const user = await this.prisma.user.findFirst({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.NotFoundException('User does not exist');
        }
        if (user.username === updatedUsername) {
            throw new common_1.ConflictException('New username must be different');
        }
        const updatedUser = await this.prisma.user.update({
            where: { id: userId },
            data: {
                username: updatedUsername,
            }
        });
        const token = this.jwtService.sign({
            sub: user.id,
            email: user.email,
        });
        return {
            token,
            user: {
                id: updatedUser.id,
                email: updatedUser.email,
                username: updatedUser.username,
                totalXP: updatedUser.totalXP,
                isEmailVerified: updatedUser.isEmailVerified,
            },
        };
    }
    async updatePassword(userId, currentPassword, newPassword) {
        const user = await this.prisma.user.findFirst({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.NotFoundException('User does not exist');
        }
        const isCurrentPasswordCorrect = await bcrypt.compare(currentPassword, user.password);
        if (!isCurrentPasswordCorrect) {
            throw new common_1.UnauthorizedException('Incorrect password');
        }
        const isSamePassword = await bcrypt.compare(newPassword, user.password);
        if (isSamePassword) {
            throw new common_1.ConflictException('New password must be different');
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await this.prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword }
        });
        return { message: 'Password updated successfully' };
    }
    async requestEmail(email) {
        const user = await this.prisma.user.findFirst({
            where: { email },
        });
        if (!user) {
            return;
        }
        const resetToken = (0, crypto_1.randomUUID)();
        const resetExpires = new Date(Date.now() + 60 * 60 * 1000);
        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                passwordResetToken: resetToken,
                passwordResetExpires: resetExpires,
            },
        });
        await this.emailService.sendPasswordResetEmail(user.email, user.username, resetToken);
        return { message: 'If that email exists, a reset link has been sent.' };
    }
    async resetPassword(token, newPassword) {
        const user = await this.prisma.user.findFirst({
            where: {
                passwordResetToken: token,
                passwordResetExpires: { gt: new Date() },
            }
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid or expired reset token.');
        }
        const hashed = await bcrypt.hash(newPassword, 10);
        const isSamePassword = await bcrypt.compare(newPassword, user.password);
        if (isSamePassword) {
            throw new common_1.ConflictException('New password must be different');
        }
        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashed,
                passwordResetToken: null,
                passwordResetExpires: null,
            },
        });
        return { message: 'Password has been reset successfully.' };
    }
    async deleteProfile(userId) {
        const existingUser = await this.prisma.user.findFirst({
            where: { id: userId },
        });
        if (!existingUser) {
            throw new common_1.NotFoundException('User does not exist');
        }
        await this.prisma.user.delete({
            where: { id: userId },
        });
        return { message: 'Account deleted successfully' };
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        email_service_1.EmailService])
], UsersService);
//# sourceMappingURL=users.service.js.map