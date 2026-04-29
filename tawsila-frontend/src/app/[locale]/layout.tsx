import { NextIntlClientProvider } from 'next-intl';
import { getMessages as loadMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Providers } from '@/components/providers';
import { LOCALES, RTL_LOCALES, type Locale } from '@/lib/utils/constants';
import '@/app/globals.css';

export async function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!LOCALES.includes(locale as Locale)) {
    notFound();
  }

  const messages = await loadMessages();
  const dir = RTL_LOCALES.includes(locale as Locale) ? 'rtl' : 'ltr';

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Tawsila — Plateforme de covoiturage universitaire en Tunisie. Trouvez ou proposez des trajets, payez en ligne et voyagez en toute sécurité." />
        <title>Tawsila — Covoiturage Universitaire</title>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="min-h-screen antialiased">
        <NextIntlClientProvider messages={messages}>
          <Providers>
            {children}
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
