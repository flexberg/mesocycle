import { useProgramStore } from '../store/programStore';
import { useMesocycleStore } from '../store/mesocycleStore';
import { useMacrocycleStore } from '../store/macrocycleStore';
import { useLogStore } from '../store/logStore';

interface ExportData {
  version: 1;
  exportedAt: string;
  programs: ReturnType<typeof useProgramStore.getState>['programs'];
  mesocycles: ReturnType<typeof useMesocycleStore.getState>['mesocycles'];
  macrocycles: ReturnType<typeof useMacrocycleStore.getState>['macrocycles'];
  logs: ReturnType<typeof useLogStore.getState>['logs'];
}

export function exportJSON(): void {
  const data: ExportData = {
    version: 1,
    exportedAt: new Date().toISOString(),
    programs: useProgramStore.getState().programs,
    mesocycles: useMesocycleStore.getState().mesocycles,
    macrocycles: useMacrocycleStore.getState().macrocycles,
    logs: useLogStore.getState().logs,
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `mesocycle-export-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importJSON(file: File): Promise<void> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data: ExportData = JSON.parse(e.target?.result as string);
        if (data.version !== 1) throw new Error('Unknown export format version');

        // Hydrate stores directly
        useProgramStore.setState({
          programs: data.programs,
          activeProgramId: data.programs[0]?.id ?? null,
        });
        useMesocycleStore.setState({
          mesocycles: data.mesocycles,
          activeMesocycleId: data.mesocycles[0]?.id ?? null,
        });
        useMacrocycleStore.setState({
          macrocycles: data.macrocycles,
          activeMacrocycleId: data.macrocycles[0]?.id ?? null,
        });
        useLogStore.setState({ logs: data.logs });

        resolve();
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}
