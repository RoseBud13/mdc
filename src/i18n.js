import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { updateTitleTag } from './utils/browser';
import zhCommon from './locales/zh/common.json';
import enCommon from './locales/en/common.json';

const resources = {
  zh: {
    common: zhCommon
  },
  en: {
    common: enCommon
  }
};

i18n
  .use(LanguageDetector) // detect user language
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    fallbackLng: 'en', // use en if detected lng is not available
    ns: ['common'], // string or array of namespaces to load
    defaultNS: 'common', // default namespace used if not passed to the t function
    interpolation: {
      escapeValue: false // react already safes from xss
    }
  });

// Set the language attribute on the html element
document.documentElement.lang = i18n.resolvedLanguage;

// Update the document title based on the current language
const updateDocumentTitle = () => {
  const titleKey = 'common:appName';
  const title = i18n.t(titleKey);
  updateTitleTag(title);
};
// Initial document title update
updateDocumentTitle();

// Listen for language changes and update the lang attribute and document title
i18n.on('languageChanged', lng => {
  document.documentElement.lang = lng;
  updateDocumentTitle();
});

export default i18n;
