"use client";

import { useState, DragEvent, useRef } from "react";
import { useTranslations, useLocale } from 'next-intl';
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
  const locale = useLocale(); // ✅ Correctly get current frontend locale

  const handleUploadFile = async (file: File) => {
    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      // ✅ Send locale to backend
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/predict/?locale=${locale}`,
        { method: "POST", body: formData }
      );

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
    <div className="flex flex-col items-center gap-4 w-full max-w-md mx-auto">
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={handleClick}
        className={`relative w-88 h-80 flex items-center justify-center rounded-[40px] cursor-pointer transition-colors ${
          dragActive ? "border-green-600" : "bg-[#31B96A] bg-opacity-90"
        }`}
      >
        <div className="text-center text-gray-700">
          {dragActive
            ? <span>{t('drop_image')}</span>
            : <div className="flex flex-col justify-center items-center justify-evenly">
                <Image
                  src="/drag-default.png"
                  alt={t('drag_here')}
                  width={300}
                  height={150}
                  className="rounded-[20px] opacity-55 mt-10"
                />
                <div className="bg-[#0B978B] items-center justify-center text-center px-2 py-3 overlay translate-y-[30px] rounded-full w-16 h-16">
                  <Image src="/camera.png" width={60} height={60} alt="camera" />
                </div>
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
        <div className="w-full bg-green-50 border border-green-200 rounded-md p-4 shadow-sm flex flex-col items-center gap-2">
          <Image
            src={encodeURI(prediction.image_url)}
            alt="Uploaded"
            width={320}
            height={240}
            style={{ width: "100%", height: "auto" }}
            className="rounded shadow-md"
          />
          <div className="text-center">
            <p><span className="font-semibold">{t('disease')}:</span> {prediction.disease_name}</p>
            <p><span className="font-semibold">{t('severity')}:</span> {prediction.severity}</p>
            <p><span className="font-semibold">{t('treatment')}:</span> {prediction.treatment}</p>
            <p className="text-xs text-gray-500 mt-1 italic">{locale.toUpperCase()}</p> {/* optional: show current language */}
          </div>
        </div>
      )}
    </div>
  );
};

