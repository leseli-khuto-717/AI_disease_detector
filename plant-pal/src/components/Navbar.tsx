"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "../i18n/navigation";
import LocaleSwitcher from "./LocaleSwitcher";

export default function Navbar() {
  const t = useTranslations();
  const pathname = usePathname();

  const activeClass = "bg-white px-2 py-1 text-black rounded";
  const inactiveClass = "hover:underline text-black";

  return (
    <nav className="bg-[#0B978B] text-white flex justify-between items-center py-2 px-4 rounded-b-lg">
      <h1 className="text-[1.6rem] text-black font-bold">{t("header.title")}</h1>
      <ul className="flex gap-4">
        <Link
          href="/"
          className={pathname === "/" ? activeClass : inactiveClass}
        >
          {t("nav.home")}
        </Link>
        <Link
          href="/predictions"
          className={pathname === "/predictions" ? activeClass : inactiveClass}
        >
          {t("nav.history")}
        </Link>
      </ul>
      <LocaleSwitcher />
    </nav>
  );
}

