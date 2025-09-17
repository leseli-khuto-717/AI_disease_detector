"use client";
import { useState } from "react";
import { ImageUploader } from "../../components/ImageUploader";
import { PredictionCard } from "../../components/PredictionCard";

interface Prediction {
  disease: string;
  severity: string;
  treatment: string;
  image_url: string;
}

export default function Home() {
  const [prediction, setPrediction] = useState<Prediction | null>(null);

  // ✅ This now receives the full prediction object directly
  const handleUpload = (result: Prediction) => {
    setPrediction(result);
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <h2 className="text-2xl font-bold text-green-800">Upload your crop image</h2>
      <ImageUploader onUpload={handleUpload} />
      {prediction && (
        <PredictionCard
          disease={prediction.disease}
          severity={prediction.severity}
          treatment={prediction.treatment}
        />
      )}
    </div>
  );
}
