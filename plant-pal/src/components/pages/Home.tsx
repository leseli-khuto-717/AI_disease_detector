"use client";
import { useState } from "react";
import { ImageUploader } from "../ImageUploader";
import { PredictionCard } from "../PredictionCard";
import {useTranslations} from 'next-intl';


interface Prediction {
  disease_name: string;
  severity: string;
  treatment: string;
  image_url: string;
}


export default function Home() {

  
  const [prediction, setPrediction] = useState<Prediction | null>(null);

  const t = useTranslations('upload');
  
  // ✅ This now receives the full prediction object directly
  const handleUpload = (result: Prediction) => {
    setPrediction(result);
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <ImageUploader onUpload={handleUpload} />
      <h2 className="text-[1.15rem] font-black ">{t('image')}</h2>
      {prediction && (
        <PredictionCard
          disease={prediction.disease_name}
          severity={prediction.severity}
          treatment={prediction.treatment}
        />
      )}
    </div>
  );
}
