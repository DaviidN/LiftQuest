import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { WorkoutsService } from './workouts.service';
import { CreateWorkoutDto } from './dto/create-workout.dto';

@Controller('workouts')
@UseGuards(JwtAuthGuard)
export class WorkoutsController {
  constructor(private workoutsService: WorkoutsService) {}

  @Post()
  create(@Request() req, @Body() dto: CreateWorkoutDto) {
    return this.workoutsService.create(req.user.id, dto);
  }

  @Get()
  findAll(@Request() req) {
    return this.workoutsService.findAll(req.user.id);
  }

  @Get('volume')
  getVolumeData(@Request() req, @Query('days') days?: string) {
    return this.workoutsService.getVolumeData(req.user.id, days ? parseInt(days) : 30);
  }

  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    return this.workoutsService.findOne(req.user.id, id);
  }

  @Delete(':id')
  delete(@Request() req, @Param('id') id: string) {
    return this.workoutsService.delete(req.user.id, id);
  }
}