import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generateMesocycle } from '../lib/periodization';
import type { Mesocycle, Program } from '../types';

interface MesocycleState {
  mesocycles: Mesocycle[];
  activeMesocycleId: string | null;
  activeMesocycle: () => Mesocycle | null;
  generateForProgram: (program: Program) => Mesocycle;
  setActive: (id: string) => void;
  clearForProgram: (programId: string) => void;
}

export const useMesocycleStore = create<MesocycleState>()(
  persist(
    (set, get) => ({
      mesocycles: [],
      activeMesocycleId: null,

      activeMesocycle: () => {
        const { mesocycles, activeMesocycleId } = get();
        return mesocycles.find((m) => m.id === activeMesocycleId) ?? null;
      },

      generateForProgram: (program) => {
        const existing = get().mesocycles.filter((m) => m.programId === program.id);
        const nextIndex = existing.length;
        const meso = generateMesocycle(program, nextIndex);
        set((s) => ({
          mesocycles: [...s.mesocycles, meso],
          activeMesocycleId: meso.id,
        }));
        return meso;
      },

      setActive: (id) => set({ activeMesocycleId: id }),

      clearForProgram: (programId) =>
        set((s) => ({
          mesocycles: s.mesocycles.filter((m) => m.programId !== programId),
          activeMesocycleId: null,
        })),
    }),
    { name: 'mesocycle_mesos' }
  )
);
