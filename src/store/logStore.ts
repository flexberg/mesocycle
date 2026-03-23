import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuid } from 'uuid';
import { computeAdjustmentSuggestions } from '../lib/periodization';
import type { WorkoutLog, AdjustmentSuggestion, Mesocycle } from '../types';

interface LogState {
  logs: WorkoutLog[];
  addLog: (log: Omit<WorkoutLog, 'id' | 'loggedAt'>) => void;
  getLogsForMeso: (mesocycleId: string) => WorkoutLog[];
  getSuggestions: (log: WorkoutLog, mesocycle: Mesocycle) => AdjustmentSuggestion[];
  removeLog: (id: string) => void;
}

export const useLogStore = create<LogState>()(
  persist(
    (set, get) => ({
      logs: [],

      addLog: (log) =>
        set((s) => ({
          logs: [
            ...s.logs,
            { ...log, id: uuid(), loggedAt: new Date().toISOString() },
          ],
        })),

      getLogsForMeso: (mesocycleId) =>
        get().logs.filter((l) => l.mesocycleId === mesocycleId),

      getSuggestions: (log, mesocycle) =>
        computeAdjustmentSuggestions(log, mesocycle),

      removeLog: (id) =>
        set((s) => ({ logs: s.logs.filter((l) => l.id !== id) })),
    }),
    { name: 'mesocycle_logs' }
  )
);
