import { v4 as uuid } from 'uuid';
import type {
  Program,
  Mesocycle,
  Macrocycle,
  MesocycleDayPlan,
  MesocycleExercisePlan,
  WeeklyExercisePlan,
  SetSpec,
  VolumeDataPoint,
  Exercise,
} from '../types';

export function roundToNearest(value: number, increment: number): number {
  return Math.round(value / increment) * increment;
}

/** Round up to the nearest even number — guarantees 2×/week sets split cleanly. */
function roundUpToEven(n: number): number {
  return Math.ceil(n / 2) * 2;
}

/**
 * 2×/week MEV = 1.5× the 1×/week MEV, rounded up to an even number.
 * Example: startingSets=3 → round(4.5)=5 → roundUpToEven=6
 */
function twoXMEV(oneXMEV: number): number {
  return roundUpToEven(Math.round(oneXMEV * 1.5));
}

// ─── Primary Compound ────────────────────────────────────────────────────────

const PRIMARY_RIR: Record<number, number> = { 1: 4, 2: 3, 3: 2, 4: 1, 5: 4 };
const PRIMARY_BACKOFF_COUNTS: Record<number, number> = { 1: 1, 2: 2, 3: 3, 4: 3 };
// Back-off RIR is always exactly 2 above the top set that week (1–2 RIR higher rule).

function primaryCompoundWeeks(
  ex: Exercise,
  effectiveStartWeight: number,
  frequency: 1 | 2,
): WeeklyExercisePlan[] {
  const { min, max } = ex.targetRepRange;
  const repsPerWeek: Record<number, number> = { 1: max, 2: max, 3: Math.min(min + 1, max), 4: min };

  // With 2×/week the top set is performed every session (1/session, 2/week).
  // Back-off weekly sets = per-session count × 2; per-session stays the same.
  const topSetWeekly = frequency === 2 ? 2 : 1;
  const deloadTopSets = frequency === 2 ? 4 : 2;

  const weeks: WeeklyExercisePlan[] = [];

  for (let w = 1; w <= 5; w++) {
    if (w === 5) {
      const deloadWeight = roundToNearest(effectiveStartWeight * 0.875, 2.5);
      weeks.push({
        weekNumber: 5,
        phase: 'deload',
        setSpec: {
          sets: deloadTopSets,
          reps: { min: max + 2, max: max + 4 },
          weight: deloadWeight,
          rir: 4,
          isTopSet: true,
        },
      });
    } else {
      const topWeight = roundToNearest(effectiveStartWeight + (w - 1) * 2.5, 2.5);
      const backOffWeight = roundToNearest(topWeight * 0.8, 2.5);
      const reps = repsPerWeek[w];

      const topSetSpec: SetSpec = {
        sets: topSetWeekly,
        reps: { min: reps, max: reps },
        weight: topWeight,
        rir: PRIMARY_RIR[w],
        isTopSet: true,
      };

      // Back-off reps stay at the top of the target range.
      // RIR fixed high — back-off accumulates volume, not intensity.
      // 2×/week: double the back-off count (weekly total); per session stays unchanged.
      const backOffSets = frequency === 2
        ? PRIMARY_BACKOFF_COUNTS[w] * 2
        : PRIMARY_BACKOFF_COUNTS[w];

      const backOffSetSpec: SetSpec = {
        sets: backOffSets,
        reps: { min: max, max: max + 2 },
        weight: backOffWeight,
        rir: PRIMARY_RIR[w] + 2,
        isBackOffSet: true,
      };

      weeks.push({
        weekNumber: w,
        phase: 'working',
        setSpec: topSetSpec,
        backOffSetSpec,
      });
    }
  }

  return weeks;
}

// ─── Secondary Compound ──────────────────────────────────────────────────────

const SECONDARY_RIR: Record<number, number> = { 1: 4, 2: 3, 3: 2, 4: 1, 5: 4 };

