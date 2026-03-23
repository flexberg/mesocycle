import type { ExerciseCategory } from '../../types';

const config: Record<ExerciseCategory, { label: string; className: string }> = {
  primary_compound: {
    label: 'Primary',
    className: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
  },
  secondary_compound: {
    label: 'Secondary',
    className: 'bg-orange-500/15 text-orange-400 border border-orange-500/30',
  },
  isolation: {
    label: 'Isolation',
    className: 'bg-gray-500/15 text-gray-400 border border-gray-500/30',
  },
};

export function CategoryBadge({ category }: { category: ExerciseCategory }) {
  const { label, className } = config[category];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-bold uppercase tracking-wider ${className}`}>
      {label}
    </span>
  );
}
