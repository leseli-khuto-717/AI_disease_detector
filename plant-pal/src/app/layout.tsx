import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import LayoutClient from "../components/LayoutClient";
import { IntlProvider } from "next-intl";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const messages = require(`./locales/${params.locale}.json`);

  return (
    <html lang={params.locale}>
      <body
        className={`bg-green-50 min-h-screen flex flex-col ${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <IntlProvider locale={params.locale} messages={messages}>
          <LayoutClient>{children}</LayoutClient>
        </IntlProvider>
      </body>
    </html>
  );
}
