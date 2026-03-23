import React from 'react';
import type { Page } from '../../App';

interface BottomNavProps {
  activePage: Page;
  onNavigate: (page: Page) => void;
}

const items: { page: Page; label: string; icon: React.ReactNode }[] = [
  {
    page: 'program',
    label: 'Program',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
      </svg>
    ),
  },
  {
    page: 'mesocycle',
    label: 'Meso',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    page: 'macrocycle',
    label: 'Macro',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    page: 'logger',
    label: 'Log',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
  },
];

export function BottomNav({ activePage, onNavigate }: BottomNavProps) {
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 bg-surface-900 border-t border-surface-700 flex z-40">
      {items.map(({ page, label, icon }) => {
        const active = activePage === page;
        return (
          <button
            key={page}
            onClick={() => onNavigate(page)}
            className={`
              flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 text-xs font-medium
              transition-colors cursor-pointer
              ${active ? 'text-blue-400' : 'text-gray-500 hover:text-gray-300'}
            `}
          >
            {icon}
            {label}
          </button>
        );
      })}
    </nav>
  );
}
