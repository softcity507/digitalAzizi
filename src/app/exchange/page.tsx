import { useTranslations } from 'next-intl';

export default function ExchangePage() {
  const t = useTranslations('Navigation');

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-6 text-center">
      <div className="bg-surface p-8 rounded-3xl border border-surface-border shadow-xl max-w-md w-full space-y-4">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-brand/10 text-brand flex items-center justify-center text-3xl font-bold border border-brand/20">
          🔄
        </div>
        <h1 className="text-3xl font-extrabold text-content-primary">
          {t('exchange')}
        </h1>
        <p className="text-sm text-content-muted font-mono bg-surface-subtle py-1.5 px-3 rounded-lg border border-surface-border/50">
          ExchangePage (src/app/exchange/page.tsx)
        </p>
      </div>
    </div>
  );
}
