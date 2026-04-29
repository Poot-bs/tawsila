import { getRequestConfig } from 'next-intl/server';
import { getMessages, type Locale, DEFAULT_LOCALE, isValidLocale } from './config';

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale: Locale = requested && isValidLocale(requested) ? requested : DEFAULT_LOCALE;
  const messages = await getMessages(locale);

  return {
    locale,
    messages,
  };
});
