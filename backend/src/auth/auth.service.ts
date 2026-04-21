import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { EmailService } from '../email/email.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  async signup(dto: SignupDto) {
    // Check if user exists
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: dto.email },
          { username: dto.username },
        ],
      },
    });

    if (existingUser) {
      throw new ConflictException('Email or username already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // Generate email verification token
    const verificationToken = randomUUID();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        username: dto.username,
        password: hashedPassword,
        emailVerificationToken: verificationToken,
        emailVerificationExpires: verificationExpires,
      },
    });

    // Send verification email
    await this.emailService.sendVerificationEmail(
      user.email,
      user.username,
      verificationToken,
      'signup',
    );

    // Generate JWT
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

  async findOrCreateOAuthUser({ provider, providerId, email, username, avatarUrl }: {
    provider: string;
    providerId: string;
    email: string;
    username: string;
    avatarUrl?: string;
  }) {
    // Check if user already linked this OAuth account
    let user = provider === 'google'
      ? await this.prisma.user.findUnique({ where: { googleId: providerId } })
      : await this.prisma.user.findUnique({ where: { appleId: providerId } });
    if (user) return user;

    // Check if email already exists — link the OAuth account to it
    user = await this.prisma.user.findUnique({ where: { email } });
    if (user) {
      const linkField = provider === 'google' ? { googleId: providerId } : { appleId: providerId };
      return this.prisma.user.update({ where: { email }, data: linkField });
    }

    // Create new user
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

  private async generateUniqueUsername(base: string): Promise<string> {
    const slug = base.replace(/\s+/g, '').toLowerCase().slice(0, 20);
    let username = slug;
    let counter = 1;
    while (await this.prisma.user.findUnique({ where: { username } })) {
      username = `${slug}${counter++}`;
    }
    return username;
  }

  signJwt(user: { id: string; email: string }): string {
    return this.jwtService.sign({ sub: user.id, email: user.email });
  }

  async login(dto: LoginDto) {
    // Find user
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check password
    if (!user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT
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

  async validateUser(userId: string) {
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

  async verifyEmail(token: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        emailVerificationToken: token,
      },
    });

    if (!user) {
      throw new BadRequestException('Invalid verification token');
    }

    if (user.isEmailVerified) {
      throw new BadRequestException('Email already verified');
    }

    if (user.emailVerificationExpires && user.emailVerificationExpires < new Date()) {
      throw new BadRequestException('Verification token has expired');
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

  async resendVerificationEmail(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.isEmailVerified) {
      throw new BadRequestException('Email already verified');
    }

    const verificationToken = randomUUID();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerificationToken: verificationToken,
        emailVerificationExpires: verificationExpires,
      },
    });

    await this.emailService.sendVerificationEmail(
      user.email,
      user.username,
      verificationToken,
      'signup',
    );

    return { message: 'Verification email sent' };
  }
}