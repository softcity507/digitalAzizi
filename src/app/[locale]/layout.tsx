import { NextIntlClientProvider } from 'next-intl';
import { notFound } from 'next/navigation';
import Header from '@/components/max/Header';
import { SUPPORTED_LOCALES, type SupportedLocale } from '@/i18n/request';

type Props = Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>;

export function generateStaticParams() {
  return SUPPORTED_LOCALES.map(locale => ({ locale }));
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!SUPPORTED_LOCALES.includes(locale as SupportedLocale)) {
    notFound();
  }

  const messages = (await import(`../../../messages/${locale}.json`)).default;

  return (
    <NextIntlClientProvider formats={{}} locale={locale} messages={messages} timeZone="UTC">
      <Header />
      <main className="flex-1">{children}</main>
    </NextIntlClientProvider>
  );
}
