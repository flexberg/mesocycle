import React, { useState, useRef } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { BottomNav } from './components/layout/BottomNav';
import { ProgramBuilder } from './components/program/ProgramBuilder';
import { MesocycleView } from './components/mesocycle/MesocycleView';
import { MacrocycleView } from './components/macrocycle/MacrocycleView';
import { WorkoutLogger } from './components/logger/WorkoutLogger';
import { Button } from './components/ui/Button';
import { exportJSON, importJSON } from './lib/storage';

export type Page = 'program' | 'mesocycle' | 'macrocycle' | 'logger';

const pageTitles: Record<Page, string> = {
  program: 'Program Builder',
  mesocycle: 'Mesocycle View',
  macrocycle: 'Macrocycle Overview',
  logger: 'Workout Logger',
};

export default function App() {
  const [page, setPage] = useState<Page>('program');
  const [importing, setImporting] = useState(false);
  const importRef = useRef<HTMLInputElement>(null);

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      await importJSON(file);
    } catch (err) {
      alert('Failed to import: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setImporting(false);
      if (importRef.current) importRef.current.value = '';
    }
  };

  return (
    <div className="flex min-h-screen bg-surface-950">
      <Sidebar activePage={page} onNavigate={setPage} />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="flex items-center justify-between px-4 py-3 border-b border-surface-800 bg-surface-900 no-print sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <span className="md:hidden text-base font-bold bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
              MesoCycle
            </span>
            <h1 className="text-sm font-semibold text-gray-300">{pageTitles[page]}</h1>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              loading={importing}
              onClick={() => importRef.current?.click()}
              title="Import JSON"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              <span className="hidden sm:inline">Import</span>
            </Button>
            <input ref={importRef} type="file" accept=".json" className="hidden" onChange={handleImport} />

            <Button variant="ghost" size="sm" onClick={exportJSON} title="Export JSON">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span className="hidden sm:inline">Export</span>
            </Button>

            <Button variant="ghost" size="sm" onClick={() => window.print()} title="Print / Save PDF">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              <span className="hidden sm:inline">Print</span>
            </Button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto pb-20 md:pb-4">
          {page === 'program' && <ProgramBuilder />}
          {page === 'mesocycle' && <MesocycleView />}
          {page === 'macrocycle' && <MacrocycleView />}
          {page === 'logger' && <WorkoutLogger />}
        </main>
      </div>

      <BottomNav activePage={page} onNavigate={setPage} />
    </div>
  );
}
