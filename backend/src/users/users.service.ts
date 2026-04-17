import { Injectable, ConflictException, UnauthorizedException, NotFoundException } from '@nestjs/common';
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
    const cardioWorkouts = workouts.filter(w => w.type === 'cardio');

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
      cardioWorkouts: cardioWorkouts.length,
      currentStreak,
    };

  }

  async updateEmail(userId: string, updatedEmail: string, currentPassword: string){
    const isEmailUsed = await this.prisma.user.findFirst({
      where: {email: updatedEmail}
    })

    if(isEmailUsed){
      throw new ConflictException('Email is already in use');
    }

    const user = await this.prisma.user.findFirst({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User does not exist');
    }

    const isCurrentPasswordCorrect = await bcrypt.compare(currentPassword, user.password);

    if(!isCurrentPasswordCorrect) {
      throw new UnauthorizedException('Incorrect password');
    }

    if(user.email === updatedEmail){
      throw new ConflictException('New email must be different');
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
    const isUsernameUsed = await this.prisma.user.findFirst({
      where: {username: updatedUsername}
    })

    if(isUsernameUsed){
      throw new ConflictException('Username already in use')
    }

    const user = await this.prisma.user.findFirst({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User does not exist');
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
      throw new NotFoundException('User does not exist');
    }

    const isCurrentPasswordCorrect = await bcrypt.compare(currentPassword, user.password);

    if(!isCurrentPasswordCorrect) {
      throw new UnauthorizedException('Incorrect password')
    }

    const isSamePassword = await bcrypt.compare(newPassword, user.password);

    if (isSamePassword) {
      throw new ConflictException('New password must be different');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.prisma.user.update({
      where: {id: userId},
      data:{ password: hashedPassword }
    });

    return { message: 'Password updated successfully' };
  }

  async requestEmail(email: string){
    const user = await this.prisma.user.findFirst({
      where: { email },
    });

    if (!user) {
      return { message: 'If that email exists, a reset link has been sent.' };
    }

    const resetToken = randomUUID();
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

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

  async resetPassword(token: string, newPassword: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        passwordResetToken: token,
        passwordResetExpires: { gt: new Date() },
      }
    });

    if (!user) {
      throw new UnauthorizedException('Invalid or expired reset token.');
    }

    const hashed = await bcrypt.hash(newPassword, 10);

    const isSamePassword = await bcrypt.compare(newPassword, user.password);

    if (isSamePassword) {
      throw new ConflictException('New password must be different');
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

  async deleteProfile(userId: string){
    const existingUser = await this.prisma.user.findFirst({
      where: { id: userId },
    });

    if (!existingUser) {
      throw new NotFoundException('User does not exist');
    }

    await this.prisma.user.delete({
      where: { id: userId },
    });

    return { message: 'Account deleted successfully' };
  }
}