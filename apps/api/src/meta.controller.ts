import { CEREMONY_CONFIGS, CEREMONY_IDS, DEWASA_RULES } from '@dewasa-ayu/ceremony-rules';
import type { CeremonyId } from '@dewasa-ayu/types';
import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CeremoniesResponseDto, DewasaQueryDto, DewasaResponseDto } from './dto';

@ApiTags('meta')
@Controller()
export class MetaController {
  @Get('ceremonies')
  @ApiOperation({ summary: 'List the supported ceremony types' })
  @ApiOkResponse({ type: CeremoniesResponseDto })
  ceremonies() {
    return {
      ceremonies: CEREMONY_IDS.map((id) => ({ id, name: CEREMONY_CONFIGS[id].name })),
    };
  }

  @Get('dewasa')
  @ApiOperation({ summary: 'List the named padewasan (all UNVERIFIED — "estimasi")' })
  @ApiOkResponse({ type: DewasaResponseDto })
  dewasa(@Query() q: DewasaQueryDto) {
    const ceremony: CeremonyId | 'all' = q.ceremony ?? 'all';
    const rules = DEWASA_RULES.filter(
      (r) => ceremony === 'all' || r.effects[ceremony] !== undefined,
    )
      .filter(
        (r) =>
          !q.type ||
          r.generalCategory === q.type ||
          Object.values(r.effects).some((e) => e?.polarity === q.type),
      )
      .map((r) => ({
        id: r.id,
        name: r.name,
        generalCategory: r.generalCategory,
        conditionText: r.conditionText,
        source: r.source,
        verified: r.verified,
        appliesTo: Object.keys(r.effects) as CeremonyId[],
      }));
    return { ceremony, rules };
  }
}
