import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { CreateWorkoutDto } from './dto/create-workout.dto';
export declare class WorkoutsService {
    private prisma;
    private usersService;
    constructor(prisma: PrismaService, usersService: UsersService);
    create(userId: string, dto: CreateWorkoutDto): Promise<any>;
    findAll(userId: string): Promise<any>;
    findOne(userId: string, workoutId: string): Promise<any>;
    delete(userId: string, workoutId: string): Promise<{
        deleted: boolean;
    }>;
    getVolumeData(userId: string, days?: number): Promise<any>;
    private calculate1RM;
}
