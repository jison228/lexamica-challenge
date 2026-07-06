import { Controller, Get } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

const READY_STATES = ['disconnected', 'connected', 'connecting', 'disconnecting'];

@Controller('health')
export class HealthController {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  @Get()
  health() {
    return {
      status: 'ok',
      db: READY_STATES[this.connection.readyState] ?? 'unknown',
    };
  }
}
