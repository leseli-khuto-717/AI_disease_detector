"use client";

import { useState, DragEvent, useRef } from "react";
import { useTranslations, useLocale } from "next-intl";
import Image from "next/image";
import { Prediction } from "../types"; // adjust path as needed

interface Props {
  onUpload: (prediction: Prediction) => void;
}

export const ImageUploader: React.FC<Props> = ({ onUpload }) => {
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [prediction, setPrediction] = useState<Prediction | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const t = useTranslations('upload');
  const locale = useLocale(); // ✅ current frontend locale

  const handleUploadFile = async (file: File) => {
    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("locale", locale); // ✅ send locale in POST body

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUploadFile(file);
  };

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

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-lg mx-auto p-6 bg-light-blue-100 rounded-lg shadow-md">
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={handleClick}
        className={`relative w-full h-80 rounded-xl cursor-pointer transition-all duration-300 ease-in-out ${
          dragActive ? "border-4 border-green-500 shadow-xl" : "bg-green-600 bg-opacity-90 hover:bg-green-500"
        }`}
      >
        <div className="text-center text-white">
          {dragActive
            ? <span className="font-semibold text-lg">{t('drop_image')}</span>
            : <div className="flex flex-col justify-center items-center gap-4">
                <Image
                  src="/drag-default.png"
                  alt={t('drag_here')}
                  width={280}
                  height={140}
                  className="rounded-lg opacity-75"
                />
                <div className="bg-teal-600 rounded-full p-4 shadow-lg">
                  <Image src="/camera.png" width={60} height={60} alt="camera" />
                </div>
                <p className="text-gray-100 mt-4 text-xl">{t('drag_or_click')}</p>
              </div>
          }
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleChange}
          className="absolute w-full h-full opacity-0 cursor-pointer"
        />
      </div>

      {loading && <p className="text-green-700 font-medium">{t('loading')}</p>}

      {prediction && (
        <div className="w-full bg-green-50 border border-green-200 rounded-md p-4 shadow-md flex flex-col items-center gap-4 mt-6">
          <Image
            src={encodeURI(prediction.image_url)}
            alt="Uploaded"
            width={320}
            height={240}
            style={{ width: "100%", height: "auto" }}
            className="rounded-lg shadow-xl transform -translate-y-8"
          />
          <div className="text-center text-gray-700">
            <p><span className="font-semibold text-teal-600">{t('disease')}:</span> {prediction.disease_name}</p>
            <p><span className="font-semibold text-teal-600">{t('severity')}:</span> {prediction.severity}</p>
            <p><span className="font-semibold text-teal-600">{t('treatment')}:</span> {prediction.treatment}</p>
            <p className="text-xs text-gray-500 mt-1 italic">{locale.toUpperCase()}</p>
          </div>
        </div>
      )}
    </div>
  );
};
