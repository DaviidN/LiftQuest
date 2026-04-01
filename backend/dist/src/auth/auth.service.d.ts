import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'prisma/prisma.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
export declare class AuthService {
    private prisma;
    private jwtService;
    constructor(prisma: PrismaService, jwtService: JwtService);
    signup(dto: SignupDto): Promise<{
        token: string;
        user: {
            id: string;
            email: string;
            username: string;
            totalXP: number;
        };
    }>;
    login(dto: LoginDto): Promise<{
        token: string;
        user: {
            id: string;
            email: string;
            username: string;
            totalXP: number;
        };
    }>;
    validateUser(userId: string): Promise<{
        email: string;
        username: string;
        id: string;
        totalXP: number;
    } | null>;
}
