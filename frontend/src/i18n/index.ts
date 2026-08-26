// Lightweight translation shim — no external dependencies
import en from './locales/en.json';
import ta from './locales/ta.json';
import hi from './locales/hi.json';
import es from './locales/es.json';

type Translations = Record<string, any>;

const resources: Record<string, Translations> = { en, ta, hi, es };

function getNestedValue(obj: Record<string, any>, key: string): string | null {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = key.split('.').reduce((acc: any, k: string) => (acc && acc[k] !== undefined ? acc[k] : null), obj);
  return typeof result === 'string' ? result : null;
}

class I18nInstance {
  language: string;
  private listeners: Array<() => void> = [];

  constructor() {
    this.language = localStorage.getItem('i18nextLng') || 'en';
  }

  t(key: string, opts?: Record<string, any>): string {
    const lang = this.language.split('-')[0];
    const translations = resources[lang] || resources['en'];
    let value: string = getNestedValue(translations, key) ?? getNestedValue(resources['en'], key) ?? key;

    // Handle interpolation e.g. {{count}}
    if (opts) {
      Object.keys(opts).forEach(k => {
        value = value.replace(new RegExp(`{{${k}}}`, 'g'), String(opts[k]));
      });
    }

    return value;
  }

  changeLanguage(lang: string) {
    this.language = lang;
    localStorage.setItem('i18nextLng', lang);
    this.listeners.forEach(fn => fn());
  }

  on(_event: string, fn: () => void) {
    this.listeners.push(fn);
    return () => { this.listeners = this.listeners.filter(l => l !== fn); };
  }
}

const i18n = new I18nInstance();
export default i18n;
