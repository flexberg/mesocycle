// ─── Exercise ────────────────────────────────────────────────────────────────

export type ExerciseCategory =
  | 'primary_compound'
  | 'secondary_compound'
  | 'isolation';

export interface RepRange {
  min: number;
  max: number;
}

export interface Exercise {
  id: string;
  name: string;
  category: ExerciseCategory;
  targetRepRange: RepRange;
  startingSets: number;
  startingWeight: number;
  notes?: string;
}

export interface ExerciseFormData {
  name: string;
  category: ExerciseCategory;
  repRangeMin: number;
  repRangeMax: number;
  startingSets: number;
  startingWeight: number;
  notes?: string;
}

// ─── Program ─────────────────────────────────────────────────────────────────

export interface TrainingDay {
  id: string;
  name: string;
  order: number;
  frequency: 1 | 2;
  exercises: Exercise[];
}

export interface Program {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  days: TrainingDay[];
}

// ─── Mesocycle ────────────────────────────────────────────────────────────────

export type WeekPhase = 'working' | 'deload';

export interface SetSpec {
  sets: number;
  reps: RepRange;
  weight: number;
  rir: number;
  isTopSet?: boolean;
  isBackOffSet?: boolean;
}

export interface WeeklyExercisePlan {
  weekNumber: number;
  phase: WeekPhase;
  setSpec: SetSpec;
  backOffSetSpec?: SetSpec;
}

export interface MesocycleExercisePlan {
  exerciseId: string;
  exerciseName: string;
  category: ExerciseCategory;
  weeks: WeeklyExercisePlan[];
}

export interface MesocycleDayPlan {
  trainingDayId: string;
  trainingDayName: string;
  frequency: 1 | 2;
  exercises: MesocycleExercisePlan[];
}

export interface Mesocycle {
  id: string;
  programId: string;
  index: number;
  name: string;
  totalWeeks: number;
  days: MesocycleDayPlan[];
  baselineMultiplier: number;
  generatedAt: string;
}

// ─── Macrocycle ───────────────────────────────────────────────────────────────

export interface VolumeDataPoint {
  week: number;
  mesoIndex: number;
  totalSets: number;
  isDeload: boolean;
}

export interface Macrocycle {
  id: string;
  programId: string;
  name: string;
  mesocycles: Mesocycle[];
  totalWeeks: number;
  volumeProgression: VolumeDataPoint[];
  createdAt: string;
}

// ─── Logger ──────────────────────────────────────────────────────────────────

export interface LoggedSet {
  setNumber: number;
  reps: number;
  weight: number;
  rir: number;
  prescribedRir: number;
}

export type RIRDeviation = 'on_target' | 'too_easy' | 'too_hard';

export interface ExerciseLog {
  exerciseId: string;
  exerciseName: string;
  sets: LoggedSet[];
  rirDeviation: RIRDeviation;
  notes?: string;
}

export interface WorkoutLog {
  id: string;
  mesocycleId: string;
  weekNumber: number;
  trainingDayId: string;
  loggedAt: string;
  exercises: ExerciseLog[];
}

export interface AdjustmentSuggestion {
  exerciseId: string;
  exerciseName: string;
  type: 'increase_weight' | 'decrease_weight' | 'increase_sets' | 'decrease_sets';
  magnitude: number;
  reason: string;
}
