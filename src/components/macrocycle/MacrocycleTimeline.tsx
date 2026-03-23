import type { Macrocycle } from '../../types';

interface MacrocycleTimelineProps {
  macrocycle: Macrocycle;
}

const weekColors: Record<number, string> = {
  1: 'bg-green-900/40 border-green-700/30 text-green-300',
  2: 'bg-green-900/40 border-green-700/30 text-green-300',
  3: 'bg-amber-900/40 border-amber-700/30 text-amber-300',
  4: 'bg-red-900/40 border-red-700/30 text-red-300',
  5: 'bg-blue-900/40 border-blue-700/30 text-blue-300',
};

export function MacrocycleTimeline({ macrocycle }: MacrocycleTimelineProps) {
  // Pre-compute absolute week offsets: meso i starts at week i*5+1
  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-300 mb-3">Timeline</h3>
      <div className="overflow-x-auto pb-2">
        <div className="flex gap-2" style={{ minWidth: 'max-content' }}>
          {macrocycle.mesocycles.map((meso, mesoIdx) => {
            const weekOffset = mesoIdx * 5;
            return (
              <div key={meso.id} className="flex flex-col gap-1">
                <div className="text-xs font-semibold text-gray-400 px-1 mb-1">{meso.name}</div>
                <div className="flex gap-1">
                  {Array.from({ length: 5 }, (_, i) => {
                    const weekNum = i + 1;
                    const absWeek = weekOffset + weekNum;
                    const isDeload = weekNum === 5;
                    const ex = meso.days[0]?.exercises[0];
                    const weekPlan = ex?.weeks.find((w) => w.weekNumber === weekNum);
                    return (
                      <div
                        key={weekNum}
                        className={`w-16 rounded-lg border px-2 py-2 text-center ${weekColors[weekNum]}`}
                      >
                        <div className="text-xs font-semibold">W{absWeek}</div>
                        <div className="text-xs opacity-70 mt-0.5">
                          {isDeload ? 'Deload' : `Week ${weekNum}`}
                        </div>
                        {weekPlan && (
                          <div className="text-xs opacity-50 mt-1 truncate">
                            {weekPlan.setSpec.sets}×{
                              weekPlan.setSpec.reps.min === weekPlan.setSpec.reps.max
                                ? weekPlan.setSpec.reps.min
                                : `${weekPlan.setSpec.reps.min}–${weekPlan.setSpec.reps.max}`
                            }
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
