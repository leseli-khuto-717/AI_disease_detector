"use client";
import { useEffect, useState } from "react";
import { fetchPredictions, supabaseDeletePrediction } from "../lib/api";
import { PredictionCard } from "../../components/PredictionCard";

export default function SavedPredictions() {
  const [predictions, setPredictions] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const load = async () => {
      const data = await fetchPredictions();
      setPredictions(data);
      setFiltered(data);
    };
    load();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this prediction?")) return;
    await supabaseDeletePrediction(id);
    const updated = predictions.filter((p) => p.id !== id);
    setPredictions(updated);
    setFiltered(updated);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toLowerCase();
    setSearch(term);
    setFiltered(predictions.filter((p) => p.disease.toLowerCase().includes(term)));
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full p-4">
      <input
        type="text"
        placeholder="Search by disease..."
        value={search}
        onChange={handleSearch}
        className="w-full max-w-md p-2 rounded border border-green-300 focus:outline-none focus:ring-2 focus:ring-green-400"
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full">
        {filtered.map((p) => (
          <div key={p.id} className="flex flex-col items-center gap-2">
            <img
              src={p.image_url}
              alt={p.disease}
              className="w-full h-48 object-cover rounded-xl shadow-md"
            />
            <PredictionCard
              id={p.id}
              disease={p.disease}
              severity={p.severity}
              treatment={p.treatment}
              onDelete={handleDelete}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
