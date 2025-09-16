"use client";

import { useState, DragEvent } from "react";
import Image from "next/image";

interface Prediction {
  disease: string;
  severity: string;
  treatment: string;
  image_url: string;
}

interface Props {
  onUpload: (prediction: Prediction) => void;
}

export const ImageUploader: React.FC<Props> = ({ onUpload }) => {
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [prediction, setPrediction] = useState<Prediction | null>(null);

  const handleUploadFile = async (file: File) => {
    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/predict/`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Prediction failed");

      const result: Prediction = await response.json();
      setPrediction(result);
      onUpload(result);
    } catch (err) {
      console.error(err);
      alert("Error uploading image or getting prediction.");
    } finally {
      setLoading(false);
    }
  };

  // File input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUploadFile(file);
  };

  // Drag events
  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) handleUploadFile(file);
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-md mx-auto">
      {/* Drag & drop area */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        className={`w-full h-40 flex items-center justify-center border-2 border-dashed rounded-md cursor-pointer transition-colors ${
          dragActive ? "border-green-600 bg-green-100" : "border-gray-300 bg-white"
        }`}
      >
        <p className="text-center text-gray-700">
          {dragActive
            ? "Drop the image here..."
            : "Drag & drop an image or click to upload"}
        </p>
        <input
          type="file"
          accept="image/*"
          onChange={handleChange}
          className="absolute w-full h-full opacity-0 cursor-pointer"
        />
      </div>

      {loading && <p className="text-green-700 font-medium">Uploading & predicting...</p>}

      {/* Display prediction */}
      {prediction && (
        <div className="w-full bg-green-50 border border-green-200 rounded-md p-4 shadow-sm flex flex-col items-center gap-2">
          <Image
            src={encodeURI(prediction.image_url)} // ✅ encode URL for safety
            alt="Uploaded"
            width={320}  // recommended width for display
            height={240} // recommended height for display
            style={{ width: "100%", height: "auto" }} // responsive
            className="rounded shadow-md"
          />
          <div className="text-center">
            <p>
              <span className="font-semibold">Disease:</span> {prediction.disease}
            </p>
            <p>
              <span className="font-semibold">Severity:</span> {prediction.severity}
            </p>
            <p>
              <span className="font-semibold">Treatment:</span> {prediction.treatment}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
