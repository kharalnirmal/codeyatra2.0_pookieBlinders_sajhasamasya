import { useLanguageStore } from "@/lib/store/languageStore";
import translations from "@/lib/translations";

export function useTranslation() {
  const { lang, toggleLang } = useLanguageStore();

  const t = (key) => {
    const entry = translations[key];
    if (!entry) return key;
    return entry[lang] || entry.en || key;
  };

  return { t, lang, toggleLang };
}
