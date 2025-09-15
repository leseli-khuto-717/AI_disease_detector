"use client";

import { useState } from "react";
import { supabase } from "../app/lib/supabaseClient";

interface Props {
  onUpload: (url: string) => void;
}

export const ImageUploader: React.FC<Props> = ({ onUpload }) => {
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const fileName = `${Date.now()}_${file.name}`;

    // Upload to "crop-images" bucket (public)
    const { error } = await supabase.storage.from("crop-images").upload(fileName, file);
    if (error) {
      console.error(error.message);
      setLoading(false);
      return;
    }

    // Get public URL from same bucket
    const { data } = supabase.storage.from("crop-images").getPublicUrl(fileName);
    const publicUrl = data.publicUrl;

    // Set preview and notify parent
    setPreviewUrl(publicUrl);
    setLoading(false);
    onUpload(publicUrl);
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <input type="file" accept="image/*" onChange={handleUpload} />
      {loading && <p>Uploading image...</p>}

      {/* Show uploaded image preview */}
      {previewUrl && (
        <div className="mt-2">
          <p className="text-sm">Preview:</p>
          <img src={previewUrl} alt="Uploaded" className="h-40 w-auto rounded shadow-md" />
        </div>
      )}
    </div>
  );
};
