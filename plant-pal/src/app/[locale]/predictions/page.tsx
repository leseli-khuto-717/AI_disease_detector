
import {setRequestLocale} from "next-intl/server";
import History from "../../../components/pages/history";

export default async function PredictionsPage({ params }: { params: { locale: string } }){
const {locale} =  await params;
setRequestLocale(locale);

return (
	<>
	<History />
	</>
)

}
