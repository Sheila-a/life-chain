import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{
      path: string;
      headers: Record<string, string | undefined>;
      user?: { hospitalId: number; email: string };
    }>();

    if (
      request.path.startsWith('/api/docs') ||
      request.path === '/api/docs-json' ||
      request.path === '/api/login' ||
      request.path === '/api/register-hospital' ||
      request.path === '/api/resources/search' ||
      request.path === '/api/resource-updates/search' ||
      request.path === '/api/equipment/list'
    ) {
      return true;
    }

    const header = request.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing bearer token');
    }

    const token = header.slice('Bearer '.length);
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET ?? 'change-me') as {
        hospitalId: number;
        email: string;
      };
      request.user = payload;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
