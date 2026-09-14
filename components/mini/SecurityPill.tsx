'use client';

interface SecurityPillProps {
  label?: string;
  className?: string;
}

export default function SecurityPill({
  label = 'End-to-End Encrypted Cloud Storage',
  className = '',
}: SecurityPillProps) {
  return (
    <div
      className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-brand-950/40 text-brand-300 border border-brand-500/30 shadow-sm backdrop-blur-sm select-none transition-all hover:border-brand-400 hover:bg-brand-950/60 ${className}`}
    >
      <svg
        className="w-4 h-4 text-brand-400 flex-shrink-0"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fillRule="evenodd"
          d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2.001A11.954 11.954 0 0110 1.944zM11 14a1 1 0 11-2 0 1 1 0 012 0zm0-7a1 1 0 10-2 0v3a1 1 0 102 0V7z"
          clipRule="evenodd"
        />
      </svg>
      <span>{label}</span>
    </div>
  );
}
