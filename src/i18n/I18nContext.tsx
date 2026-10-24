import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppLanguage, TranslationDictionary } from './types';
import { en } from './locales/en';
import { hi } from './locales/hi';
import { es } from './locales/es';
import { fr } from './locales/fr';
import { ja } from './locales/ja';
import { ko } from './locales/ko';

const DICTIONARIES: Record<AppLanguage, TranslationDictionary> = {
  en,
  hi,
  es,
  fr,
  ja,
  ko,
};

export interface I18nContextType {
  language: AppLanguage;
  setLanguage: (lang: AppLanguage) => void;
  t: TranslationDictionary;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

const STORAGE_KEY = 'bv_app_lang';

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<AppLanguage>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as AppLanguage;
      if (saved && DICTIONARIES[saved]) {
        return saved;
      }
    } catch {
      // Ignore localStorage errors
    }
    return 'en';
  });

  const setLanguage = (newLang: AppLanguage) => {
    if (DICTIONARIES[newLang]) {
      setLanguageState(newLang);
      try {
        localStorage.setItem(STORAGE_KEY, newLang);
      } catch {
        // Ignore localStorage errors
      }
    }
  };

  // Sync with document lang attribute
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const currentDictionary = DICTIONARIES[language] || en;

  return (
    <I18nContext.Provider value={{ language, setLanguage, t: currentDictionary }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = (): I18nContextType => {
  const context = useContext(I18nContext);
  if (!context) {
    // Graceful fallback if consumed outside provider
    return {
      language: 'en',
      setLanguage: () => {},
      t: en,
    };
  }
  return context;
};
