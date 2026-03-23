import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}

export function Card({ children, className = '', noPadding = false }: CardProps) {
  return (
    <div
      className={`
        bg-surface-800 border border-surface-700 rounded-xl
        ${noPadding ? '' : 'p-4'}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
