"use client";

import { useEffect, useState } from "react";
import { useTranslations, useLocale } from 'next-intl';
import axios from "axios";
import Image from "next/image";

interface Prediction {
  id: string;
  crop_name?: string;
  disease_name?: string;
  severity?: number;
  treatment?: string;
  image_url?: string;
  created_at?: string;
}

export default function History() {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [filtered, setFiltered] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [cropFilter, setCropFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");

  const t = useTranslations('histories');
  const locale = useLocale(); // Get current locale

  // Fetch predictions from backend in the correct locale
  useEffect(() => {
    const fetchPredictions = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/predictions?locale=${locale}`
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
  }, [locale]); // refetch if locale changes

  // Filter & sort predictions
  useEffect(() => {
    let temp = [...predictions];

    const lowerSearch = search.toLowerCase();
    if (search.trim() !== "") {
      temp = temp.filter((p) =>
        (p.disease_name ?? "unknown").toLowerCase().includes(lowerSearch)
      );
    }

    if (cropFilter !== "all") {
      temp = temp.filter(
        (p) => (p.crop_name ?? "unknown").toLowerCase() === cropFilter
      );
    }

    temp.sort((a, b) => {
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });

    setFiltered(temp);
  }, [search, cropFilter, sortOrder, predictions]);

  const severityColor = (severity?: number) => {
    if (severity === undefined) return "bg-gray-200";
    if (severity > 0.7) return "bg-red-200";
    if (severity > 0.4) return "bg-yellow-200";
    return "bg-green-200";
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-2xl font-bold text-green-800 mb-4 text-center">
        {t('title')}
      </h1>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row justify-center gap-4 mb-6">
        <input
          type="text"
          placeholder={t('search_placeholder')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-64 p-2 rounded-lg border border-green-300 focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <select
          value={cropFilter}
          onChange={(e) => setCropFilter(e.target.value)}
          className="w-full sm:w-48 p-2 rounded-lg border border-green-300 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="all">{t('crops')}</option>
          <option value="maize">{t('maize')}</option>
          <option value="beans">{t('beans')}</option>
          <option value="tomato">{t('tomato')}</option>
        </select>
        <select
          value={sortOrder}
          onChange={(e) =>
            setSortOrder(e.target.value as "newest" | "oldest")
          }
          className="w-full sm:w-48 p-2 rounded-lg border border-green-300 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="newest">{t('newest_time')}</option>
          <option value="oldest">{t('oldest_time')}</option>
        </select>
      </div>

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="bg-green-100 rounded-xl shadow-md h-64 animate-pulse"
            ></div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center text-green-700">{t('nothing')}</div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
  <div
    key={p.id}
    className={`rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow ${severityColor(p.severity)}`}
  >
    <Image
      src={p.image_url ?? ""}
      alt={p.disease_name ?? "unknown"}
      className="h-48 w-full object-cover"
    />
    <div className="p-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-green-800">
          {p.disease_name ?? "Unknown"}
        </h3>
        <span className="text-xs text-gray-500 italic">
          {locale.toUpperCase()} {/* Show current language */}
        </span>
      </div>
      <p className="text-sm text-green-700">
        <strong>{t('name')}:</strong> {p.crop_name ?? "N/A"}
      </p>
      <p className="text-sm text-green-700">
        <strong>{t('severity')}:</strong>{p.severity !== undefined ? p.severity.toFixed(2) : "N/A"}
      </p>
      <p className="text-sm text-green-700">
        <strong>{t('treatment')}:</strong> {p.treatment ?? "N/A"}
      </p>
      <p className="text-xs text-green-600 mt-2">
        {p.created_at ? new Date(p.created_at).toLocaleString() : "Unknown date"}
      </p>
    </div>
  </div>
))}

        </div>
      )}
    </div>
  );
}