function secondaryCompoundWeeks(
  ex: Exercise,
  effectiveStartWeight: number,
  frequency: 1 | 2,
): WeeklyExercisePlan[] {
  const { min, max } = ex.targetRepRange;

  // 1×: start at MEV, add 1 set/week
  // 2×: start at 1.5×MEV (rounded up to even), add 2 sets/week — keeps sessions even
  const weeklyStart = frequency === 2 ? twoXMEV(ex.startingSets) : ex.startingSets;
  const weeklyStep  = frequency === 2 ? 2 : 1;

  const deload1x = Math.max(2, Math.floor(ex.startingSets / 2));
  const deloadSets = frequency === 2 ? Math.max(4, deload1x * 2) : deload1x;

  const weeks: WeeklyExercisePlan[] = [];

  for (let w = 1; w <= 5; w++) {
    if (w === 5) {
      weeks.push({
        weekNumber: 5,
        phase: 'deload',
        setSpec: {
          sets: deloadSets,
          reps: { min: max, max: max + 2 },
          weight: roundToNearest(effectiveStartWeight * 0.9, 2.5),
          rir: 4,
        },
      });
    } else {
      const sets = weeklyStart + (w - 1) * weeklyStep;
      const weight = w >= 3 ? roundToNearest(effectiveStartWeight + 2.5, 2.5) : effectiveStartWeight;
      weeks.push({
        weekNumber: w,
        phase: 'working',
        setSpec: { sets, reps: { min, max }, weight, rir: SECONDARY_RIR[w] },
      });
    }
  }

  return weeks;
}

// ─── Isolation ───────────────────────────────────────────────────────────────

const ISOLATION_RIR: Record<number, number> = { 1: 3, 2: 3, 3: 2, 4: 2, 5: 4 };

function isolationWeeks(
  ex: Exercise,
  effectiveStartWeight: number,
  frequency: 1 | 2,
): WeeklyExercisePlan[] {
  const { min, max } = ex.targetRepRange;

  const weeklyStart = frequency === 2 ? twoXMEV(ex.startingSets) : ex.startingSets;
  const weeklyStep  = frequency === 2 ? 2 : 1;

  const deload1x = Math.max(2, Math.floor(ex.startingSets / 2));
  const deloadSets = frequency === 2 ? Math.max(4, deload1x * 2) : deload1x;

  const weeks: WeeklyExercisePlan[] = [];

  for (let w = 1; w <= 5; w++) {
    if (w === 5) {
      weeks.push({
        weekNumber: 5,
        phase: 'deload',
        setSpec: {
          sets: deloadSets,
          reps: { min: max, max: max + 4 },
          weight: roundToNearest(effectiveStartWeight * 0.875, 2.5),
          rir: 4,
        },
      });
    } else {
      const sets = weeklyStart + (w - 1) * weeklyStep;
      const weight = w === 4 ? roundToNearest(effectiveStartWeight + 2.5, 2.5) : effectiveStartWeight;
      weeks.push({
        weekNumber: w,
        phase: 'working',
        setSpec: { sets, reps: { min, max }, weight, rir: ISOLATION_RIR[w] },
      });
    }
  }

  return weeks;
}

// ─── Generate Mesocycle ───────────────────────────────────────────────────────

export function generateMesocycle(program: Program, mesoIndex: number): Mesocycle {
  const baselineMultiplier = 1 + mesoIndex * 0.025;
  const days: MesocycleDayPlan[] = [];

  for (const day of program.days) {
    const exercises: MesocycleExercisePlan[] = [];

    const freq = day.frequency ?? 1;

    for (const ex of day.exercises) {
      const effectiveStartWeight = roundToNearest(
        ex.startingWeight * baselineMultiplier,
        2.5
      );

      let weeks: WeeklyExercisePlan[];

      if (ex.category === 'primary_compound') {
        weeks = primaryCompoundWeeks(ex, effectiveStartWeight, freq);
      } else if (ex.category === 'secondary_compound') {
        weeks = secondaryCompoundWeeks(ex, effectiveStartWeight, freq);
      } else {
        weeks = isolationWeeks(ex, effectiveStartWeight, freq);
      }

      exercises.push({
        exerciseId: ex.id,
        exerciseName: ex.name,
        category: ex.category,
        weeks,
      });
    }

    days.push({
      trainingDayId: day.id,
      trainingDayName: day.name,
      frequency: day.frequency ?? 1,
      exercises,
    });
  }

  return {
    id: uuid(),
    programId: program.id,
    index: mesoIndex,
    name: `Mesocycle ${mesoIndex + 1}`,
    totalWeeks: 5,
    days,
    baselineMultiplier,
    generatedAt: new Date().toISOString(),
  };
}

