import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import enTranslations from '../translations/en.json';
import jaTranslations from '../translations/ja.json';

type Language = 'ja' | 'en';

type TranslationObject = Record<string, any>;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  translations: TranslationObject;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

function getNestedValue(obj: any, path: string): string {
  const keys = path.split('.');
  let result = obj;
  
  for (const key of keys) {
    if (result === undefined || result === null) {
    }
    result = result[key];
  }
  
  return typeof result === 'string' ? result : path;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const getSavedLanguage = (): Language => {
    const savedLanguage = localStorage.getItem('preferredLanguage');
    return (savedLanguage === 'en' || savedLanguage === 'ja') ? savedLanguage : 'ja';
  };

  const [language, setLanguage] = useState<Language>(getSavedLanguage());
  const [translations, setTranslations] = useState<TranslationObject>(
    language === 'ja' ? jaTranslations : enTranslations
  );

  useEffect(() => {
    setTranslations(language === 'ja' ? jaTranslations : enTranslations);
    localStorage.setItem('preferredLanguage', language);
  }, [language]);

  const t = (key: string): string => {
    return getNestedValue(translations, key) || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, translations }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
