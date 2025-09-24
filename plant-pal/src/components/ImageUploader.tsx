"use client";

import { useState, DragEvent, useRef } from "react";
import { useTranslations, useLocale } from "next-intl";
import Image from "next/image";
import { Prediction } from "../types";

interface Props {
  onUpload: (prediction: Prediction) => void;
}

export const ImageUploader: React.FC<Props> = ({ onUpload }) => {
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const t = useTranslations("upload");
  const locale = useLocale();

  const handleUploadFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError(t("invalid_file_type"));
      return;
    }
    if (file.size > 5_000_000) {
      setError(t("file_too_large"));
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("locale", locale);

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
      setError(t("upload_error"));
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
    setDragActive(e.type === "dragenter" || e.type === "dragover");
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

  const formatDiseaseName = (name: string) =>
    name
      .split("_")
      .map((word) => word[0].toUpperCase() + word.slice(1))
      .join(" ");

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-lg mx-auto p-6 bg-white rounded-xl shadow-lg relative">
      {/* Upload Area */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={handleClick}
        role="button"
        aria-label={t("upload_image")}
        tabIndex={0}
        className={`relative w-full h-80 rounded-2xl cursor-pointer transition-all duration-300 ease-in-out flex items-center justify-center
          ${dragActive ? "border-4 border-green-500 shadow-xl" : "bg-[#31B96A]/80 "}`}
      >
        <div className="text-center text-white z-10">
          {dragActive ? (
            <span className="font-semibold text-lg">{t("drop_image")}</span>
          ) : (
            <div className="flex flex-col justify-center items-center gap-4">
              <Image
                src="/drag-default.png"
                alt={t("drag_here")}
                width={280}
                height={140}
                className="rounded-lg opacity-75"
              />
              <div className="bg-[#0B978B] items-center justify-center text-center px-2 py-3 overlay translate-y-[30px] rounded-full w-16 h-16">
                <Image src="/camera.png" width={60} height={60} alt="camera" />
              </div>
              <p className="text-gray-100 mt-4 text-xl font-medium">{t("drag_or_click")}</p>
            </div>
          )}
        </div>

        {/* Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center rounded-2xl z-20">
            <div className="w-12 h-12 border-4 border-white border-t-transparent border-b-transparent rounded-full animate-spin"></div>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleChange}
          className="absolute w-full h-full opacity-0 cursor-pointer"
        />
      </div>

      {/* Error or Loading Text */}
      {error && <p className="text-red-600 font-medium">{error}</p>}
      {loading && !prediction && <p className="text-green-700 font-medium">{t("loading")}</p>}

      {/* Prediction Display */}
      {prediction && (
        <div className="w-full bg-green-50 border border-green-200 rounded-xl p-4 shadow-md flex flex-col items-center gap-4 mt-6">
          <Image
            src={encodeURI(prediction.image_url)}
            alt="Uploaded"
            width={320}
            height={240}
            style={{ width: "100%", height: "auto" }}
            className="rounded-lg shadow-xl transform -translate-y-6"
          />
          <div className="text-center text-gray-700">
            <p>
              <span className="font-semibold text-teal-600">{t("disease")}:</span>{" "}
              {formatDiseaseName(prediction.disease_name)}
            </p>
            <p>
              <span className="font-semibold text-teal-600">{t("severity")}:</span> {prediction.severity}
            </p>
            <p>
              <span className="font-semibold text-teal-600">{t("treatment")}:</span> {prediction.treatment}
            </p>
            <p className="text-xs text-gray-500 mt-1 italic">{locale.toUpperCase()}</p>
          </div>
        </div>
      )}
    </div>
  );
};

