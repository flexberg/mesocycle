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

type NumericKey = 'repRangeMin' | 'repRangeMax' | 'startingSets' | 'startingWeight';

function makeDisplays(data: ExerciseFormData) {
  return {
    repRangeMin: String(data.repRangeMin),
    repRangeMax: String(data.repRangeMax),
    startingSets: String(data.startingSets),
    startingWeight: String(data.startingWeight),
  };
}

export function ExerciseForm({ open, onClose, onSubmit, initialData, title = 'Add Exercise' }: ExerciseFormProps) {
  const [form, setForm] = useState<ExerciseFormData>(initialData ?? defaultData);
  const [errors, setErrors] = useState<Partial<Record<keyof ExerciseFormData, string>>>({});
  const [displays, setDisplays] = useState(() => makeDisplays(initialData ?? defaultData));

  const set = <K extends keyof ExerciseFormData>(key: K, value: ExerciseFormData[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const setNumeric = (key: NumericKey, raw: string) => {
    setDisplays((d) => ({ ...d, [key]: raw }));
    const n = key === 'startingWeight' ? parseFloat(raw) : parseInt(raw);
    if (!isNaN(n)) set(key, n as never);
  };

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
    const reset = initialData ?? defaultData;
    setForm(reset);
    setDisplays(makeDisplays(reset));
    setErrors({});
    onClose();
  };

  const handleClose = () => {
    const reset = initialData ?? defaultData;
    setForm(reset);
    setDisplays(makeDisplays(reset));
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
            type="text"
            inputMode="numeric"
            value={displays.repRangeMin}
            onChange={(e) => setNumeric('repRangeMin', e.target.value)}
          />
          <Input
            label="Rep Range Max"
            type="text"
            inputMode="numeric"
            value={displays.repRangeMax}
            onChange={(e) => setNumeric('repRangeMax', e.target.value)}
            error={errors.repRangeMax}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Starting Sets (MEV)"
            type="text"
            inputMode="numeric"
            value={displays.startingSets}
            onChange={(e) => setNumeric('startingSets', e.target.value)}
            error={errors.startingSets}
            hint="Minimum effective volume"
          />
          <Input
            label="Starting Weight (kg)"
            type="text"
            inputMode="decimal"
            value={displays.startingWeight}
            onChange={(e) => setNumeric('startingWeight', e.target.value)}
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
