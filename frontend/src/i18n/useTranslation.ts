// react-i18next shim — drop-in replacement using our custom i18n instance
import { useState, useEffect } from 'react';
import i18n from './index';

export function useTranslation() {
  const [lang, setLang] = useState(i18n.language);

  useEffect(() => {
    // Subscribe to language changes so components re-render
    const unsub = i18n.on('languageChanged', () => setLang(i18n.language));
    return unsub;
  }, []);

  // t reads from the singleton which always has the latest language
  function t(key: string, opts?: Record<string, any>): string {
    return i18n.t(key, opts);
  }

  return { t, i18n };
}

export { useTranslation as default };
