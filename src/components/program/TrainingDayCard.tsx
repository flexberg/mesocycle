import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { ExerciseCard } from './ExerciseCard';
import { ExerciseForm } from './ExerciseForm';
import { Button } from '../ui/Button';
import { useProgramStore } from '../../store/programStore';
import type { TrainingDay, ExerciseFormData } from '../../types';


interface TrainingDayCardProps {
  day: TrainingDay;
  programId: string;
  onRemoveDay: () => void;
}

export function TrainingDayCard({ day, programId, onRemoveDay }: TrainingDayCardProps) {
  const [expanded, setExpanded] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const { addExercise, updateExercise, removeExercise, reorderExercises, updateDayFrequency } = useProgramStore();

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: day.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleExerciseDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = day.exercises.findIndex((e) => e.id === active.id);
    const newIndex = day.exercises.findIndex((e) => e.id === over.id);
    const reordered = arrayMove(day.exercises, oldIndex, newIndex);
    reorderExercises(programId, day.id, reordered.map((e) => e.id));
  };

  return (
    <>
      <div ref={setNodeRef} style={style} className="bg-surface-800 border border-surface-700 rounded-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-2 px-4 py-3 bg-surface-700/50">
          {/* Day drag handle */}
          <button
            {...attributes}
            {...listeners}
            className="text-gray-600 hover:text-gray-400 cursor-grab active:cursor-grabbing touch-none"
            aria-label="Drag day"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 6a2 2 0 11-4 0 2 2 0 014 0zm0 6a2 2 0 11-4 0 2 2 0 014 0zm0 6a2 2 0 11-4 0 2 2 0 014 0zm8-12a2 2 0 11-4 0 2 2 0 014 0zm0 6a2 2 0 11-4 0 2 2 0 014 0zm0 6a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </button>

          <button
            onClick={() => setExpanded((v) => !v)}
            className="flex-1 flex items-center gap-2 text-left cursor-pointer"
          >
            <span className="font-semibold text-gray-100">{day.name}</span>
            <span className="text-xs text-gray-500">{day.exercises.length} exercise{day.exercises.length !== 1 ? 's' : ''}</span>
            <svg
              className={`w-4 h-4 text-gray-500 ml-auto transition-transform ${expanded ? 'rotate-180' : ''}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Frequency toggle */}
          <div className="flex items-center gap-0.5 bg-surface-800 border border-surface-600 rounded-md p-0.5">
            {([1, 2] as const).map((f) => (
              <button
                key={f}
                onClick={(e) => { e.stopPropagation(); updateDayFrequency(programId, day.id, f); }}
                className={`px-2 py-0.5 rounded text-xs font-semibold transition-colors cursor-pointer ${
                  (day.frequency ?? 1) === f
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
                title={f === 1 ? '1× per week' : '2× per week — sets split across 2 sessions'}
              >
                {f}×
              </button>
            ))}
          </div>

          <Button variant="ghost" size="sm" onClick={onRemoveDay} className="text-gray-600 hover:text-red-400">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        </div>

        {/* Exercises */}
        {expanded && (
          <div className="p-3 flex flex-col gap-2">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleExerciseDragEnd}
            >
              <SortableContext
                items={day.exercises.map((e) => e.id)}
                strategy={verticalListSortingStrategy}
              >
                {day.exercises.map((ex) => (
                  <ExerciseCard
                    key={ex.id}
                    exercise={ex}
                    onUpdate={(data: ExerciseFormData) => updateExercise(programId, day.id, ex.id, data)}
                    onRemove={() => removeExercise(programId, day.id, ex.id)}
                  />
                ))}
              </SortableContext>
            </DndContext>

            {day.exercises.length === 0 && (
              <p className="text-xs text-gray-600 text-center py-4">No exercises yet — add one below</p>
            )}

            <Button variant="ghost" size="sm" onClick={() => setAddOpen(true)} className="w-full text-blue-400 hover:text-blue-300 mt-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Add Exercise
            </Button>
          </div>
        )}
      </div>

      <ExerciseForm
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSubmit={(data) => addExercise(programId, day.id, data)}
      />
    </>
  );
}
