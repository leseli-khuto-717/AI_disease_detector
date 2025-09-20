//import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import LayoutClient from "../../components/LayoutClient";
import {NextIntlClientProvider, hasLocale} from 'next-intl';
import { getMessages, setRequestLocale, getTranslations } from "next-intl/server";
import {notFound} from 'next/navigation';
import {routing} from '@/i18n/routing';
 
type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string; }>;
};
 

/**const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],f
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
${geistSans.variable} ${geistMono.variable} antialiased***/
export function generateStaticParams() {
return routing.locales.map((locale) => ({locale}))
}
export async function generateMetadata({params}: Props){
 const {locale} = await params;
 const t = await getTranslations({locale, namespace: "Metadata"});
 
 return {
 title: t("title")
 }
}

export default async function LocaleLayout({children, params}: Props) {
  const {locale} = await params;
  setRequestLocale(locale);
  
  const messages = await getMessages();
  // Ensure that the incoming `locale` is valid
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
   
  return (
    <html lang={locale}>
      <body className={`bg-green-50 min-h-screen flex flex-col`} >
        <NextIntlClientProvider messages={messages} >
          <LayoutClient>{children}</LayoutClient>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
