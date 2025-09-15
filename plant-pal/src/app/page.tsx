"use client";
import { useState } from "react";
import { ImageUploader } from "../components/ImageUploader";
import { getPrediction } from "./lib/api";
import { PredictionCard } from "../components/PredictionCard";

export default function Home() {
  const [prediction, setPrediction] = useState<any>(null);

  const handleUpload = async (imageUrl: string) => {
    const result = await getPrediction(imageUrl);
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
