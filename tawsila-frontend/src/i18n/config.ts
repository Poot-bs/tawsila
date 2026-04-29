import { LOCALES, DEFAULT_LOCALE, type Locale } from '@/lib/utils/constants';

export { LOCALES, DEFAULT_LOCALE };
export type { Locale };

/**
 * Check if a string is a valid locale.
 */
export function isValidLocale(locale: string): locale is Locale {
  return (LOCALES as readonly string[]).includes(locale);
}

/**
 * Get messages for a given locale.
 */
export async function getMessages(locale: Locale) {
  try {
    return (await import(`./messages/${locale}.json`)).default;
  } catch {
    return (await import('./messages/fr.json')).default;
  }
}
