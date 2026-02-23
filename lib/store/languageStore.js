import { create } from "zustand";

export const useLanguageStore = create((set) => ({
  lang: "en",
  toggleLang: () => set((s) => ({ lang: s.lang === "en" ? "ne" : "en" })),
}));
