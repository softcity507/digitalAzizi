import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getLocale } from 'next-intl/server';
import { cookies } from 'next/headers';
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

  const cookieStore = await cookies();
  const themeCookie = cookieStore.get('theme')?.value;
  // Default to dark mode unless explicitly saved as 'light'
  const isDark = themeCookie !== 'light';

  return (
    <html
      lang={locale}
      dir={langInfo.dir}
      className={isDark ? 'dark' : ''}
      data-theme={isDark ? 'dark' : 'light'}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('theme');
                  var isDark = true;
                  if (saved === 'dark') {
                    isDark = true;
                  } else if (saved === 'light') {
                    isDark = false;
                  } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
                    isDark = false;
                  }
                  if (isDark) {
                    document.documentElement.classList.add('dark');
                    document.documentElement.setAttribute('data-theme', 'dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                    document.documentElement.setAttribute('data-theme', 'light');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-canvas text-content-primary antialiased flex flex-col">
        <NextIntlClientProvider messages={messages} locale={locale}>
          <Header />
          <main className="flex-1">{children}</main>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}