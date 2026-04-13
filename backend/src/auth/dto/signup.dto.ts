import { IsEmail, IsString, MaxLength, MinLength, Matches } from 'class-validator';

export class SignupDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(3)
  @MaxLength(20)
  username: string;

  @IsString()
  @MinLength(8)
  @MaxLength(32)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, {                                                   
      message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',                                                                        
    })                       
  password: string;
}