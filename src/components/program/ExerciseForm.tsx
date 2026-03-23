import { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import type { ExerciseFormData, ExerciseCategory } from '../../types';

interface ExerciseFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ExerciseFormData) => void;
  initialData?: ExerciseFormData;
  title?: string;
}

const defaultData: ExerciseFormData = {
  name: '',
  category: 'secondary_compound',
  repRangeMin: 8,
  repRangeMax: 12,
  startingSets: 3,
  startingWeight: 60,
  notes: '',
};

const categoryOptions = [
  { value: 'primary_compound', label: 'Primary Compound (Squat, Bench, Row…)' },
  { value: 'secondary_compound', label: 'Secondary Compound (RDL, Incline Press…)' },
  { value: 'isolation', label: 'Isolation (Curls, Lateral Raises…)' },
];

export function ExerciseForm({ open, onClose, onSubmit, initialData, title = 'Add Exercise' }: ExerciseFormProps) {
  const [form, setForm] = useState<ExerciseFormData>(initialData ?? defaultData);
  const [errors, setErrors] = useState<Partial<Record<keyof ExerciseFormData, string>>>({});

  const set = <K extends keyof ExerciseFormData>(key: K, value: ExerciseFormData[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const validate = () => {
    const e: typeof errors = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (form.repRangeMin >= form.repRangeMax) e.repRangeMax = 'Max must be greater than min';
    if (form.startingSets < 1) e.startingSets = 'At least 1 set';
    if (form.startingWeight <= 0) e.startingWeight = 'Weight must be positive';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSubmit(form);
    setForm(initialData ?? defaultData);
    setErrors({});
    onClose();
  };

  const handleClose = () => {
    setForm(initialData ?? defaultData);
    setErrors({});
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={title}
      footer={
        <>
          <Button variant="ghost" onClick={handleClose}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit}>Save Exercise</Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Input
          label="Exercise Name"
          placeholder="e.g. Barbell Bench Press"
          value={form.name}
          onChange={(e) => set('name', e.target.value)}
          error={errors.name}
          autoFocus
        />

        <Select
          label="Category"
          options={categoryOptions}
          value={form.category}
          onChange={(e) => set('category', e.target.value as ExerciseCategory)}
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Rep Range Min"
            type="number"
            min={1}
            max={50}
            value={form.repRangeMin}
            onChange={(e) => set('repRangeMin', parseInt(e.target.value) || 1)}
          />
          <Input
            label="Rep Range Max"
            type="number"
            min={1}
            max={50}
            value={form.repRangeMax}
            onChange={(e) => set('repRangeMax', parseInt(e.target.value) || 1)}
            error={errors.repRangeMax}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Starting Sets (MEV)"
            type="number"
            min={1}
            max={10}
            value={form.startingSets}
            onChange={(e) => set('startingSets', parseInt(e.target.value) || 1)}
            error={errors.startingSets}
            hint="Minimum effective volume"
          />
          <Input
            label="Starting Weight (kg)"
            type="number"
            min={0.5}
            step={2.5}
            value={form.startingWeight}
            onChange={(e) => set('startingWeight', parseFloat(e.target.value) || 0)}
            error={errors.startingWeight}
          />
        </div>

        <Input
          label="Notes (optional)"
          placeholder="Any cues or notes..."
          value={form.notes ?? ''}
          onChange={(e) => set('notes', e.target.value)}
        />
      </div>
    </Modal>
  );
}
