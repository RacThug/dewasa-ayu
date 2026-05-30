import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CalendarService } from './calendar.service';
import {
  CheckQueryDto,
  CheckResponseDto,
  MonthQueryDto,
  MonthResponseDto,
  RangeQueryDto,
  RangeResponseDto,
  RecommendQueryDto,
  RecommendResponseDto,
} from './dto';

@ApiTags('calendar')
@Controller('calendar')
export class CalendarController {
  constructor(private readonly calendar: CalendarService) {}

  @Get('check')
  @ApiOperation({ summary: 'Full Balinese-calendar breakdown + ceremony verdict for one date' })
  @ApiOkResponse({ type: CheckResponseDto })
  check(@Query() q: CheckQueryDto) {
    return this.calendar.check(q.date, q.ceremony);
  }

  @Get('month')
  @ApiOperation({ summary: 'Per-day evaluation for a whole Gregorian month' })
  @ApiOkResponse({ type: MonthResponseDto })
  month(@Query() q: MonthQueryDto) {
    return this.calendar.month(q.year, q.month, q.ceremony);
  }

  @Get('recommend')
  @ApiOperation({ summary: 'Nearest N auspicious (ayu) dates from a starting date' })
  @ApiOkResponse({ type: RecommendResponseDto })
  recommend(@Query() q: RecommendQueryDto) {
    return this.calendar.recommend(q.from, q.count, q.ceremony);
  }

  @Get('range')
  @ApiOperation({ summary: 'Evaluate every date in a closed range (≤ 90 days)' })
  @ApiOkResponse({ type: RangeResponseDto })
  range(@Query() q: RangeQueryDto) {
    return this.calendar.range(q.from, q.to, q.ceremony);
  }
}
