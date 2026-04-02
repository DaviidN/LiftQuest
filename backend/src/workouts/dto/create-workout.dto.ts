import { IsString, IsDateString, IsArray, IsNumber, IsOptional, ValidateNested, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

class SetDto {
  @IsNumber()
  weight: number;

  @IsNumber()
  reps: number;
}

class ExerciseDto {
  @IsString()
  name: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SetDto)
  sets: SetDto[];
}

export class CreateWorkoutDto {
  @IsDateString()
  date: string;

  @IsString()
  type: string; // 'strength' or 'airbike'

  // For strength workouts
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExerciseDto)
  exercises?: ExerciseDto[];

  // For airbike workouts
  @IsOptional()
  @IsNumber()
  time?: number;

  @IsOptional()
  @IsNumber()
  calories?: number;

  @IsOptional()
  @IsNumber()
  distance?: number;

  @IsOptional()
  @IsBoolean()
  prAchieved?: boolean;
}