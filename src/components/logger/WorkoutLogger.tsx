import { useState } from 'react';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { useMesocycleStore } from '../../store/mesocycleStore';
import { useLogStore } from '../../store/logStore';
import type {
  ExerciseLog,
  LoggedSet,
  WorkoutLog,
  AdjustmentSuggestion,
  MesocycleExercisePlan,
  SetSpec,
} from '../../types';

// ─── RIR Deviation Indicator ──────────────────────────────────────────────────

function RIRIndicator({ prescribed, actual }: { prescribed: number; actual: number }) {
  const diff = actual - prescribed;
  if (Math.abs(diff) <= 1)
    return <span className="text-green-400 text-xs font-medium">On target</span>;
  if (diff > 1)
    return <span className="text-amber-400 text-xs font-medium">Too easy</span>;
  return <span className="text-red-400 text-xs font-medium">Too hard</span>;
}

// ─── Set Row ──────────────────────────────────────────────────────────────────

interface SetRowProps {
  setNum: number;
  prescribed: SetSpec;
  value: LoggedSet;
  onChange: (v: LoggedSet) => void;
}

function SetRow({ setNum, prescribed, value, onChange }: SetRowProps) {
  const update = (field: keyof LoggedSet, val: number) =>
    onChange({ ...value, [field]: val });

  return (
    <div className="flex items-center gap-2 py-2 border-b border-surface-700/50 last:border-0">
      <span className="text-xs text-gray-600 w-8 shrink-0">#{setNum}</span>

      {/* Prescribed */}
      <div className="text-xs text-gray-600 w-28 shrink-0">
        {prescribed.sets > 1 ? `${prescribed.reps.min}–${prescribed.reps.max}` : `${prescribed.reps.min}–${prescribed.reps.max}`} @ {prescribed.weight}kg
      </div>

      {/* Actual reps */}
      <input
        type="number"
        min={1}
        max={50}
        value={value.reps || ''}
        onChange={(e) => update('reps', parseInt(e.target.value) || 0)}
        className="w-16 bg-surface-700 border border-surface-600 text-gray-100 rounded px-2 py-1 text-sm text-center focus:outline-none focus:ring-1 focus:ring-blue-500"
        placeholder="Reps"
      />
      <span className="text-gray-600 text-xs">×</span>

      {/* Actual weight */}
      <input
        type="number"
        min={0}
        step={2.5}
        value={value.weight || ''}
        onChange={(e) => update('weight', parseFloat(e.target.value) || 0)}
        className="w-20 bg-surface-700 border border-surface-600 text-gray-100 rounded px-2 py-1 text-sm text-center focus:outline-none focus:ring-1 focus:ring-blue-500"
        placeholder="kg"
      />
      <span className="text-gray-600 text-xs">kg</span>

      {/* RIR stepper */}
      <div className="flex items-center gap-1 ml-auto">
        <span className="text-xs text-gray-500">RIR</span>
        {[0, 1, 2, 3, 4, 5].map((r) => (
          <button
            key={r}
            onClick={() => update('rir', r)}
            className={`w-6 h-6 rounded text-xs font-medium transition-colors cursor-pointer ${
              value.rir === r
                ? 'bg-blue-600 text-white'
                : 'bg-surface-700 text-gray-500 hover:bg-surface-600'
            }`}
          >
            {r}
          </button>
        ))}
        {value.reps > 0 && value.weight > 0 && (
          <RIRIndicator prescribed={prescribed.rir} actual={value.rir} />
        )}
      </div>
    </div>
  );
}

// ─── Exercise Logger ──────────────────────────────────────────────────────────

interface ExerciseLoggerProps {
  plan: MesocycleExercisePlan;
  weekNum: number;
  value: ExerciseLog;
  onChange: (log: ExerciseLog) => void;
}

