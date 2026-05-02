import { ReactNode } from 'react';

type SeverityLevel = 'critical' | 'high' | 'medium' | 'none';

interface SeverityBadgeProps {
  severity: number | SeverityLevel;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  icon?: ReactNode;
  className?: string;
}

const severityMap: Record<SeverityLevel, { color: string; bgColor: string; icon: string; label: string }> = {
  critical: {
    color: 'text-red-300',
    bgColor: 'bg-red-500/20 border border-red-500/50',
    icon: '🚨',
    label: 'Crítica',
  },
  high: {
    color: 'text-orange-300',
    bgColor: 'bg-orange-500/20 border border-orange-500/50',
    icon: '⚠️',
    label: 'Alta',
  },
  medium: {
    color: 'text-yellow-300',
    bgColor: 'bg-yellow-500/20 border border-yellow-500/50',
    icon: '⚡',
    label: 'Média',
  },
  none: {
    color: 'text-gray-400',
    bgColor: 'bg-gray-500/10 border border-gray-500/30',
    icon: '✓',
    label: 'Normal',
  },
};

const sizeStyles: Record<'sm' | 'md' | 'lg', string> = {
  sm: 'px-2 py-1 text-xs gap-1',
  md: 'px-3 py-1.5 text-sm gap-1.5',
  lg: 'px-4 py-2 text-base gap-2',
};

function getSeverityLevel(severity: number | SeverityLevel): SeverityLevel {
  if (typeof severity === 'string') return severity;
  if (severity >= 9) return 'critical';
  if (severity >= 7) return 'high';
  if (severity > 0) return 'medium';
  return 'none';
}

export function SeverityBadge({
  severity,
  size = 'md',
  showLabel = true,
  icon: customIcon,
  className = '',
}: SeverityBadgeProps) {
  const level = getSeverityLevel(severity);
  const config = severityMap[level];
  const displayIcon = customIcon || config.icon;
  const numericSeverity = typeof severity === 'number' ? severity.toFixed(1) : '0.0';

  return (
    <div
      className={`inline-flex items-center rounded-md font-semibold transition-all duration-200 ${
        sizeStyles[size]
      } ${config.bgColor} ${config.color} ${className}`}
      role="status"
      aria-label={`Severidade ${config.label}: ${numericSeverity} em 10`}
    >
      <span className="flex-shrink-0">{displayIcon}</span>

      <div className="flex flex-col items-start">
        {showLabel && <span className="font-bold leading-none">{config.label}</span>}
        {typeof severity === 'number' && (
          <span className="text-xs opacity-80 leading-none">{numericSeverity}/10</span>
        )}
      </div>
    </div>
  );
}

export function SeverityBadgeVariants() {
  return (
    <div className="space-y-4 p-4">
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-gray-400">Variantes</h3>

        <div className="space-y-2">
          <SeverityBadge severity="critical" />
          <SeverityBadge severity="high" />
          <SeverityBadge severity="medium" />
          <SeverityBadge severity="none" />
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-gray-400">Com Números</h3>

        <div className="space-y-2">
          <SeverityBadge severity={9.5} />
          <SeverityBadge severity={7.8} />
          <SeverityBadge severity={3.2} />
          <SeverityBadge severity={0} />
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-gray-400">Tamanhos</h3>

        <div className="space-y-2">
          <SeverityBadge severity="critical" size="sm" />
          <SeverityBadge severity="critical" size="md" />
          <SeverityBadge severity="critical" size="lg" />
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-gray-400">Sem Label</h3>

        <div className="space-y-2">
          <SeverityBadge severity="critical" showLabel={false} />
          <SeverityBadge severity="high" showLabel={false} />
          <SeverityBadge severity="medium" showLabel={false} />
        </div>
      </div>
    </div>
  );
}
