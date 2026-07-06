import { Body, Controller, HttpCode, Post, Res } from '@nestjs/common';
import type { Response, CookieOptions } from 'express';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import type { PublicUser } from '../users/user.types';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly config: ConfigService,
  ) {}

  private get cookieName(): string {
    return this.config.getOrThrow<string>('cookie.name');
  }

  private cookieOptions(): CookieOptions {
    return {
      httpOnly: true, // not readable by JS — mitigates XSS token theft
      sameSite: 'lax',
      secure: this.config.getOrThrow<string>('nodeEnv') === 'production',
      maxAge: this.config.getOrThrow<number>('cookie.maxAgeMs'),
      path: '/',
    };
  }

  @Post('login')
  @HttpCode(200)
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<PublicUser> {
    const user = await this.auth.validateCredentials(dto.email, dto.password);
    const token = this.auth.signToken(user);
    res.cookie(this.cookieName, token, this.cookieOptions());
    return user;
  }

  @Post('logout')
  @HttpCode(200)
  logout(@Res({ passthrough: true }) res: Response): { success: true } {
    res.clearCookie(this.cookieName, { path: '/' });
    return { success: true };
  }
}
