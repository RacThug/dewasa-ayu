/**
 * Engine error type. Thrown for programmer errors (invalid input); domain edge
 * cases are returned as data with explicit flags instead. See ENG-001 §Errors.
 */
export type WarigaErrorCode =
  | 'INVALID_DATE' // non-Date input or NaN time
  | 'UNKNOWN_CEREMONY' // CeremonyId not in the registry
  | 'OUT_OF_RANGE' // date outside the supported range
  | 'INVALID_PARAM'; // negative count, bad month/year, etc.

export class WarigaError extends Error {
  readonly code: WarigaErrorCode;

  constructor(code: WarigaErrorCode, message: string) {
    super(message);
    this.name = 'WarigaError';
    this.code = code;
  }
}
