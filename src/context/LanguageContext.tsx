import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { SupportedLanguage, SUPPORTED_LANGUAGES, TRANSLATIONS, Translations, translateText } from '../locales/translations';

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: Translations;
  translate: (text: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const VALID_LANGUAGE_CODES: Set<string> = new Set(SUPPORTED_LANGUAGES.map((l) => l.code));

function getSafeInitialLanguage(): SupportedLanguage {
  try {
    const stored = localStorage.getItem('kala_language');
    if (stored && VALID_LANGUAGE_CODES.has(stored)) {
      return stored as SupportedLanguage;
    }
  } catch {}
  return 'en';
}

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<SupportedLanguage>(getSafeInitialLanguage);

  const setLanguage = useCallback((lang: SupportedLanguage) => {
    if (VALID_LANGUAGE_CODES.has(lang)) {
      setLanguageState(lang);
      try {
        localStorage.setItem('kala_language', lang);
      } catch {}
    }
  }, []);

  const t = useMemo(() => TRANSLATIONS[language] || TRANSLATIONS.en, [language]);
  const translate = useCallback((text: string) => translateText(language, text), [language]);

  const value = useMemo(
    () => ({ language, setLanguage, t, translate }),
    [language, setLanguage, t, translate]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within a LanguageProvider');
  return context;
};
