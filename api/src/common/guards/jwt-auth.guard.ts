import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/** Route guard that runs the 'jwt' passport strategy (cookie extractor). */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
