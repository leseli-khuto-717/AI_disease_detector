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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPredictions = async () => {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/predict`);
        setPredictions(res.data);
      } catch (err) {
        console.error("Error fetching predictions:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPredictions();
  }, []);

  if (loading) {
    return <div className="text-center text-green-700">Loading predictions...</div>;
  }

  if (predictions.length === 0) {
    return <div className="text-center text-green-700">No saved predictions yet.</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {predictions.map((p) => (
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
  );
}
