import { useState } from 'react';
import { ExerciseTable } from './ExerciseTable';
import { useMesocycleStore } from '../../store/mesocycleStore';
import type { MesocycleDayPlan } from '../../types';

export function MesocycleView() {
  const { mesocycles, activeMesocycleId, setActive } = useMesocycleStore();
  const [activeDayIndex, setActiveDayIndex] = useState(0);

  const meso = mesocycles.find((m) => m.id === activeMesocycleId) ?? mesocycles[mesocycles.length - 1];

  if (!meso) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 text-center p-6">
        <svg className="w-12 h-12 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <h3 className="text-lg font-semibold text-gray-300">No Mesocycle Generated</h3>
        <p className="text-gray-500 text-sm max-w-xs">
          Go to the Program Builder, add your exercises, and click "Generate Training Plan".
        </p>
      </div>
    );
  }

  const day: MesocycleDayPlan = meso.days[activeDayIndex] ?? meso.days[0];

  return (
    <div className="flex flex-col gap-4 p-4 max-w-4xl mx-auto w-full">
      {/* Meso selector */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm text-gray-500">Mesocycle:</span>
        {mesocycles.map((m) => (
          <button
            key={m.id}
            onClick={() => setActive(m.id)}
            className={`px-3 py-1 rounded-md text-sm font-medium border transition-colors cursor-pointer ${
              m.id === meso.id
                ? 'bg-blue-600/20 text-blue-400 border-blue-600/40'
                : 'text-gray-500 border-surface-600 hover:border-surface-500 hover:text-gray-300'
            }`}
          >
            {m.name}
          </button>
        ))}
      </div>

      {/* Color legend */}
      <div className="flex items-center gap-4 flex-wrap text-xs">
        {[
          { color: 'bg-green-500', label: 'Easy (W1–2)' },
          { color: 'bg-amber-500', label: 'Moderate (W3)' },
          { color: 'bg-red-500', label: 'Hard (W4)' },
          { color: 'bg-blue-500', label: 'Deload (W5)' },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <span className={`w-2.5 h-2.5 rounded-sm ${color} opacity-60`} />
            <span className="text-gray-500">{label}</span>
          </div>
        ))}
      </div>

      {/* Day tabs */}
      {meso.days.length > 1 && (
        <div className="flex gap-1 overflow-x-auto pb-1">
          {meso.days.map((d, i) => (
            <button
              key={d.trainingDayId}
              onClick={() => setActiveDayIndex(i)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors cursor-pointer ${
                i === activeDayIndex
                  ? 'bg-surface-700 text-gray-100'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {d.trainingDayName}
            </button>
          ))}
        </div>
      )}

      {/* Exercises */}
      <div className="flex flex-col gap-3">
        {day.exercises.length === 0 && (
          <p className="text-gray-600 text-sm text-center py-8">No exercises in this day.</p>
        )}
        {day.exercises.map((exPlan) => (
          <div key={exPlan.exerciseId}>
            <ExerciseTable plan={exPlan} frequency={day.frequency} />
          </div>
        ))}
      </div>
    </div>
  );
}
