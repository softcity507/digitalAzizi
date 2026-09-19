import { getRequestConfig } from 'next-intl/server';

export const SUPPORTED_LOCALES = [
  'en',  // English (Global / Default)
  'ur',  // Urdu (اردو) - Bar-e-Sagheer (Pakistan / India)
  'hi',  // Hindi (हिन्दी) - Bar-e-Sagheer (India)
  'ps',  // Pashto (پښتو) - Bar-e-Sagheer & Afghanistan
  'fa',  // Dari / Persian (دری / فارسی) - Afghanistan & Region
  'ar',  // Arabic (العربية) - Middle East / Gulf Hawala Trade
  'pa',  // Punjabi (پنجابی) - Bar-e-Sagheer (Punjab)
  'sd',  // Sindhi (سنڌي) - Bar-e-Sagheer (Sindh)
  'bal', // Balochi (بلوچی) - Bar-e-Sagheer (Balochistan)
  'bn',  // Bengali (বাংলা) - Bar-e-Sagheer (Bangladesh / India)
  'fr',  // French (Français) - International
  'tr',  // Turkish (Türkçe) - Regional / Central Asia
] as const;

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export interface LanguageInfo {
  code: SupportedLocale;
  name: string;
  nativeName: string;
  dir: 'ltr' | 'rtl';
  flag: string;
  region: string;
}

export const LANGUAGES_MAP: Record<SupportedLocale, LanguageInfo> = {
  en: { code: 'en', name: 'English', nativeName: 'English', dir: 'ltr', flag: '🇬🇧', region: 'Global' },
  ur: { code: 'ur', name: 'Urdu', nativeName: 'اردو', dir: 'rtl', flag: '🇵🇰', region: 'Subcontinent (Pakistan / India)' },
  hi: { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', dir: 'ltr', flag: '🇮🇳', region: 'Subcontinent (India)' },
  ps: { code: 'ps', name: 'Pashto', nativeName: 'پښتو', dir: 'rtl', flag: '🇦🇫', region: 'Subcontinent & Afghanistan' },
  fa: { code: 'fa', name: 'Dari / Persian', nativeName: 'دری / فارسی', dir: 'rtl', flag: '🇦🇫', region: 'Afghanistan & Middle East' },
  ar: { code: 'ar', name: 'Arabic', nativeName: 'العربية', dir: 'rtl', flag: '🇦🇪', region: 'Middle East & Gulf' },
  pa: { code: 'pa', name: 'Punjabi', nativeName: 'پنجابی', dir: 'rtl', flag: '🇵🇰', region: 'Subcontinent (Punjab)' },
  sd: { code: 'sd', name: 'Sindhi', nativeName: 'سنڌي', dir: 'rtl', flag: '🇵🇰', region: 'Subcontinent (Sindh)' },
  bal: { code: 'bal', name: 'Balochi', nativeName: 'بلوچی', dir: 'rtl', flag: '🇵🇰', region: 'Subcontinent (Balochistan)' },
  bn: { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', dir: 'ltr', flag: '🇧🇩', region: 'Subcontinent (Bangladesh / India)' },
  fr: { code: 'fr', name: 'French', nativeName: 'Français', dir: 'ltr', flag: '🇫🇷', region: 'International' },
  tr: { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', dir: 'ltr', flag: '🇹🇷', region: 'Turkey & Central Asia' },
};

export const DEFAULT_LOCALE: SupportedLocale = 'en';

export default getRequestConfig(async () => {
  const locale = DEFAULT_LOCALE;

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
