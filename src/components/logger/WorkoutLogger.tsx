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

// ─── RIR Deviation ────────────────────────────────────────────────────────────

function RIRIndicator({ prescribed, actual }: { prescribed: number; actual: number }) {
  const diff = actual - prescribed;
  if (Math.abs(diff) <= 1)
    return <span className="text-green-400 text-xs font-bold uppercase tracking-wide">On target</span>;
  if (diff > 1)
    return <span className="text-amber-400 text-xs font-bold uppercase tracking-wide">Too easy</span>;
  return <span className="text-red-400 text-xs font-bold uppercase tracking-wide">Too hard</span>;
}

// ─── Set Row ──────────────────────────────────────────────────────────────────

interface SetRowProps {
  setNum: number;
  prescribed: SetSpec;
  value: LoggedSet;
  onChange: (v: LoggedSet) => void;
  onClear: () => void;
}

function SetRow({ setNum, prescribed, value, onChange, onClear }: SetRowProps) {
  const [clearCount, setClearCount] = useState(0);

  const updateRir = (rir: number) => onChange({ ...value, rir });

  const handleClear = () => {
    setClearCount((c) => c + 1);
    onClear();
  };

  const filled = value.reps > 0 && value.weight > 0;

  return (
    <div className="border border-surface-600 rounded bg-surface-700 p-3 mb-2">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-black uppercase tracking-widest text-amber-400">
          Set {setNum}
        </span>
        <span className="text-xs text-gray-600 flex-1 text-center">
          {prescribed.reps.min === prescribed.reps.max
            ? prescribed.reps.min
            : `${prescribed.reps.min}–${prescribed.reps.max}`} reps · {prescribed.weight}kg · RIR {prescribed.rir}
        </span>
        <button
          onClick={handleClear}
          className="text-gray-600 hover:text-red-400 transition-colors text-xl leading-none px-1 cursor-pointer"
          title="Clear set"
        >
          ×
        </button>
      </div>

      {/* Inputs */}
      <div className="flex items-end gap-3 mb-3">
        <div className="flex-1">
          <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1.5">
            Reps
          </label>
          <input
            key={`r-${setNum}-${clearCount}`}
            type="text"
            inputMode="numeric"
            defaultValue={value.reps > 0 ? String(value.reps) : ''}
            onChange={(e) => {
              const n = parseInt(e.target.value);
              onChange({ ...value, reps: !isNaN(n) && n > 0 ? n : 0 });
            }}
            placeholder={String(prescribed.reps.max)}
            className="w-full bg-surface-800 border border-surface-500 text-gray-100 rounded px-3 py-2.5 text-base focus:outline-none focus:border-amber-500 placeholder:text-gray-700"
          />
        </div>

        <span className="text-gray-600 pb-2.5 font-black text-lg">×</span>

        <div className="flex-1">
          <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1.5">
            Weight kg
          </label>
          <input
            key={`w-${setNum}-${clearCount}`}
            type="text"
            inputMode="decimal"
            defaultValue={value.weight > 0 ? String(value.weight) : ''}
            onChange={(e) => {
              const n = parseFloat(e.target.value);
              onChange({ ...value, weight: !isNaN(n) && n >= 0 ? n : 0 });
            }}
            placeholder={String(prescribed.weight)}
            className="w-full bg-surface-800 border border-surface-500 text-gray-100 rounded px-3 py-2.5 text-base focus:outline-none focus:border-amber-500 placeholder:text-gray-700"
          />
        </div>
      </div>

      {/* RIR */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-xs font-bold uppercase tracking-widest text-gray-600 mr-1">RIR</span>
        {[0, 1, 2, 3, 4, 5].map((r) => (
          <button
            key={r}
            onClick={() => updateRir(r)}
            className={`w-9 h-9 rounded text-sm font-black transition-colors cursor-pointer ${
              value.rir === r
                ? 'bg-amber-500 text-black'
                : 'bg-surface-800 text-gray-500 hover:bg-surface-600 border border-surface-500'
            }`}
          >
            {r}
          </button>
        ))}
        {filled && (
          <span className="ml-auto">
            <RIRIndicator prescribed={prescribed.rir} actual={value.rir} />
          </span>
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
    const filled = newSets.filter((s) => s.reps > 0 && s.weight > 0);
    const avgRir = filled.length > 0
      ? filled.reduce((a, s) => a + s.rir, 0) / filled.length
      : prescribed.rir;
    const dev = avgRir - prescribed.rir;
    onChange({
      ...value,
      sets: newSets,
      rirDeviation: Math.abs(dev) <= 1 ? 'on_target' : dev > 1 ? 'too_easy' : 'too_hard',
    });
  };

  const clearSet = (idx: number) => {
    updateSet(idx, {
      setNumber: idx + 1,
      reps: 0,
      weight: 0,
      rir: prescribed.rir,
      prescribedRir: prescribed.rir,
    });
  };

  return (
    <div className="bg-surface-800 border border-surface-600 rounded overflow-hidden">
      <div className="px-4 py-3 border-b border-surface-600 bg-surface-700">
        <div className="font-black text-gray-100 text-sm uppercase tracking-wide">{plan.exerciseName}</div>
        <div className="text-xs text-gray-600 mt-0.5 uppercase tracking-widest">
          {plan.category.replace(/_/g, ' ')} · {prescribed.sets} sets prescribed
        </div>
      </div>
      <div className="p-3">
        {sets.map((set, i) => (
          <SetRow
            key={i}
            setNum={i + 1}
            prescribed={i < prescribed.sets ? prescribed : weekPlan.backOffSetSpec ?? prescribed}
            value={{ ...set, setNumber: i + 1 }}
            onChange={(v) => updateSet(i, v)}
            onClear={() => clearSet(i)}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Suggestion Card ──────────────────────────────────────────────────────────

function SuggestionCard({ suggestion }: { suggestion: AdjustmentSuggestion }) {
  const isUp = suggestion.type === 'increase_weight' || suggestion.type === 'increase_sets';
  return (
    <div className={`flex items-start gap-3 p-3 rounded border ${
      isUp ? 'bg-green-900/20 border-green-700/40' : 'bg-red-900/20 border-red-800/40'
    }`}>
      <span className={`text-2xl font-black ${isUp ? 'text-green-400' : 'text-red-400'}`}>
        {isUp ? '↑' : '↓'}
      </span>
      <div>
        <div className="text-sm font-black text-gray-100 uppercase tracking-wide">{suggestion.exerciseName}</div>
        <div className="text-xs text-gray-400 mt-0.5">{suggestion.reason}</div>
        <div className={`text-xs font-black mt-1 uppercase tracking-widest ${isUp ? 'text-green-400' : 'text-red-400'}`}>
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
    label: i === 4 ? 'Week 5 — Deload' : `Week ${i + 1}`,
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
    const fullLog: WorkoutLog = { ...log, id: 'temp', loggedAt: new Date().toISOString() };
    setSuggestions(getSuggestions(fullLog, meso));
    setSaved(true);
    setExerciseLogs({});
  };

  if (mesocycles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 text-center p-6">
        <svg className="w-12 h-12 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <h3 className="text-lg font-black text-gray-300 uppercase tracking-wide">No Plan Yet</h3>
        <p className="text-gray-500 text-sm max-w-xs">Generate a training plan first, then log your workouts here.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4 max-w-3xl mx-auto w-full">
      <h2 className="text-xs font-black text-gray-500 uppercase tracking-widest">Log Workout</h2>

      {/* Selectors */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Select label="Mesocycle" options={mesoOptions} value={selectedMesoId}
          onChange={(e) => { setSelectedMesoId(e.target.value); setSaved(false); }} />
        <Select label="Week" options={weekOptions} value={selectedWeek}
          onChange={(e) => { setSelectedWeek(e.target.value); setSaved(false); }} />
        <Select label="Training Day" options={dayOptions} value={selectedDayIdx}
          onChange={(e) => { setSelectedDayIdx(e.target.value); setSaved(false); }} />
      </div>

      {/* Post-save feedback */}
      {saved && suggestions.length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Adjustments for Next Session</h3>
          {suggestions.map((s) => (
            <SuggestionCard key={s.exerciseId} suggestion={s} />
          ))}
        </div>
      )}
      {saved && suggestions.length === 0 && (
        <div className="bg-green-900/20 border border-green-700/40 rounded p-3 text-sm font-bold text-green-300 uppercase tracking-wide">
          Session saved — RIR on target. No adjustments needed.
        </div>
      )}

      {/* Exercise loggers */}
      {day?.exercises.map((exPlan) => (
        <ExerciseLogger
          key={`${exPlan.exerciseId}-${selectedWeek}-${selectedDayIdx}`}
          plan={exPlan}
          weekNum={weekNum}
          value={getOrCreateLog(exPlan.exerciseId, exPlan.exerciseName)}
          onChange={(log) =>
            setExerciseLogs((prev) => ({ ...prev, [exPlan.exerciseId]: log }))
          }
        />
      ))}

      {day && (
        <Button variant="primary" size="lg" onClick={handleSave} className="mt-2 w-full">
          Save Session
        </Button>
      )}
    </div>
  );
}
