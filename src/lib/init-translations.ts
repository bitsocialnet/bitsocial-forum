import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from '../../public/translations/en/default.json';

// English ships with the app and is the only interface language for now. Other languages will load
// through an HTTP backend, like 5chan's, once they exist.
i18next.use(initReactI18next).init({
  lng: 'en',
  fallbackLng: 'en',
  ns: ['default'],
  defaultNS: 'default',
  resources: { en: { default: en } },
  interpolation: { escapeValue: false },
});
