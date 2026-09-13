export const SUPPORTED_LOCALES = [
  'en',
  'ur',
  'hi',
  'ps',
  'fa',
  'ar',
  'pa',
  'sd',
  'bal',
  'bn',
  'fr',
  'tr',
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

export const LANGUAGES: LanguageInfo[] = [
  { code: 'en', name: 'English', nativeName: 'English', dir: 'ltr', flag: '🇬🇧', region: 'Global' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', dir: 'rtl', flag: '🇵🇰', region: 'Bar-e-Sagheer' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', dir: 'ltr', flag: '🇮🇳', region: 'Bar-e-Sagheer' },
  { code: 'ps', name: 'Pashto', nativeName: 'پښتو', dir: 'rtl', flag: '🇦🇫', region: 'Bar-e-Sagheer & Afghanistan' },
  { code: 'fa', name: 'Dari / Persian', nativeName: 'دری / فارسی', dir: 'rtl', flag: '🇦🇫', region: 'Afghanistan & Middle East' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', dir: 'rtl', flag: '🇦🇪', region: 'Middle East & Gulf' },
  { code: 'pa', name: 'Punjabi', nativeName: 'پنجابی', dir: 'rtl', flag: '🇵🇰', region: 'Bar-e-Sagheer' },
  { code: 'sd', name: 'Sindhi', nativeName: 'سنڌي', dir: 'rtl', flag: '🇵🇰', region: 'Bar-e-Sagheer' },
  { code: 'bal', name: 'Balochi', nativeName: 'بلوچی', dir: 'rtl', flag: '🇵🇰', region: 'Bar-e-Sagheer' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', dir: 'ltr', flag: '🇧🇩', region: 'Bar-e-Sagheer' },
  { code: 'fr', name: 'French', nativeName: 'Français', dir: 'ltr', flag: '🇫🇷', region: 'International' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', dir: 'ltr', flag: '🇹🇷', region: 'Regional' },
];

export const DEFAULT_LOCALE: SupportedLocale = 'en';
