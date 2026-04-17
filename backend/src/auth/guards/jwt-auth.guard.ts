import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err: any, user: any, info: any) {
    if (info?.name === 'TokenExpiredError') {
      throw new UnauthorizedException({ code: 'TOKEN_EXPIRED', message: 'Token has expired.' });
    }
    if (info?.name === 'JsonWebTokenError' || err) {
      throw new UnauthorizedException({ code: 'TOKEN_INVALID', message: 'Invalid token.' });
    }
    if (!user) {
      throw new UnauthorizedException({ code: 'UNAUTHORIZED', message: 'Unauthorized.' });
    }
    return user;
  }
}