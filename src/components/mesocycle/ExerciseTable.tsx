import type { MesocycleExercisePlan, SetSpec } from '../../types';
import { CategoryBadge } from '../program/CategoryBadge';

interface ExerciseTableProps {
  plan: MesocycleExercisePlan;
  frequency: 1 | 2;
}

function cellBg(weekNum: number): string {
  if (weekNum === 5) return 'bg-blue-900/30 text-blue-300';
  if (weekNum === 4) return 'bg-red-900/30 text-red-300';
  if (weekNum === 3) return 'bg-orange-900/30 text-orange-300';
  return 'bg-green-900/30 text-green-300';
}

function weekHeaderBg(weekNum: number): string {
  if (weekNum === 5) return 'text-blue-400';
  if (weekNum === 4) return 'text-red-400';
  if (weekNum === 3) return 'text-orange-400';
  return 'text-green-400';
}

function formatReps(reps: { min: number; max: number }): string {
  return reps.min === reps.max ? `${reps.min}` : `${reps.min}–${reps.max}`;
}

interface SetCellProps {
  spec: SetSpec;
  weekNum: number;
  frequency?: 1 | 2;
}

function SetCell({ spec, weekNum, frequency = 1 }: SetCellProps) {
  const perSession = frequency === 2 ? Math.ceil(spec.sets / 2) : null;
  return (
    <td className={`px-2 py-2 text-center align-top ${cellBg(weekNum)}`}>
      <div className="font-mono text-xs font-semibold whitespace-nowrap">
        {spec.sets}×{formatReps(spec.reps)}
      </div>
      <div className="text-xs opacity-80 whitespace-nowrap">@ {spec.weight}kg</div>
      {perSession !== null && (
        <div className="text-xs opacity-60 whitespace-nowrap mt-0.5">
          {perSession}×/session
        </div>
      )}
      <div className="text-xs opacity-50">RIR {spec.rir}</div>
    </td>
  );
}

export function ExerciseTable({ plan, frequency }: ExerciseTableProps) {
  const isPrimary = plan.category === 'primary_compound';

  return (
    <div className="bg-surface-800 border border-surface-600 rounded overflow-hidden">
      {/* Exercise header */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-surface-700">
        <span className="font-medium text-gray-100 text-sm">{plan.exerciseName}</span>
        <CategoryBadge category={plan.category} />
        {frequency === 2 && (
          <span className="ml-auto text-xs text-amber-400/70 font-bold uppercase tracking-widest">2×/week</span>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-surface-700">
              <th className="px-3 py-2 text-left text-xs text-gray-500 font-medium w-24 shrink-0">Sets</th>
              {plan.weeks.map((w) => (
                <th
                  key={w.weekNumber}
                  className={`px-2 py-2 text-center text-xs font-semibold w-28 ${weekHeaderBg(w.weekNumber)}`}
                >
                  {w.weekNumber === 5 ? (
                    <>Week 5 <span className="block text-blue-400/70 font-normal">Deload</span></>
                  ) : (
                    `Week ${w.weekNumber}`
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isPrimary ? (
              <>
                {/* Top set row */}
                <tr className="border-b border-surface-700/50">
                  <td className="px-3 py-2 text-xs text-gray-500 font-medium align-middle">Top Set</td>
                  {plan.weeks.map((w) => (
                    // Top set is always 1 set — frequency doesn't split it further
                    <SetCell key={w.weekNumber} spec={w.setSpec} weekNum={w.weekNumber} frequency={1} />
                  ))}
                </tr>
                {/* Back-off sets row */}
                <tr>
                  <td className="px-3 py-2 text-xs text-gray-500 font-medium align-middle">Back-off</td>
                  {plan.weeks.map((w) => (
                    w.weekNumber === 5 ? (
                      <td key={5} className={`px-2 py-2 text-center text-xs ${cellBg(5)} opacity-40`}>—</td>
                    ) : (
                      <SetCell key={w.weekNumber} spec={w.backOffSetSpec!} weekNum={w.weekNumber} frequency={frequency} />
                    )
                  ))}
                </tr>
              </>
            ) : (
              <tr>
                <td className="px-3 py-2 text-xs text-gray-500 font-medium align-middle">
                  {frequency === 2 ? 'Weekly Sets' : 'Working Sets'}
                </td>
                {plan.weeks.map((w) => (
                  <SetCell key={w.weekNumber} spec={w.setSpec} weekNum={w.weekNumber} frequency={frequency} />
                ))}
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
