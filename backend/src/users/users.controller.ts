import { Controller, Get, UseGuards, Request, Put, Body, Delete, Post, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UsersService } from './users.service';
import { UpdatePasswordDto } from './dto/update-password.dto';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post('request')
  requestEmail(@Body('email') email: string) {
    return this.usersService.requestEmail(email);
  }

  @Post('reset-password')
  resetPassword(@Query('token') token: string, @Body() { newPassword }: UpdatePasswordDto) {
    return this.usersService.resetPassword(token, newPassword);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return this.usersService.getProfile(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('stats')
  getStats(@Request() req) {
    return this.usersService.getStats(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Put('email')
  updateEmail(
    @Request() req,
    @Body('email') email: string,
    @Body('currentPassword') currentPassword: string,
  ) {
    return this.usersService.updateEmail(req.user.id, email, currentPassword);
  }

  @UseGuards(JwtAuthGuard)
  @Put('username')
  updateUsername(@Request() req, @Body('username') username: string) {
    return this.usersService.updateUsername(req.user.id, username);
  }

  @UseGuards(JwtAuthGuard)
  @Put('password')
  updatePassword(
    @Request() req,
    @Body('currentPassword') currentPassword: string,
    @Body() { newPassword }: UpdatePasswordDto,
  ) {
    return this.usersService.updatePassword(req.user.id, currentPassword, newPassword);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('delete')
  deleteProfile(@Request() req) {
    return this.usersService.deleteProfile(req.user.id);
  }
}