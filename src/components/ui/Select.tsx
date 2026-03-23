import React from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string;
}

export function Select({ label, options, error, className = '', id, ...props }: SelectProps) {
  const selectId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={selectId} className="text-xs font-medium text-gray-400 uppercase tracking-wide">
          {label}
        </label>
      )}
      <select
        id={selectId}
        {...props}
        className={`
          bg-surface-800 border border-surface-600 text-gray-100 rounded-md px-3 py-1.5 text-sm
          focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500
          disabled:opacity-40 cursor-pointer
          ${error ? 'border-red-500' : ''}
          ${className}
        `}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-surface-800">
            {o.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