function ExerciseLogger({ plan, weekNum, value, onChange }: ExerciseLoggerProps) {
  const weekPlan = plan.weeks.find((w) => w.weekNumber === weekNum);
  if (!weekPlan) return null;

  const prescribed = weekPlan.setSpec;
  const totalSets = prescribed.sets + (weekPlan.backOffSetSpec?.sets ?? 0);

  const ensureSets = (sets: LoggedSet[], count: number): LoggedSet[] => {
    const result = [...sets];
    while (result.length < count) {
      result.push({
        setNumber: result.length + 1,
        reps: 0,
        weight: prescribed.weight,
        rir: prescribed.rir,
        prescribedRir: prescribed.rir,
      });
    }
    return result.slice(0, count);
  };

  const sets = ensureSets(value.sets, totalSets);

  const updateSet = (idx: number, updated: LoggedSet) => {
    const newSets = [...sets];
    newSets[idx] = updated;
    const filledSets = newSets.filter((s) => s.reps > 0 && s.weight > 0);
    const avgRir = filledSets.length > 0
      ? filledSets.reduce((a, s) => a + s.rir, 0) / filledSets.length
      : prescribed.rir;
    const dev = avgRir - prescribed.rir;
    onChange({
      ...value,
      sets: newSets,
      rirDeviation: Math.abs(dev) <= 1 ? 'on_target' : dev > 1 ? 'too_easy' : 'too_hard',
    });
  };

  return (
    <div className="bg-surface-800 border border-surface-700 rounded-xl overflow-hidden">
      <div className="px-4 py-2.5 border-b border-surface-700 flex items-center justify-between">
        <span className="font-medium text-gray-200 text-sm">{plan.exerciseName}</span>
        <div className="text-xs text-gray-500">
          Prescribed: {prescribed.sets}×{prescribed.reps.min}–{prescribed.reps.max} @ {prescribed.weight}kg — RIR {prescribed.rir}
        </div>
      </div>

      <div className="px-4">
        <div className="flex items-center gap-2 py-1.5 text-xs text-gray-600 font-medium border-b border-surface-700/50">
          <span className="w-8">#</span>
          <span className="w-28">Prescribed</span>
          <span className="w-16 text-center">Reps</span>
          <span className="ml-4 w-20 text-center">Weight</span>
          <span className="ml-auto">RIR</span>
        </div>
        {sets.map((set, i) => (
          <SetRow
            key={i}
            setNum={i + 1}
            prescribed={i < prescribed.sets ? prescribed : weekPlan.backOffSetSpec ?? prescribed}
            value={{ ...set, setNumber: i + 1 }}
            onChange={(v) => updateSet(i, v)}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Adjustment Suggestion Card ───────────────────────────────────────────────

function SuggestionCard({ suggestion }: { suggestion: AdjustmentSuggestion }) {
  const isUp = suggestion.type === 'increase_weight' || suggestion.type === 'increase_sets';
  return (
    <div className={`flex items-start gap-3 p-3 rounded-lg border ${
      isUp ? 'bg-green-900/20 border-green-700/30' : 'bg-red-900/20 border-red-700/30'
    }`}>
      <span className={`text-xl ${isUp ? 'text-green-400' : 'text-red-400'}`}>
        {isUp ? '↑' : '↓'}
      </span>
      <div>
        <div className="text-sm font-medium text-gray-200">{suggestion.exerciseName}</div>
        <div className="text-xs text-gray-400 mt-0.5">{suggestion.reason}</div>
        <div className={`text-xs font-semibold mt-1 ${isUp ? 'text-green-400' : 'text-red-400'}`}>
          {isUp ? '+' : '-'}{suggestion.magnitude}kg next session
        </div>
      </div>
    </div>
  );
}

// ─── Main Logger ──────────────────────────────────────────────────────────────

export function WorkoutLogger() {
  const { mesocycles } = useMesocycleStore();
  const { addLog, getSuggestions } = useLogStore();

  const [selectedMesoId, setSelectedMesoId] = useState(mesocycles[0]?.id ?? '');
  const [selectedWeek, setSelectedWeek] = useState('1');
  const [selectedDayIdx, setSelectedDayIdx] = useState('0');
  const [exerciseLogs, setExerciseLogs] = useState<Record<string, ExerciseLog>>({});
  const [saved, setSaved] = useState(false);
  const [suggestions, setSuggestions] = useState<AdjustmentSuggestion[]>([]);

  const meso = mesocycles.find((m) => m.id === selectedMesoId);
  const day = meso?.days[parseInt(selectedDayIdx)];
  const weekNum = parseInt(selectedWeek);

  const mesoOptions = mesocycles.map((m) => ({ value: m.id, label: m.name }));
  const weekOptions = Array.from({ length: 5 }, (_, i) => ({
    value: String(i + 1),
    label: i === 4 ? 'Week 5 (Deload)' : `Week ${i + 1}`,
  }));
  const dayOptions = meso?.days.map((d, i) => ({ value: String(i), label: d.trainingDayName })) ?? [];

  const getOrCreateLog = (exId: string, exName: string): ExerciseLog =>
    exerciseLogs[exId] ?? {
      exerciseId: exId,
      exerciseName: exName,
      sets: [],
      rirDeviation: 'on_target',
    };

  const handleSave = () => {
    if (!meso || !day) return;
    const log: Omit<WorkoutLog, 'id' | 'loggedAt'> = {
      mesocycleId: meso.id,
      weekNumber: weekNum,
      trainingDayId: day.trainingDayId,
      exercises: day.exercises.map((e) => getOrCreateLog(e.exerciseId, e.exerciseName)),
    };
    addLog(log);

    // Compute suggestions
    const fullLog: WorkoutLog = { ...log, id: 'temp', loggedAt: new Date().toISOString() };
    const sugg = getSuggestions(fullLog, meso);
    setSuggestions(sugg);
    setSaved(true);
    setExerciseLogs({});
  };

  if (mesocycles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 text-center p-6">
        <svg className="w-12 h-12 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <h3 className="text-lg font-semibold text-gray-300">No Plan Generated Yet</h3>
        <p className="text-gray-500 text-sm max-w-xs">Generate a training plan first, then log your workouts here.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4 max-w-3xl mx-auto w-full">
      <h2 className="text-lg font-bold text-gray-100">Log Workout</h2>

      {/* Selectors */}
      <div className="grid grid-cols-3 gap-3">
        <Select label="Mesocycle" options={mesoOptions} value={selectedMesoId}
          onChange={(e) => { setSelectedMesoId(e.target.value); setSaved(false); }} />
        <Select label="Week" options={weekOptions} value={selectedWeek}
          onChange={(e) => { setSelectedWeek(e.target.value); setSaved(false); }} />
        <Select label="Training Day" options={dayOptions} value={selectedDayIdx}
          onChange={(e) => { setSelectedDayIdx(e.target.value); setSaved(false); }} />
      </div>

      {/* Suggestions from last session */}
      {saved && suggestions.length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-semibold text-gray-300">Adjustment Suggestions</h3>
          {suggestions.map((s) => (
            <SuggestionCard key={s.exerciseId} suggestion={s} />
          ))}
        </div>
      )}

      {saved && suggestions.length === 0 && (
        <div className="bg-green-900/20 border border-green-700/30 rounded-lg p-3 text-sm text-green-300">
          Session logged! RIR was on target — no adjustments needed.
        </div>
      )}

      {/* Exercise loggers */}
      {day?.exercises.map((exPlan) => (
        <ExerciseLogger
          key={exPlan.exerciseId}
          plan={exPlan}
          weekNum={weekNum}
          value={getOrCreateLog(exPlan.exerciseId, exPlan.exerciseName)}
          onChange={(log) =>
            setExerciseLogs((prev) => ({ ...prev, [exPlan.exerciseId]: log }))
          }
        />
      ))}

      {/* Save button */}
      {day && (
        <Button variant="primary" size="lg" onClick={handleSave} className="mt-2">
          Save Session
        </Button>
      )}
    </div>
  );
}
