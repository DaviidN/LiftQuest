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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const prisma_service_1 = require("../../prisma/prisma.service");
const bcrypt = __importStar(require("bcrypt"));
const crypto_1 = require("crypto");
const email_service_1 = require("../email/email.service");
let AuthService = class AuthService {
    prisma;
    jwtService;
    emailService;
    constructor(prisma, jwtService, emailService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.emailService = emailService;
    }
    async signup(dto) {
        const existingUser = await this.prisma.user.findFirst({
            where: {
                OR: [
                    { email: dto.email },
                    { username: dto.username },
                ],
            },
        });
        if (existingUser) {
            throw new common_1.ConflictException('Email or username already exists');
        }
        const hashedPassword = await bcrypt.hash(dto.password, 10);
        const verificationToken = (0, crypto_1.randomUUID)();
        const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
        const user = await this.prisma.user.create({
            data: {
                email: dto.email,
                username: dto.username,
                password: hashedPassword,
                emailVerificationToken: verificationToken,
                emailVerificationExpires: verificationExpires,
            },
        });
        await this.emailService.sendVerificationEmail(user.email, user.username, verificationToken, 'signup');
        const token = this.jwtService.sign({
            sub: user.id,
            email: user.email,
        });
        return {
            token: token,
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                totalXP: user.totalXP,
                isEmailVerified: user.isEmailVerified,
            },
        };
    }
    async findOrCreateOAuthUser({ provider, providerId, email, username, avatarUrl }) {
        let user = provider === 'google'
            ? await this.prisma.user.findUnique({ where: { googleId: providerId } })
            : await this.prisma.user.findUnique({ where: { appleId: providerId } });
        if (user)
            return user;
        user = await this.prisma.user.findUnique({ where: { email } });
        if (user) {
            const linkField = provider === 'google' ? { googleId: providerId } : { appleId: providerId };
            return this.prisma.user.update({ where: { email }, data: linkField });
        }
        const safeUsername = await this.generateUniqueUsername(username);
        const oauthField = provider === 'google' ? { googleId: providerId } : { appleId: providerId };
        return this.prisma.user.create({
            data: {
                email,
                username: safeUsername,
                ...oauthField,
                provider,
                avatarUrl,
                isEmailVerified: true,
            },
        });
    }
    async generateUniqueUsername(base) {
        const slug = base.replace(/\s+/g, '').toLowerCase().slice(0, 20);
        let username = slug;
        let counter = 1;
        while (await this.prisma.user.findUnique({ where: { username } })) {
            username = `${slug}${counter++}`;
        }
        return username;
    }
    signJwt(user) {
        return this.jwtService.sign({ sub: user.id, email: user.email });
    }
    async login(dto) {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        if (!user.password) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const isPasswordValid = await bcrypt.compare(dto.password, user.password);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const token = this.jwtService.sign({
            sub: user.id,
            email: user.email,
        });
        return {
            token,
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                totalXP: user.totalXP,
                isEmailVerified: user.isEmailVerified,
            },
        };
    }
    async validateUser(userId) {
        return this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                username: true,
                totalXP: true,
                workouts: true,
                unlockedAchievements: true,
            },
        });
    }
    async verifyEmail(token) {
        const user = await this.prisma.user.findFirst({
            where: {
                emailVerificationToken: token,
            },
        });
        if (!user) {
            throw new common_1.BadRequestException('Invalid verification token');
        }
        if (user.isEmailVerified) {
            throw new common_1.BadRequestException('Email already verified');
        }
        if (user.emailVerificationExpires && user.emailVerificationExpires < new Date()) {
            throw new common_1.BadRequestException('Verification token has expired');
        }
        const updatedUser = await this.prisma.user.update({
            where: { id: user.id },
            data: {
                isEmailVerified: true,
                emailVerificationToken: null,
                emailVerificationExpires: null,
            },
        });
        const authToken = this.jwtService.sign({
            sub: updatedUser.id,
            email: updatedUser.email,
        });
        return {
            message: 'Email verified successfully',
            token: authToken,
            user: {
                id: updatedUser.id,
                email: updatedUser.email,
                username: updatedUser.username,
                totalXP: updatedUser.totalXP,
                isEmailVerified: updatedUser.isEmailVerified,
            },
        };
    }
    async resendVerificationEmail(email) {
        const user = await this.prisma.user.findUnique({
            where: { email },
        });
        if (!user) {
            throw new common_1.BadRequestException('User not found');
        }
        if (user.isEmailVerified) {
            throw new common_1.BadRequestException('Email already verified');
        }
        const verificationToken = (0, crypto_1.randomUUID)();
        const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                emailVerificationToken: verificationToken,
                emailVerificationExpires: verificationExpires,
            },
        });
        await this.emailService.sendVerificationEmail(user.email, user.username, verificationToken, 'signup');
        return { message: 'Verification email sent' };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        email_service_1.EmailService])
], AuthService);
//# sourceMappingURL=auth.service.js.map