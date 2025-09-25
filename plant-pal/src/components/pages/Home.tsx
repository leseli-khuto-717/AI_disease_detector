"use client";
import { useState } from "react";
import { ImageUploader } from "../ImageUploader";
import { PredictionCard } from "../PredictionCard";
import {useTranslations} from 'next-intl';
import { Prediction } from "../../types"; // adjust path as needed

export default function Home() {

  
  const [prediction, setPrediction] = useState<Prediction | null>(null);

  const t = useTranslations('upload');
  
  // ✅ This now receives the full prediction object directly
  const handleUpload = (result: Prediction) => {
    setPrediction(result);
  };

  return (
    <div className="flex flex-col md:flex-row items-center gap-6">
     <div className={"gap-6 flex flex-col items-center"}>
     	 <ImageUploader onUpload={handleUpload} />
      	<h2 className="text-[1.15rem] font-black ">{t('image')}</h2>
      </div>
      {prediction && (
        <PredictionCard
          disease={prediction.disease}
          severity={prediction.severity.toString()}
          treatment={prediction.treatment}
        />
      )}
    </div>
  );
}
