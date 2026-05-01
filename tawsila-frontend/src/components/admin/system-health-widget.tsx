import { useTranslations, useLocale } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import { systemApi } from '@/lib/api';

export function SystemHealthWidget() {
  const t = useTranslations('admin');
  const locale = useLocale();
  const { data: health, isLoading, isError } = useQuery({
    queryKey: ['system-health'],
    queryFn: () => systemApi.health(),
    refetchInterval: 30000, // Refresh every 30s
  });

  return (
    <div className="bg-[var(--surface)] p-6 rounded-3xl border border-[var(--border)] shadow-sm">
      <h2 className="text-xl font-bold text-[var(--text)] mb-6 flex items-center gap-2">
        <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {t('systemHealth')}
      </h2>

      {isLoading ? (
        <div className="space-y-4 animate-pulse">
          <div className="h-4 bg-[var(--surface-hover)] rounded w-3/4" />
          <div className="h-4 bg-[var(--surface-hover)] rounded w-1/2" />
          <div className="h-4 bg-[var(--surface-hover)] rounded w-5/6" />
        </div>
      ) : isError ? (
        <div className="p-4 bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 rounded-xl border border-red-100 dark:border-red-500/20 font-medium text-sm flex items-start gap-2">
          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {t('errorFetchingHealth')}
        </div>
      ) : (
        <div className="space-y-5">
          <div className="flex items-center justify-between p-4 bg-[var(--surface-hover)] rounded-2xl border border-[var(--border)]">
            <span className="text-sm font-bold text-[var(--text-muted)]">{t('apiStatus')}</span>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
              health?.status === 'UP' ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400'
            }`}>
              <span className={`w-2 h-2 rounded-full ${health?.status === 'UP' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
              {health?.status || 'UNKNOWN'}
            </span>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-[var(--text-muted)] font-medium">{t('application')}</span>
              <span className="font-bold text-[var(--text)]">{health?.application || 'Tawsila'}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-[var(--text-muted)] font-medium">{t('database')}</span>
              <span className="font-bold text-[var(--text)] uppercase">{health?.persistenceMode || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-[var(--text-muted)] font-medium">{t('lastCheck')}</span>
              <span className="font-bold text-primary">
                {health?.timestamp ? new Date(health.timestamp).toLocaleTimeString(locale === 'ar' ? 'ar-TN' : locale === 'fr' ? 'fr-FR' : 'en-US') : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
