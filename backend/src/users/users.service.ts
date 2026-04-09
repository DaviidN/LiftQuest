import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { EmailService } from '../email/email.service';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private emailService: EmailService
  ) {}

  async getProfile(userId: string) {
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

  async updateXP(userId: string, xpToAdd: number) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        totalXP: {
          increment: xpToAdd,
        },
      },
    });
  }

  async getStats(userId: string) {
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

    // Calculate current streak
    let currentStreak = 0;
    if (workouts.length > 0) {
      const sorted = [...workouts].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      let lastDate = new Date(sorted[0].date);
      
      for (const workout of sorted) {
        const workoutDate = new Date(workout.date);
        const diff = Math.floor((lastDate.getTime() - workoutDate.getTime()) / (1000 * 60 * 60 * 24));
        if (diff <= 1) {
          currentStreak++;
          lastDate = workoutDate;
        } else {
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

  async updateEmail(userId: string, updatedEmail: string, currentPassword: string){
    const user = await this.prisma.user.findFirst({
      where: { id: userId },
    });

    if (!user) {
      throw new ConflictException('User does not exist');
    }

    const isCurrentPasswordCorrect = await bcrypt.compare(currentPassword, user.password);

    if(!isCurrentPasswordCorrect) {
      throw new UnauthorizedException('Incorrect password')
    }

    if(user.email === updatedEmail){
      throw new ConflictException('New email must be different')
    }

    // Generate email verification token
    const verificationToken = randomUUID();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
    
    const updatedUser = await this.prisma.user.update({
      where: {id: userId},
      data:{
        email: updatedEmail,
        isEmailVerified: false,
        emailVerificationToken: verificationToken,
        emailVerificationExpires: verificationExpires,
      }
    })

    // Send verification email
    await this.emailService.sendVerificationEmail(
      updatedUser.email,
      updatedUser.username,
      verificationToken,
      'email-update'
    );

    // Generate JWT
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

  async updateUsername(userId: string, updatedUsername: string){
    const user = await this.prisma.user.findFirst({
      where: { id: userId },
    });

    if (!user) {
      throw new ConflictException('User does not exist');
    }

    if(user.username === updatedUsername){
      throw new ConflictException('New username must be different')
    }

    const updatedUser = await this.prisma.user.update({
      where: {id: userId},
      data:{
        username: updatedUsername,
      }
    })

    // Generate JWT
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

  async updatePassword(userId: string, currentPassword: string, newPassword: string ){
     const user = await this.prisma.user.findFirst({
      where: { id: userId },
    });

    if (!user) {
      throw new ConflictException('User does not exist');
    }

    const isCurrentPasswordCorrect = await bcrypt.compare(currentPassword, user.password);

    if(!isCurrentPasswordCorrect) {
      throw new UnauthorizedException('Incorrect password')
    }

    const isPasswordValid = await bcrypt.compare(newPassword, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('New password must be different');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const updatedUser = await this.prisma.user.update({
      where: {id: userId},
      data:{
        password: hashedPassword,
      }
    })

    // Generate JWT
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

  async deleteProfile(userId: string){
    const existingUser = await this.prisma.user.findFirst({
      where: { id: userId },
    });

    if (!existingUser) {
      throw new ConflictException('User does not exist');
    }
  }
}