"use client";

import { useState, ReactNode } from "react";
import { LanguageSwitcher } from "./LanguageSwitcher";
import Link from "next/link";

export default function LayoutClient({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState("en");

  return (
    <>
      <header className="bg-green-700 text-white flex justify-between items-center p-4">
        <h1 className="text-xl font-bold">AI Crop Disease Detector</h1>
        <nav className="flex gap-4">
          <Link href="/" className="hover:underline">Home</Link>
          <Link href="/predictions" className="hover:underline">Saved</Link>
        </nav>
        <LanguageSwitcher currentLang={lang} setLang={setLang} />
      </header>

      <main className="flex-grow p-4">{children}</main>

      <footer className="bg-green-700 text-white text-center p-4">
        © 2025 Crop AI Project
      </footer>
    </>
  );
}
