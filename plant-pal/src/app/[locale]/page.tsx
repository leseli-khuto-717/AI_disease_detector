
import {setRequestLocale} from "next-intl/server";
import Home from "../../components/pages/Home";

export default  function HomePage({ params }: { params: { locale: string } }) {
  const { locale } =  params;
  setRequestLocale(locale);
  return <Home />;
}

