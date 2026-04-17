import { IsString, IsDateString, IsArray, IsNumber, IsOptional, ValidateNested, IsBoolean, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

class SetDto {
  @IsNumber()
  @Min(0)
  @Max(300)
  weight: number;

  @IsNumber()
  @Min(1)
  @Max(50)
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
  type: string; // 'strength' or 'cardio'

  // For strength workouts
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExerciseDto)
  exercises?: ExerciseDto[];

  // For cardio workouts
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(300)
  time?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(2000)
  calories?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(200)
  distance?: number;

  @IsOptional()
  @IsBoolean()
  prAchieved?: boolean;
}