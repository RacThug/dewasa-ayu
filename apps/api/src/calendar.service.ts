import type { BalineseDate, CeremonyId, EvaluatedDate, Evaluation } from '@dewasa-ayu/types';
import {
  evaluate,
  findGoodDates,
  getFullInfo,
  getMonthEvaluation,
} from '@dewasa-ayu/wariga-engine';
import { Injectable } from '@nestjs/common';

/** Parse a strict `YYYY-MM-DD` string into a local Date whose Y/M/D components are
 *  exactly those digits — timezone-independent (the engine reads local components). */
function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y!, m! - 1, d!);
}

/** Engine `BalineseDate` → wire form (Date → ISO string). */
function wireInfo(info: BalineseDate): Omit<BalineseDate, 'gregorian'> & { gregorian: string } {
  return { ...info, gregorian: info.gregorian.toISOString() };
}

function wireEvaluated(e: EvaluatedDate): {
  date: string;
  info: ReturnType<typeof wireInfo>;
  evaluation: Evaluation;
} {
  return { date: e.date.toISOString(), info: wireInfo(e.info), evaluation: e.evaluation };
}

@Injectable()
export class CalendarService {
  check(date: string, ceremony: CeremonyId) {
    const info = getFullInfo(parseISODate(date));
    return { date, info: wireInfo(info), evaluation: evaluate(info, ceremony) };
  }

  month(year: number, month: number, ceremony: CeremonyId) {
    const m = getMonthEvaluation(year, month, ceremony);
    return {
      year: m.year,
      month: m.month,
      ceremony: m.ceremony,
      days: m.days.map(wireEvaluated),
      summary: {
        ayuCount: m.summary.ayuCount,
        cautionCount: m.summary.cautionCount,
        badCount: m.summary.badCount,
        topDates: m.summary.topDates.map(wireEvaluated),
      },
    };
  }

  recommend(from: string, count: number, ceremony: CeremonyId) {
    const r = findGoodDates(parseISODate(from), count, ceremony);
    return { from, count, dates: r.dates.map(wireEvaluated), capReached: r.capReached };
  }

  range(from: string, to: string, ceremony: CeremonyId) {
    const toD = parseISODate(to);
    const dates: ReturnType<typeof wireEvaluated>[] = [];
    for (
      let cur = parseISODate(from);
      cur <= toD;
      cur = new Date(cur.getFullYear(), cur.getMonth(), cur.getDate() + 1)
    ) {
      const info = getFullInfo(cur);
      dates.push(
        wireEvaluated({ date: info.gregorian, info, evaluation: evaluate(info, ceremony) }),
      );
    }
    return { from, to, ceremony, dates };
  }
}
