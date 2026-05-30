// NestJS DTOs derived from the shared Zod schemas (single source of truth in
// @dewasa-ayu/types/schemas). Each DTO gives request validation, a compile-time type,
// and an OpenAPI schema. Response DTOs are used only for OpenAPI documentation.
import {
  CeremoniesResponseSchema,
  CheckQuerySchema,
  CheckResponseSchema,
  DewasaQuerySchema,
  DewasaResponseSchema,
  HealthResponseSchema,
  MonthQuerySchema,
  MonthResponseSchema,
  RangeQuerySchema,
  RangeResponseSchema,
  RecommendQuerySchema,
  RecommendResponseSchema,
} from '@dewasa-ayu/types/schemas';
import { createZodDto } from 'nestjs-zod';

export class CheckQueryDto extends createZodDto(CheckQuerySchema) {}
export class CheckResponseDto extends createZodDto(CheckResponseSchema) {}
export class MonthQueryDto extends createZodDto(MonthQuerySchema) {}
export class MonthResponseDto extends createZodDto(MonthResponseSchema) {}
export class RecommendQueryDto extends createZodDto(RecommendQuerySchema) {}
export class RecommendResponseDto extends createZodDto(RecommendResponseSchema) {}
export class RangeQueryDto extends createZodDto(RangeQuerySchema) {}
export class RangeResponseDto extends createZodDto(RangeResponseSchema) {}
export class DewasaQueryDto extends createZodDto(DewasaQuerySchema) {}
export class DewasaResponseDto extends createZodDto(DewasaResponseSchema) {}
export class CeremoniesResponseDto extends createZodDto(CeremoniesResponseSchema) {}
export class HealthResponseDto extends createZodDto(HealthResponseSchema) {}
