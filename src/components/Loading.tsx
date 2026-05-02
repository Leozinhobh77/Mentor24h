interface LoadingProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
}

const sizeMap = {
  sm: 'w-8 h-8 border-2',
  md: 'w-12 h-12 border-4',
  lg: 'w-16 h-16 border-4',
};

export function Loading({
  message = 'Carregando...',
  size = 'md',
  fullScreen = false,
}: LoadingProps) {
  const spinner = (
    <div className="flex flex-col items-center gap-4">
      <div
        className={`${sizeMap[size]} border-slate-700 border-t-purple-500 rounded-full animate-spin`}
      />
      {message && <p className="text-gray-400">{message}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        {spinner}
      </div>
    );
  }

  return spinner;
}

export function Skeleton({
  width = 'w-full',
  height = 'h-4',
  count = 1,
}: {
  width?: string;
  height?: string;
  count?: number;
}) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`${width} ${height} bg-slate-700/50 rounded-lg animate-pulse`}
        />
      ))}
    </div>
  );
}
