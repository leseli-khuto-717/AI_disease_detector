"use client"

import { ChangeEvent, ReactNode, useTransition } from "react";
import { useRouter, usePathname  } from "../i18n/navigation"; 
import { useParams } from "next/navigation";

type Props = {
	children: ReactNode;
	defaultValue: string;
	label: string;
}

export default function LocalSwitcherSelect({
	children,
	defaultValue,
	label
	} : Props) {
	
	const router = useRouter();
	const [isPending, startTransition] = useTransition();
	const pathname = usePathname();
	const params = useParams();
	
	function onSelectChange(event: ChangeEvent<HTMLSelectElement>){
		const nextLocale = event.target.value;
		startTransition(() =>{
			router.replace(
			// @ts-expect-error- to ignore the error from params
			 {pathname, params},
			 {locale:nextLocale}
			)
		});
	}
	
	return (
		<label className={`relative text-black border rounded-md ${ isPending ? 'transition-opacity [&:disabled]:opacity-30':''}`}>
			<p className={'sr-only'}>{label}</p>
			<select className={'inline-flex appearance-none bg-transparent py-3 pl-2 pr-6'}
					defaultValue={defaultValue}
					disabled={isPending}
					onChange={onSelectChange}>
					{children}
					</select>
					<span className={'pointer-events-none absolute right-2 top-[8px]'}></span>
		</label>
	)

}
