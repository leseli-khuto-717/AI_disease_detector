import { supabase } from "./supabaseClient";

export const getPrediction = async (imageUrl: string) => {
  const res = await fetch(process.env.NEXT_PUBLIC_BACKEND_URL!, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image_url: imageUrl }),
  });
  if (!res.ok) throw new Error("Prediction failed");
  return res.json();
};

export const fetchPredictions = async () => {
  const { data, error } = await supabase
    .from("predictions")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data;
};

export const supabaseDeletePrediction = async (id: string) => {
  const { error } = await supabase.from("predictions").delete().eq("id", id);
  if (error) throw new Error(error.message);
};
