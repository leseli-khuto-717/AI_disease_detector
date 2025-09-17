"use client";

import { useEffect, useState } from "react";
import axios from "axios";

interface Prediction {
  id: string;
  disease: string;
  severity: string;
  treatment: string;
  image_url: string;
  created_at: string;
}

export default function PredictionsPage() {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [filtered, setFiltered] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchPredictions = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/predictions`
        );
        setPredictions(res.data);
        setFiltered(res.data);
      } catch (err) {
        console.error("Error fetching predictions:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPredictions();
  }, []);

  // Filter predictions based on search
  useEffect(() => {
    const lowerSearch = search.toLowerCase();
    setFiltered(
      predictions.filter((p) =>
        p.disease.toLowerCase().includes(lowerSearch)
      )
    );
  }, [search, predictions]);

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-2xl font-bold text-green-800 mb-4 text-center">
        Saved Crop Disease Predictions
      </h1>

      {/* Search Input */}
      <div className="mb-6 flex justify-center">
        <input
          type="text"
          placeholder="Search by disease..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-96 p-2 rounded-lg border border-green-300 focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Skeleton cards */}
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="bg-green-100 rounded-xl shadow-md h-64 animate-pulse"
            ></div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center text-green-700">
          No predictions match your search.
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <div
              key={p.id}
              className="bg-green-100 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <img
                src={p.image_url}
                alt={p.disease}
                className="h-48 w-full object-cover"
              />
              <div className="p-4">
                <h3 className="text-lg font-bold text-green-800">{p.disease}</h3>
                <p className="text-sm text-green-700">
                  <strong>Severity:</strong> {p.severity}
                </p>
                <p className="text-sm text-green-700">
                  <strong>Treatment:</strong> {p.treatment}
                </p>
                <p className="text-xs text-green-600 mt-2">
                  {new Date(p.created_at).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
