interface Props {
  currentLang: string;
  setLang: (lang: string) => void;
}

export const LanguageSwitcher: React.FC<Props> = ({ currentLang, setLang }) => (
  <div className="flex gap-2">
    <button
      className={currentLang === "en" ? "font-bold underline" : ""}
      onClick={() => setLang("en")}
    >English</button>
    <button
      className={currentLang === "st" ? "font-bold underline" : ""}
      onClick={() => setLang("st")}
    >Sesotho</button>
  </div>
);