// ─── Generate Macrocycle ──────────────────────────────────────────────────────

export function generateMacrocycle(
  program: Program,
  mesoCount: 3 | 4
): Macrocycle {
  const mesocycles: Mesocycle[] = [];

  for (let i = 0; i < mesoCount; i++) {
    mesocycles.push(generateMesocycle(program, i));
  }

  // Build volume progression data
  const volumeProgression: VolumeDataPoint[] = [];
  let absoluteWeek = 1;

  for (const meso of mesocycles) {
    for (let weekNum = 1; weekNum <= 5; weekNum++) {
      let totalSets = 0;
      const isDeload = weekNum === 5;

      for (const day of meso.days) {
        for (const exPlan of day.exercises) {
          const weekPlan = exPlan.weeks.find((w) => w.weekNumber === weekNum);
          if (weekPlan) {
            totalSets += weekPlan.setSpec.sets;
            if (weekPlan.backOffSetSpec) {
              totalSets += weekPlan.backOffSetSpec.sets;
            }
          }
        }
      }

      volumeProgression.push({
        week: absoluteWeek,
        mesoIndex: meso.index,
        totalSets,
        isDeload,
      });

      absoluteWeek++;
    }
  }

  return {
    id: uuid(),
    programId: program.id,
    name: `Macrocycle — ${mesoCount} Mesocycles`,
    mesocycles,
    totalWeeks: mesoCount * 5,
    volumeProgression,
    createdAt: new Date().toISOString(),
  };
}

// ─── Adjustment Suggestions ───────────────────────────────────────────────────

import type { WorkoutLog, AdjustmentSuggestion } from '../types';

export function computeAdjustmentSuggestions(
  log: WorkoutLog,
  mesocycle: Mesocycle
): AdjustmentSuggestion[] {
  const suggestions: AdjustmentSuggestion[] = [];

  for (const exLog of log.exercises) {
    if (exLog.sets.length === 0) continue;

    const avgActualRir =
      exLog.sets.reduce((sum, s) => sum + s.rir, 0) / exLog.sets.length;
    const prescribedRir = exLog.sets[0].prescribedRir;
    const deviation = avgActualRir - prescribedRir;

    // Find category from mesocycle
    let category: 'primary_compound' | 'secondary_compound' | 'isolation' = 'secondary_compound';
    for (const day of mesocycle.days) {
      const found = day.exercises.find((e) => e.exerciseId === exLog.exerciseId);
      if (found) { category = found.category; break; }
    }
    const weightStep = category === 'primary_compound' ? 2.5 : 1.25;

    if (deviation > 2) {
      suggestions.push({
        exerciseId: exLog.exerciseId,
        exerciseName: exLog.exerciseName,
        type: 'increase_weight',
        magnitude: weightStep,
        reason: `Avg RIR ${avgActualRir.toFixed(1)} vs prescribed ${prescribedRir} — felt too easy`,
      });
    } else if (deviation < -1) {
      suggestions.push({
        exerciseId: exLog.exerciseId,
        exerciseName: exLog.exerciseName,
        type: 'decrease_weight',
        magnitude: weightStep,
        reason: `Avg RIR ${avgActualRir.toFixed(1)} vs prescribed ${prescribedRir} — felt too hard`,
      });
    }
  }

  return suggestions;
}
