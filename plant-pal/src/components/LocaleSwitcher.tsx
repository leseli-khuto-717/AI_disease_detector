import { useTranslations, useLocale } from  "next-intl";
import LocalSwitcherSelect from "./LocalSwitcherSelect";
import { routing } from "../i18n/routing"

export default function LocaleSwitcher(){

const t = useTranslations('Localeswitcher');
const  locale = useLocale();


return (
	<LocalSwitcherSelect 
		defaultValue={locale} 
		label={t("label")}>
	{routing.locales.map((cur) => (
		<option key ={cur} value={cur}>
			{t('locale', {locale: cur})}
		</option>
	))}
	</LocalSwitcherSelect>
)
}
