import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import en from './locales/en';
import nl from './locales/nl';
import fr from './locales/fr';
import de from './locales/de';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      'en-GB': en,
      'nl-BE': nl,
      'fr-BE': fr,
      'de-DE': de,
    },
    fallbackLng: 'en-GB',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;