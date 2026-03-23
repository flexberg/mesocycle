import { useState } from 'react';
import { VolumeChart } from './VolumeChart';
import { MacrocycleTimeline } from './MacrocycleTimeline';
import { Button } from '../ui/Button';
import { useMacrocycleStore } from '../../store/macrocycleStore';
import { useProgramStore } from '../../store/programStore';

export function MacrocycleView() {
  const { macrocycles, activeMacrocycleId, generateForProgram } = useMacrocycleStore();
  const { activeProgram } = useProgramStore();
  const [mesoCount, setMesoCount] = useState<3 | 4>(3);

  const macro = macrocycles.find((m) => m.id === activeMacrocycleId)
    ?? macrocycles[macrocycles.length - 1];

  const program = activeProgram();

  if (!macro) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 text-center p-6">
        <svg className="w-12 h-12 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <h3 className="text-lg font-semibold text-gray-300">No Macrocycle Generated</h3>
        <p className="text-gray-500 text-sm max-w-xs">
          Go to the Program Builder and click "Generate Training Plan".
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-4 max-w-4xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-lg font-bold text-gray-100">{macro.name}</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {macro.mesocycles.length} mesocycles · {macro.totalWeeks} total weeks
          </p>
        </div>

        {program && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Regenerate:</span>
            {([3, 4] as const).map((n) => (
              <button
                key={n}
                onClick={() => setMesoCount(n)}
                className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors cursor-pointer ${
                  mesoCount === n
                    ? 'bg-blue-600/20 text-blue-400 border-blue-600/40'
                    : 'text-gray-500 border-surface-600 hover:border-surface-500'
                }`}
              >
                {n} Mesos
              </button>
            ))}
            <Button
              variant="secondary"
              size="sm"
              onClick={() => generateForProgram(program, mesoCount)}
            >
              Regenerate
            </Button>
          </div>
        )}
      </div>

      {/* Volume chart */}
      <div className="bg-surface-800 border border-surface-700 rounded-xl p-4">
        <VolumeChart data={macro.volumeProgression} mesocycles={macro.mesocycles} />
      </div>

      {/* Timeline */}
      <div className="bg-surface-800 border border-surface-700 rounded-xl p-4">
        <MacrocycleTimeline macrocycle={macro} />
      </div>

      {/* Mesocycle summaries */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {macro.mesocycles.map((meso) => {
          const totalSets = meso.days.reduce((acc, d) =>
            acc + d.exercises.reduce((a, e) => {
              const w4 = e.weeks.find((w) => w.weekNumber === 4);
              if (!w4) return a;
              return a + w4.setSpec.sets + (w4.backOffSetSpec?.sets ?? 0);
            }, 0), 0);

          const multiplierPct = ((meso.baselineMultiplier - 1) * 100).toFixed(1);

          return (
            <div key={meso.id} className="bg-surface-700 border border-surface-600 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-gray-200 text-sm">{meso.name}</span>
                <span className="text-xs text-violet-400">+{multiplierPct}% baseline</span>
              </div>
              <div className="text-xs text-gray-500 flex gap-4">
                <span>{meso.days.length} days</span>
                <span>~{totalSets} sets peak week</span>
              </div>
              <div className="flex gap-1 mt-2">
                {['W1', 'W2', 'W3', 'W4', 'DL'].map((w, i) => (
                  <div
                    key={w}
                    className={`flex-1 text-center text-xs py-1 rounded ${
                      i === 4 ? 'bg-blue-900/40 text-blue-400'
                        : i === 3 ? 'bg-red-900/40 text-red-400'
                        : i === 2 ? 'bg-amber-900/40 text-amber-400'
                        : 'bg-green-900/40 text-green-400'
                    }`}
                  >
                    {w}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
