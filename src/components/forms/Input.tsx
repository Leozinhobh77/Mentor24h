import { InputHTMLAttributes, ReactNode } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
  helper?: string;
}

export function Input({
  label,
  error,
  icon,
  helper,
  className = '',
  ...props
}: InputProps) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-200">
          {label}
        </label>
      )}

      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}

        <input
          className={`w-full px-4 py-3 rounded-lg bg-slate-800 border ${
            error ? 'border-red-500' : 'border-slate-700'
          } text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all ${
            icon ? 'pl-10' : ''
          } ${className}`}
          {...props}
        />
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}
      {helper && <p className="text-gray-500 text-xs">{helper}</p>}
    </div>
  );
}
