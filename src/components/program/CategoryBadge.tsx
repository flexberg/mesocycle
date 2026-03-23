import type { ExerciseCategory } from '../../types';

const config: Record<ExerciseCategory, { label: string; className: string }> = {
  primary_compound: {
    label: 'Primary',
    className: 'bg-blue-500/15 text-blue-400 border border-blue-500/30',
  },
  secondary_compound: {
    label: 'Secondary',
    className: 'bg-violet-500/15 text-violet-400 border border-violet-500/30',
  },
  isolation: {
    label: 'Isolation',
    className: 'bg-gray-500/15 text-gray-400 border border-gray-500/30',
  },
};

export function CategoryBadge({ category }: { category: ExerciseCategory }) {
  const { label, className } = config[category];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${className}`}>
      {label}
    </span>
  );
}
