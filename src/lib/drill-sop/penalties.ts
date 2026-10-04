import { PenaltyRecord, DrillEvent } from '@/types/drill';

export const PENALTY_RATES = {
  MISSING_CADET_PER_CADET: 25, // -25 pts per missing cadet
  PAUSE_VIOLATION_PER_OCCURRENCE: 5, // -5 pts per failed 5-sec pause
  BOUNDARY_VIOLATION_PER_OCCURRENCE: 10, // -10 pts per violation
  TIME_VIOLATION_PER_SECOND: 1, // -1 pt per second under or over time window
} as const;

export function calculateTimePenalty(
  elapsedSeconds: number,
  event: DrillEvent
): { secondsOff: number; penaltyPoints: number; reason: string | null } {
  if (elapsedSeconds <= 0) {
    return { secondsOff: 0, penaltyPoints: 0, reason: null };
  }

  const minSec = event.time_limit_min_sec ?? event.time_limit_min ?? 0;
  const maxSec = event.time_limit_max_sec ?? event.time_limit_max ?? 0;

  if (minSec > 0 && elapsedSeconds < minSec) {
    const under = minSec - elapsedSeconds;
    return {
      secondsOff: under,
      penaltyPoints: under * PENALTY_RATES.TIME_VIOLATION_PER_SECOND,
      reason: `Under minimum time limit by ${under}s (${minSec}s required)`,
    };
  }

  if (maxSec > 0 && elapsedSeconds > maxSec) {
    const over = elapsedSeconds - maxSec;
    return {
      secondsOff: over,
      penaltyPoints: over * PENALTY_RATES.TIME_VIOLATION_PER_SECOND,
      reason: `Over maximum time limit by ${over}s (${maxSec}s allowed)`,
    };
  }

  return { secondsOff: 0, penaltyPoints: 0, reason: null };
}

export function computeTotalPenalties(penalty: Partial<PenaltyRecord>): number {
  const missingCount = penalty.missing_cadet_count ?? 0;
  const pauseCount = penalty.pause_violation_count ?? 0;
  const boundaryCount = penalty.boundary_violations ?? 0;
  const timeSeconds = penalty.time_under_over_seconds ?? 0;

  // Follows exact STORED generated column formula:
  // (missing_cadet_count * 25.00) + (pause_violation_count * 5.00) + (boundary_violations * 10.00) + (time_under_over_seconds * 1.00)
  return (
    missingCount * PENALTY_RATES.MISSING_CADET_PER_CADET +
    pauseCount * PENALTY_RATES.PAUSE_VIOLATION_PER_OCCURRENCE +
    boundaryCount * PENALTY_RATES.BOUNDARY_VIOLATION_PER_OCCURRENCE +
    timeSeconds * PENALTY_RATES.TIME_VIOLATION_PER_SECOND
  );
}
