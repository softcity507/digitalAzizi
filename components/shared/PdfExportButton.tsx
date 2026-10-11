'use client';

import { useState } from 'react';

interface PdfExportButtonProps {
  onExport: () => void | Promise<void>;
}

export default function PdfExportButton({ onExport }: PdfExportButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleClick = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    try {
      await onExport();
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isGenerating}
      title="Export as PDF"
      className="inline-flex items-center gap-1.5 rounded-xl border border-surface-border bg-surface px-3 py-1.5 text-xs font-semibold text-content-primary shadow-sm transition-colors hover:bg-surface-hover disabled:cursor-wait disabled:opacity-60"
    >
      <svg className="h-3.5 w-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
      <span>PDF</span>
    </button>
  );
}
