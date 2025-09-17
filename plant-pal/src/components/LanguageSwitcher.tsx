"use client";
import { useRouter } from "next-intl/client";

export function LanguageSwitcher() {
  const router = useRouter();
  const currentLocale = router.locale;

  const toggleLanguage = () => {
    const newLocale = currentLocale === "en" ? "st" : "en";
    router.push(router.asPath, undefined, { locale: newLocale });
  };

  return (
    <button onClick={toggleLanguage} className="px-2 py-1 border rounded hover:bg-green-200">
      {currentLocale === "en" ? "Sesotho" : "English"}
    </button>
  );
}
