import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuid } from 'uuid';
import type { Program, TrainingDay, Exercise, ExerciseFormData } from '../types';

interface ProgramState {
  programs: Program[];
  activeProgramId: string | null;
  // Derived
  activeProgram: () => Program | null;
  // Actions
  addProgram: (name: string) => string;
  removeProgram: (id: string) => void;
  setActiveProgram: (id: string) => void;
  updateProgramName: (id: string, name: string) => void;
  addDay: (programId: string, name: string) => void;
  updateDayFrequency: (programId: string, dayId: string, frequency: 1 | 2) => void;
  removeDay: (programId: string, dayId: string) => void;
  reorderDays: (programId: string, orderedIds: string[]) => void;
  addExercise: (programId: string, dayId: string, data: ExerciseFormData) => void;
  updateExercise: (programId: string, dayId: string, exerciseId: string, data: ExerciseFormData) => void;
  removeExercise: (programId: string, dayId: string, exerciseId: string) => void;
  reorderExercises: (programId: string, dayId: string, orderedIds: string[]) => void;
}

export const useProgramStore = create<ProgramState>()(
  persist(
    (set, get) => ({
      programs: [],
      activeProgramId: null,

      activeProgram: () => {
        const { programs, activeProgramId } = get();
        return programs.find((p) => p.id === activeProgramId) ?? null;
      },

      addProgram: (name) => {
        const id = uuid();
        const now = new Date().toISOString();
        set((s) => ({
          programs: [...s.programs, { id, name, createdAt: now, updatedAt: now, days: [] }],
          activeProgramId: id,
        }));
        return id;
      },

      removeProgram: (id) =>
        set((s) => ({
          programs: s.programs.filter((p) => p.id !== id),
          activeProgramId: s.activeProgramId === id ? null : s.activeProgramId,
        })),

      setActiveProgram: (id) => set({ activeProgramId: id }),

      updateProgramName: (id, name) =>
        set((s) => ({
          programs: s.programs.map((p) =>
            p.id === id ? { ...p, name, updatedAt: new Date().toISOString() } : p
          ),
        })),

      addDay: (programId, name) =>
        set((s) => ({
          programs: s.programs.map((p) => {
            if (p.id !== programId) return p;
            const order = p.days.length;
            const newDay: TrainingDay = { id: uuid(), name, order, frequency: 1, exercises: [] };
            return { ...p, days: [...p.days, newDay], updatedAt: new Date().toISOString() };
          }),
        })),

      updateDayFrequency: (programId, dayId, frequency) =>
        set((s) => ({
          programs: s.programs.map((p) => {
            if (p.id !== programId) return p;
            return {
              ...p,
              updatedAt: new Date().toISOString(),
              days: p.days.map((d) => d.id === dayId ? { ...d, frequency } : d),
            };
          }),
        })),

      removeDay: (programId, dayId) =>
        set((s) => ({
          programs: s.programs.map((p) =>
            p.id !== programId
              ? p
              : { ...p, days: p.days.filter((d) => d.id !== dayId), updatedAt: new Date().toISOString() }
          ),
        })),

      reorderDays: (programId, orderedIds) =>
        set((s) => ({
          programs: s.programs.map((p) => {
            if (p.id !== programId) return p;
            const sorted = orderedIds
              .map((id, order) => {
                const d = p.days.find((day) => day.id === id);
                return d ? { ...d, order } : null;
              })
              .filter(Boolean) as TrainingDay[];
            return { ...p, days: sorted };
          }),
        })),

      addExercise: (programId, dayId, data) =>
        set((s) => ({
          programs: s.programs.map((p) => {
            if (p.id !== programId) return p;
            return {
              ...p,
              updatedAt: new Date().toISOString(),
              days: p.days.map((d) => {
                if (d.id !== dayId) return d;
                const exercise: Exercise = {
                  id: uuid(),
                  name: data.name,
                  category: data.category,
                  targetRepRange: { min: data.repRangeMin, max: data.repRangeMax },
                  startingSets: data.startingSets,
                  startingWeight: data.startingWeight,
                  notes: data.notes,
                };
                return { ...d, exercises: [...d.exercises, exercise] };
              }),
            };
          }),
        })),

      updateExercise: (programId, dayId, exerciseId, data) =>
        set((s) => ({
          programs: s.programs.map((p) => {
            if (p.id !== programId) return p;
            return {
              ...p,
              updatedAt: new Date().toISOString(),
              days: p.days.map((d) => {
                if (d.id !== dayId) return d;
                return {
                  ...d,
                  exercises: d.exercises.map((e) =>
                    e.id !== exerciseId
                      ? e
                      : {
                          ...e,
                          name: data.name,
                          category: data.category,
                          targetRepRange: { min: data.repRangeMin, max: data.repRangeMax },
                          startingSets: data.startingSets,
                          startingWeight: data.startingWeight,
                          notes: data.notes,
                        }
                  ),
                };
              }),
            };
          }),
        })),

      removeExercise: (programId, dayId, exerciseId) =>
        set((s) => ({
          programs: s.programs.map((p) => {
            if (p.id !== programId) return p;
            return {
              ...p,
              days: p.days.map((d) =>
                d.id !== dayId ? d : { ...d, exercises: d.exercises.filter((e) => e.id !== exerciseId) }
              ),
            };
          }),
        })),

      reorderExercises: (programId, dayId, orderedIds) =>
        set((s) => ({
          programs: s.programs.map((p) => {
            if (p.id !== programId) return p;
            return {
              ...p,
              days: p.days.map((d) => {
                if (d.id !== dayId) return d;
                const sorted = orderedIds
                  .map((id) => d.exercises.find((e) => e.id === id))
                  .filter(Boolean) as Exercise[];
                return { ...d, exercises: sorted };
              }),
            };
          }),
        })),
    }),
    { name: 'mesocycle_programs' }
  )
);
