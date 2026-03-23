import { useState } from 'react';
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
import { TrainingDayCard } from './TrainingDayCard';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { useProgramStore } from '../../store/programStore';
import { useMesocycleStore } from '../../store/mesocycleStore';
import { useMacrocycleStore } from '../../store/macrocycleStore';

export function ProgramBuilder() {
  const {
    programs, activeProgram,
    addProgram, addDay, removeDay, reorderDays, updateProgramName,
  } = useProgramStore();
  const { generateForProgram: genMeso } = useMesocycleStore();
  const { generateForProgram: genMacro } = useMacrocycleStore();

  const program = activeProgram();

  const [addDayOpen, setAddDayOpen] = useState(false);
  const [dayName, setDayName] = useState('');
  const [newProgramName, setNewProgramName] = useState('');
  const [newProgramOpen, setNewProgramOpen] = useState(false);
  const [editNameId, setEditNameId] = useState<string | null>(null);
  const [editNameVal, setEditNameVal] = useState('');
  const [mesoCount, setMesoCount] = useState<3 | 4>(3);
  const [generating, setGenerating] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDayDragEnd = (event: DragEndEvent) => {
    if (!program) return;
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = program.days.findIndex((d) => d.id === active.id);
    const newIndex = program.days.findIndex((d) => d.id === over.id);
    const reordered = arrayMove(program.days, oldIndex, newIndex);
    reorderDays(program.id, reordered.map((d) => d.id));
  };

  const handleGenerate = () => {
    if (!program) return;
    setGenerating(true);
    setTimeout(() => {
      genMeso(program);
      genMacro(program, mesoCount);
      setGenerating(false);
    }, 100);
  };

  // ── No program ──────────────────────────────────────────────────────────────
  if (!program) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-100 mb-2">Create Your Training Program</h2>
          <p className="text-gray-500 max-w-sm">
            Start by creating a program, then add your training days and exercises.
          </p>
        </div>

        {programs.length > 0 && (
          <div className="w-full max-w-sm">
            <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide">Existing programs</p>
            {programs.map((p) => (
              <button
                key={p.id}
                onClick={() => useProgramStore.getState().setActiveProgram(p.id)}
                className="w-full text-left px-4 py-3 bg-surface-800 hover:bg-surface-700 border border-surface-700 rounded-lg mb-2 transition-colors cursor-pointer"
              >
                <div className="font-medium text-gray-100">{p.name}</div>
                <div className="text-xs text-gray-500">{p.days.length} days</div>
              </button>
            ))}
          </div>
        )}

        <Button variant="primary" size="lg" onClick={() => setNewProgramOpen(true)}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          New Program
        </Button>

        <Modal
          open={newProgramOpen}
          onClose={() => setNewProgramOpen(false)}
          title="New Program"
          footer={
            <>
              <Button variant="ghost" onClick={() => setNewProgramOpen(false)}>Cancel</Button>
              <Button
                variant="primary"
                disabled={!newProgramName.trim()}
                onClick={() => {
                  addProgram(newProgramName.trim());
                  setNewProgramName('');
                  setNewProgramOpen(false);
                }}
              >
                Create
              </Button>
            </>
          }
        >
          <Input
            label="Program Name"
            placeholder="e.g. Push Pull Legs"
            value={newProgramName}
            onChange={(e) => setNewProgramName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && newProgramName.trim()) {
                addProgram(newProgramName.trim());
                setNewProgramName('');
                setNewProgramOpen(false);
              }
            }}
            autoFocus
          />
        </Modal>
      </div>
    );
  }

  // ── Program editor ───────────────────────────────────────────────────────────
  const totalExercises = program.days.reduce((n, d) => n + d.exercises.length, 0);
  const canGenerate = program.days.length > 0 && totalExercises > 0;

  return (
    <div className="flex flex-col gap-4 p-4 max-w-2xl mx-auto w-full">
      {/* Program header */}
      <div className="flex items-center gap-2">
        {editNameId === program.id ? (
          <input
            className="flex-1 bg-transparent text-xl font-bold text-gray-100 border-b border-amber-500 focus:outline-none"
            value={editNameVal}
            onChange={(e) => setEditNameVal(e.target.value)}
            onBlur={() => {
              if (editNameVal.trim()) updateProgramName(program.id, editNameVal.trim());
              setEditNameId(null);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                if (editNameVal.trim()) updateProgramName(program.id, editNameVal.trim());
                setEditNameId(null);
              }
              if (e.key === 'Escape') setEditNameId(null);
            }}
            autoFocus
          />
        ) : (
          <button
            onClick={() => { setEditNameId(program.id); setEditNameVal(program.name); }}
            className="flex-1 text-left text-xl font-bold text-gray-100 hover:text-amber-400 transition-colors cursor-pointer"
          >
            {program.name}
          </button>
        )}

        <Button variant="ghost" size="sm" onClick={() => useProgramStore.getState().setActiveProgram('')}>
          Switch
        </Button>
      </div>

      {/* Stats row */}
      <div className="flex gap-4 text-sm text-gray-500">
        <span>{program.days.length} days</span>
        <span>·</span>
        <span>{totalExercises} exercises</span>
      </div>

      {/* Days */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDayDragEnd}>
        <SortableContext
          items={program.days.map((d) => d.id)}
          strategy={verticalListSortingStrategy}
        >
          {program.days.map((day) => (
            <TrainingDayCard
              key={day.id}
              day={day}
              programId={program.id}
              onRemoveDay={() => removeDay(program.id, day.id)}
            />
          ))}
        </SortableContext>
      </DndContext>

      {program.days.length === 0 && (
        <div className="text-center py-8 text-gray-600 text-sm border border-dashed border-surface-600 rounded-xl">
          No training days yet — add your first day below
        </div>
      )}

      {/* Actions */}
      <Button variant="ghost" size="md" onClick={() => setAddDayOpen(true)} className="border border-dashed border-surface-600 text-gray-500 hover:text-gray-300 hover:border-surface-500">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        Add Training Day
      </Button>

      {/* Generate section */}
      <div className="bg-surface-800 border border-surface-700 rounded-xl p-4 flex flex-col gap-3">
        <h3 className="font-semibold text-gray-200 text-sm">Generate Training Plan</h3>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-400">Mesocycles in macrocycle:</span>
          {([3, 4] as const).map((n) => (
            <button
              key={n}
              onClick={() => setMesoCount(n)}
              className={`px-3 py-1 rounded-md text-sm font-medium border transition-colors cursor-pointer ${
                mesoCount === n
                  ? 'bg-amber-500/15 text-amber-400 border-amber-500/40'
                  : 'text-gray-500 border-surface-600 hover:border-surface-500'
              }`}
            >
              {n}
            </button>
          ))}
        </div>
        <Button
          variant="primary"
          disabled={!canGenerate}
          loading={generating}
          onClick={handleGenerate}
        >
          Generate {mesoCount} Mesocycles ({mesoCount * 5} weeks)
        </Button>
        {!canGenerate && (
          <p className="text-xs text-gray-600">Add at least one day with one exercise to generate.</p>
        )}
      </div>

      {/* Add day modal */}
      <Modal
        open={addDayOpen}
        onClose={() => { setAddDayOpen(false); setDayName(''); }}
        title="Add Training Day"
        footer={
          <>
            <Button variant="ghost" onClick={() => { setAddDayOpen(false); setDayName(''); }}>Cancel</Button>
            <Button
              variant="primary"
              disabled={!dayName.trim()}
              onClick={() => {
                addDay(program.id, dayName.trim());
                setDayName('');
                setAddDayOpen(false);
              }}
            >
              Add Day
            </Button>
          </>
        }
      >
        <Input
          label="Day Name"
          placeholder="e.g. Push A, Pull, Legs..."
          value={dayName}
          onChange={(e) => setDayName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && dayName.trim()) {
              addDay(program.id, dayName.trim());
              setDayName('');
              setAddDayOpen(false);
            }
          }}
          autoFocus
        />
      </Modal>
    </div>
  );
}
