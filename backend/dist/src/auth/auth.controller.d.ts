import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import type { Request, Response } from 'express';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    signup(dto: SignupDto): Promise<{
        token: string;
        user: {
            id: string;
            email: string;
            username: string;
            totalXP: number;
            isEmailVerified: boolean;
        };
    }>;
    login(dto: LoginDto): Promise<{
        token: string;
        user: {
            id: string;
            email: string;
            username: string;
            totalXP: number;
            isEmailVerified: boolean;
        };
    }>;
    verifyEmail(token: string): Promise<{
        message: string;
        token: string;
        user: {
            id: string;
            email: string;
            username: string;
            totalXP: number;
            isEmailVerified: boolean;
        };
    }>;
    resendVerification(email: string): Promise<{
        message: string;
    }>;
    googleLogin(): void;
    googleCallback(req: Request, res: Response): void;
}
