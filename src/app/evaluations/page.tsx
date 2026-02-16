"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { FiFileText } from "react-icons/fi";
import { Header } from "@/components/layout/Header";
import { useLanguage } from "@/contexts/LanguageContext";

interface Evaluation {
  id: string;
  ticker: string;
  title: string;
  slug: string;
  content: string;
  coverImage: string | null;
  createdAt: string;
}

export default function EvaluationsPage() {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    fetch("/api/evaluations")
      .then((r) => r.json())
      .then((data) => {
        setEvaluations(data);
        setLoading(false);
      });
  }, []);

  function getExcerpt(content: string, maxLen = 120): string {
    const plain = content
      .replace(/#{1,6}\s/g, "")
      .replace(/[*_`~\[\]]/g, "")
      .replace(/\n+/g, " ")
      .trim();
    return plain.length > maxLen ? plain.slice(0, maxLen) + "..." : plain;
  }

  return (
    <div className="min-h-screen">
      <Header title={t("nav.evaluations")} />

      <div className="max-w-5xl mx-auto px-4 py-6">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-64 bg-white dark:bg-[#1A1A1A] border border-[#E5E0D8] dark:border-[#2D2D2D] rounded-lg animate-pulse"
              />
            ))}
          </div>
        ) : evaluations.length === 0 ? (
          <div className="text-center py-16">
            <FiFileText className="mx-auto text-[#D1D5DB] dark:text-[#4B5563] mb-3" size={32} />
            <p className="text-[#6B7280] text-sm">
              No evaluations published yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {evaluations.map((ev) => (
              <Link
                key={ev.id}
                href={`/evaluations/${ev.slug}`}
                className="group bg-white dark:bg-[#1A1A1A] border border-[#E5E0D8] dark:border-[#2D2D2D] rounded-lg overflow-hidden hover:shadow-md transition-shadow"
              >
                {ev.coverImage ? (
                  <div className="aspect-[16/9] overflow-hidden">
                    <img
                      src={ev.coverImage}
                      alt={ev.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ) : (
                  <div className="aspect-[16/9] bg-gradient-to-br from-[#0F4C81] to-[#1A6FB5] flex items-center justify-center">
                    <span className="text-white/80 font-serif text-3xl font-bold">
                      {ev.ticker}
                    </span>
                  </div>
                )}

                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 bg-[#0F4C81] text-white text-[10px] font-medium rounded">
                      {ev.ticker}
                    </span>
                    <span className="text-[10px] text-[#6B7280]">
                      {format(new Date(ev.createdAt), "MMM d, yyyy")}
                    </span>
                  </div>
                  <h3 className="font-serif text-base font-bold text-[#1A1A1A] dark:text-[#F5F5F4] mb-1 line-clamp-2 group-hover:text-[#0F4C81] dark:group-hover:text-[#5BA3D9] transition-colors">
                    {ev.title}
                  </h3>
                  <p className="text-xs text-[#6B7280] line-clamp-3">
                    {getExcerpt(ev.content)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
