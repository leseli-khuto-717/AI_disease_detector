
import {setRequestLocale} from "next-intl/server";
import History from "../../../components/pages/history";

export default function PredictionsPage({ params }: { params: { locale: string } }){
const {locale} = params;
setRequestLocale(locale);

return (
	<>
	<History />
	</>
)

}
