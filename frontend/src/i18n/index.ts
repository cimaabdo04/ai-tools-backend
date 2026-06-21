import ar from "./messages/ar.json";

export function useTranslations() {
  return (key: string) => {
    const keys = key.split(".");
    let value: any = ar;
    for (const k of keys) {
      value = value?.[k];
    }
    return value ?? key;
  };
}

export function useLocale() {
  return "ar" as const;
}

export function useMessages() {
  return ar;
}

export { default as messages } from "./messages/ar.json";
