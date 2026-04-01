import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
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
}
