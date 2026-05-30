import { ENGINE_VERSION } from '@dewasa-ayu/wariga-engine';
import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { HealthResponseDto } from './dto';

@ApiTags('health')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({ summary: 'Liveness + engine version' })
  @ApiOkResponse({ type: HealthResponseDto })
  health() {
    return { status: 'ok' as const, engineVersion: ENGINE_VERSION, uptime: process.uptime() };
  }
}
