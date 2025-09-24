
import {setRequestLocale} from "next-intl/server";
import Home from "../../components/pages/Home";

export default async function HomePage({ params }: { params: { locale: string } }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <Home />;
}

