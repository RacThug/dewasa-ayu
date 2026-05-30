import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_PIPE } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { ZodValidationPipe } from 'nestjs-zod';

import { AllExceptionsFilter } from './all-exceptions.filter';
import { CalendarController } from './calendar.controller';
import { CalendarService } from './calendar.service';
import { HealthController } from './health.controller';
import { MetaController } from './meta.controller';

@Module({
  // Basic in-memory throttle (120 req/min/IP). Tiered, Redis-backed limits land in Slice 2.
  imports: [ThrottlerModule.forRoot([{ ttl: 60_000, limit: 120 }])],
  controllers: [CalendarController, MetaController, HealthController],
  providers: [
    CalendarService,
    { provide: APP_PIPE, useClass: ZodValidationPipe },
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
