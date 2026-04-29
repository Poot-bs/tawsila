'use client';

import { useRouter, usePathname } from '@/i18n/navigation';
import { useLocale } from 'next-intl';
import { LOCALES, type Locale, RTL_LOCALES, DEFAULT_LOCALE } from '@/lib/utils/constants';
import { STORAGE_KEYS } from '@/lib/utils/constants';

const LOCALE_LABELS: Record<Locale, string> = {
  fr: 'FR',
  en: 'EN',
  ar: 'عر',
};

export function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale() as Locale;

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLocale = e.target.value as Locale;
    localStorage.setItem(STORAGE_KEYS.LOCALE, newLocale);
    document.documentElement.dir = RTL_LOCALES.includes(newLocale) ? 'rtl' : 'ltr';

    const path = pathname === '' ? '/' : pathname.startsWith('/') ? pathname : `/${pathname}`;
    router.replace(path, { locale: newLocale });
  };

  const currentLocale = (LOCALES as readonly string[]).includes(locale) ? locale : DEFAULT_LOCALE;

  return (
    <select
      value={currentLocale}
      onChange={handleChange}
      className="appearance-none bg-[var(--surface-hover)] border border-[var(--border)] rounded-xl px-3 py-1.5 text-sm font-semibold text-[var(--text)] cursor-pointer transition-colors hover:border-[var(--border-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
      aria-label="Select language"
    >
      {LOCALES.map((loc) => (
        <option key={loc} value={loc}>
          {LOCALE_LABELS[loc]}
        </option>
      ))}
    </select>
  );
}
