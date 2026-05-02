import { ReactNode } from 'react';

type AlertType = 'success' | 'error' | 'warning' | 'info';

interface AlertProps {
  type: AlertType;
  title?: string;
  message: string;
  icon?: ReactNode;
  onClose?: () => void;
}

const alertStyles: Record<AlertType, { bg: string; border: string; text: string; icon: string }> = {
  success: {
    bg: 'bg-green-500/10',
    border: 'border-green-500/30',
    text: 'text-green-200',
    icon: '✅',
  },
  error: {
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    text: 'text-red-200',
    icon: '❌',
  },
  warning: {
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    text: 'text-amber-200',
    icon: '⚠️',
  },
  info: {
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    text: 'text-blue-200',
    icon: 'ℹ️',
  },
};

export function Alert({
  type,
  title,
  message,
  icon,
  onClose,
}: AlertProps) {
  const styles = alertStyles[type];

  return (
    <div
      className={`${styles.bg} border ${styles.border} ${styles.text} px-4 py-3 rounded-lg text-sm flex items-start gap-3`}
      role="alert"
    >
      <div className="flex-shrink-0 text-lg">
        {icon || styles.icon}
      </div>

      <div className="flex-1">
        {title && <p className="font-semibold mb-1">{title}</p>}
        <p>{message}</p>
      </div>

      {onClose && (
        <button
          onClick={onClose}
          className="flex-shrink-0 text-lg leading-none hover:opacity-70 transition-opacity"
        >
          ✕
        </button>
      )}
    </div>
  );
}
