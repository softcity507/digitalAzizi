'use client';

interface StatusBadgeProps {
  label?: string;
  status?: 'active' | 'syncing' | 'offline';
  className?: string;
}

export default function StatusBadge({
  label = 'Cloud Sync Active',
  status = 'active',
  className = '',
}: StatusBadgeProps) {
  return (
    <div
      className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-950/40 text-emerald-400 border border-emerald-500/30 shadow-sm backdrop-blur-sm select-none transition-all hover:bg-emerald-950/60 ${className}`}
    >
      {/* Pulse dot */}
      <span className="relative flex h-2 w-2">
        <span
          className={`animate-ping absolute inline-flex h-full w-full rounded-full ${
            status === 'active'
              ? 'bg-emerald-400 opacity-75'
              : status === 'syncing'
              ? 'bg-amber-400 opacity-75'
              : 'bg-rose-400 opacity-75'
          }`}
        />
        <span
          className={`relative inline-flex rounded-full h-2 w-2 ${
            status === 'active'
              ? 'bg-emerald-400'
              : status === 'syncing'
              ? 'bg-amber-400'
              : 'bg-rose-400'
          }`}
        />
      </span>

      <span>{label}</span>
    </div>
  );
}
