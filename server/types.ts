export type SupportedLanguage = 'en' | 'hi' | 'es' | 'fr' | 'ja' | 'ko';

export const LANGUAGE_LABELS: Record<SupportedLanguage, { label: string; native: string; flag: string }> = {
  en: { label: 'English', native: 'English', flag: '🇬🇧' },
  hi: { label: 'Hindi', native: 'हिन्दी', flag: '🇮🇳' },
  es: { label: 'Spanish', native: 'Español', flag: '🇪🇸' },
  fr: { label: 'French', native: 'Français', flag: '🇫🇷' },
  ja: { label: 'Japanese', native: '日本語', flag: '🇯🇵' },
  ko: { label: 'Korean', native: '한국어', flag: '🇰🇷' },
};
