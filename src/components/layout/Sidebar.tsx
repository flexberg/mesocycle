import React from 'react';
import type { Page } from '../../App';

interface NavItem {
  page: Page;
  label: string;
  icon: React.ReactNode;
}

const DumbbellIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 12h16M4 12a2 2 0 01-2-2V8a2 2 0 012-2h2a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2v-2a2 2 0 012-2zm16 0a2 2 0 002 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V8a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2z" />
  </svg>
);
const CalendarIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);
const ChartIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);
const ClipboardIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
  </svg>
);

const navItems: NavItem[] = [
  { page: 'program', label: 'Program', icon: <DumbbellIcon /> },
  { page: 'mesocycle', label: 'Mesocycle', icon: <CalendarIcon /> },
  { page: 'macrocycle', label: 'Macrocycle', icon: <ChartIcon /> },
  { page: 'logger', label: 'Logger', icon: <ClipboardIcon /> },
];

interface SidebarProps {
  activePage: Page;
  onNavigate: (page: Page) => void;
}

export function Sidebar({ activePage, onNavigate }: SidebarProps) {
  return (
    <aside className="hidden md:flex flex-col w-56 min-h-screen bg-surface-900 border-r border-surface-700 py-6 px-3 gap-1">
      {/* Brand */}
      <div className="px-3 mb-6">
        <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
          MesoCycle
        </span>
        <p className="text-xs text-gray-600 mt-0.5">Periodization Planner</p>
      </div>

      {navItems.map(({ page, label, icon }) => {
        const active = activePage === page;
        return (
          <button
            key={page}
            onClick={() => onNavigate(page)}
            className={`
              flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium w-full text-left
              transition-colors duration-150 cursor-pointer
              ${active
                ? 'bg-blue-600/20 text-blue-400 border border-blue-600/30'
                : 'text-gray-400 hover:text-gray-100 hover:bg-surface-700 border border-transparent'
              }
            `}
          >
            <span className={active ? 'text-blue-400' : 'text-gray-500'}>{icon}</span>
            {label}
          </button>
        );
      })}
    </aside>
  );
}
