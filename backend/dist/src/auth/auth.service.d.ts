import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
export declare class AuthService {
    private prisma;
    private jwtService;
    constructor(prisma: PrismaService, jwtService: JwtService);
    signup(dto: SignupDto): Promise<{
        token: string;
        user: {
            id: any;
            email: any;
            username: any;
            totalXP: any;
        };
    }>;
    login(dto: LoginDto): Promise<{
        token: string;
        user: {
            id: any;
            email: any;
            username: any;
            totalXP: any;
        };
    }>;
    validateUser(userId: string): Promise<any>;
}
