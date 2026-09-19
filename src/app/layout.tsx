import { NextIntlClientProvider } from 'next-intl';
import './globals.css';
import messages from '../../messages/en.json';
import { DEFAULT_LOCALE, LANGUAGES_MAP } from '@/i18n/request';

type Props = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: Props) {
  const langInfo = LANGUAGES_MAP[DEFAULT_LOCALE];

  return (
    <html
      lang={DEFAULT_LOCALE}
      dir={langInfo.dir}
      className="dark"
      data-theme="dark"
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
        <NextIntlClientProvider
          formats={{}}
          locale={DEFAULT_LOCALE}
          messages={messages}
          timeZone="UTC"
        >
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
