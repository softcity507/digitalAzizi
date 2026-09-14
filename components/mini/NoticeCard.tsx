'use client';

interface NoticeCardProps {
  title?: string;
  description?: string;
  className?: string;
}

export default function NoticeCard({
  title = 'Legacy password logins retired',
  description = 'Authorized hawala dealers authenticate strictly via 2-Factor Google Enterprise Auth to prevent unauthorized balance tampering.',
  className = '',
}: NoticeCardProps) {
  return (
    <div
      className={`w-full rounded-2xl bg-surface-subtle/80 border border-surface-border p-4 transition-all duration-200 ${className}`}
    >
      <div className="flex items-start gap-2.5">
        <div className="flex-shrink-0 mt-0.5 text-amber-400">
          <svg
            className="w-4 h-4 sm:w-5 sm:h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <div className="flex-1 space-y-1">
          <h4 className="text-xs sm:text-sm font-bold text-amber-400 tracking-tight">
            {title}
          </h4>
          <p className="text-[11px] sm:text-xs text-content-secondary leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}
