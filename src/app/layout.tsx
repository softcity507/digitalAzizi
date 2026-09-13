import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getLocale } from 'next-intl/server';
import './globals.css';
import { LANGUAGES_MAP, SupportedLocale } from '@/i18n/request';
import Header from '@/components/max/Header';

type Props = {
  children: React.ReactNode;
};

export default async function RootLayout({ children }: Props) {
  const messages = await getMessages();
  const locale = (await getLocale()) as SupportedLocale;
  const langInfo = LANGUAGES_MAP[locale] || LANGUAGES_MAP.en;

  return (
    <html lang={locale} dir={langInfo.dir} className="dark">
      <body className="min-h-screen bg-canvas text-content-primary antialiased flex flex-col">
        <NextIntlClientProvider messages={messages} locale={locale}>
          <Header />
          <main className="flex-1">{children}</main>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}