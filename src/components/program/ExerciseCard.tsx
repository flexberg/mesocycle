import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CategoryBadge } from './CategoryBadge';
import { ExerciseForm } from './ExerciseForm';
import { Button } from '../ui/Button';
import type { Exercise, ExerciseFormData } from '../../types';

interface ExerciseCardProps {
  exercise: Exercise;
  onUpdate: (data: ExerciseFormData) => void;
  onRemove: () => void;
}

export function ExerciseCard({ exercise, onUpdate, onRemove }: ExerciseCardProps) {
  const [editOpen, setEditOpen] = useState(false);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: exercise.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const initialFormData: ExerciseFormData = {
    name: exercise.name,
    category: exercise.category,
    repRangeMin: exercise.targetRepRange.min,
    repRangeMax: exercise.targetRepRange.max,
    startingSets: exercise.startingSets,
    startingWeight: exercise.startingWeight,
    notes: exercise.notes,
  };

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className="flex items-center gap-2 bg-surface-700 rounded-lg px-3 py-2.5 group border border-surface-600 hover:border-surface-500 transition-colors"
      >
        {/* Drag handle */}
        <button
          {...attributes}
          {...listeners}
          className="text-gray-600 hover:text-gray-400 cursor-grab active:cursor-grabbing touch-none"
          aria-label="Drag to reorder"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 6a2 2 0 11-4 0 2 2 0 014 0zm0 6a2 2 0 11-4 0 2 2 0 014 0zm0 6a2 2 0 11-4 0 2 2 0 014 0zm8-12a2 2 0 11-4 0 2 2 0 014 0zm0 6a2 2 0 11-4 0 2 2 0 014 0zm0 6a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </button>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-gray-100 truncate">{exercise.name}</span>
            <CategoryBadge category={exercise.category} />
          </div>
          <div className="text-xs text-gray-500 mt-0.5">
            {exercise.startingSets} sets × {exercise.targetRepRange.min}–{exercise.targetRepRange.max} reps
            {' '}@ {exercise.startingWeight}kg
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="sm" onClick={() => setEditOpen(true)} aria-label="Edit">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </Button>
          <Button variant="ghost" size="sm" onClick={onRemove} aria-label="Remove" className="hover:text-red-400">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </Button>
        </div>
      </div>

      <ExerciseForm
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSubmit={onUpdate}
        initialData={initialFormData}
        title="Edit Exercise"
      />
    </>
  );
}
