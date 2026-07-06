import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/auth.types';

@Controller()
export class UserController {
  /**
   * GET /me — the identity endpoint the frontend consumes to build its session.
   * Guarded: with no valid session cookie it returns 401, which is how the
   * SSR layout decides whether to render the app or redirect to /login.
   * Returns only the public projection (see JwtStrategy.validate).
   */
  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@CurrentUser() user: AuthenticatedUser): AuthenticatedUser {
    return user;
  }
}
