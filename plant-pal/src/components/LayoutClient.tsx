"use client";

import { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "./LanguageSwitcher";
import Link from "next/link";

export default function LayoutClient({ children }: { children: ReactNode }) {
  const t = useTranslations();

  return (
    <>
      <header className="bg-green-700 text-white flex justify-between items-center p-4">
        <h1 className="text-xl font-bold">{t("header.title")}</h1>
        <nav className="flex gap-4">
          <Link href="/" className="hover:underline">{t("nav.home")}</Link>
          <Link href="/predictions" className="hover:underline">{t("nav.history")}</Link>
        </nav>
        <LanguageSwitcher />
      </header>

      <main className="flex-grow p-4">{children}</main>

      <footer className="bg-green-700 text-white text-center p-4">
        © 2025 Plant Pal
      </footer>
    </>
  );
}
