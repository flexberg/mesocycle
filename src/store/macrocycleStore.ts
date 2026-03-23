import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generateMacrocycle } from '../lib/periodization';
import type { Macrocycle, Program } from '../types';

interface MacrocycleState {
  macrocycles: Macrocycle[];
  activeMacrocycleId: string | null;
  activeMacrocycle: () => Macrocycle | null;
  generateForProgram: (program: Program, mesoCount: 3 | 4) => Macrocycle;
  clearForProgram: (programId: string) => void;
}

export const useMacrocycleStore = create<MacrocycleState>()(
  persist(
    (set, get) => ({
      macrocycles: [],
      activeMacrocycleId: null,

      activeMacrocycle: () => {
        const { macrocycles, activeMacrocycleId } = get();
        return macrocycles.find((m) => m.id === activeMacrocycleId) ?? null;
      },

      generateForProgram: (program, mesoCount) => {
        const macro = generateMacrocycle(program, mesoCount);
        set((s) => ({
          macrocycles: [
            ...s.macrocycles.filter((m) => m.programId !== program.id),
            macro,
          ],
          activeMacrocycleId: macro.id,
        }));
        return macro;
      },

      clearForProgram: (programId) =>
        set((s) => ({
          macrocycles: s.macrocycles.filter((m) => m.programId !== programId),
          activeMacrocycleId: null,
        })),
    }),
    { name: 'mesocycle_macros' }
  )
);
