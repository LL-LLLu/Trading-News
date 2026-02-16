"use client";

import Link from "next/link";
import { format } from "date-fns";
import { FiArrowLeft, FiCalendar } from "react-icons/fi";
import { MarkdownRenderer } from "@/components/ui/MarkdownRenderer";

interface Props {
  evaluation: {
    ticker: string;
    title: string;
    content: string;
    coverImage: string | null;
    createdAt: string;
    updatedAt: string;
  };
}

export function EvaluationDetail({ evaluation }: Props) {
  return (
    <div className="min-h-screen bg-[#FAF7F2] dark:bg-[#111111]">
      {/* Back link */}
      <div className="max-w-3xl mx-auto px-4 pt-6">
        <Link
          href="/evaluations"
          className="inline-flex items-center gap-1.5 text-sm text-[#6B7280] hover:text-[#0F4C81] dark:hover:text-[#5BA3D9] transition-colors mb-6"
        >
          <FiArrowLeft size={14} />
          Back to Evaluations
        </Link>
      </div>

      {/* Cover image */}
      {evaluation.coverImage && (
        <div className="max-w-4xl mx-auto px-4 mb-6">
          <div className="rounded-lg overflow-hidden aspect-[21/9]">
            <img
              src={evaluation.coverImage}
              alt={evaluation.title}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}

      {/* Article */}
      <article className="max-w-3xl mx-auto px-4 pb-16">
        <div className="mb-2">
          <span className="inline-block px-2 py-0.5 bg-[#0F4C81] text-white text-xs font-medium rounded">
            {evaluation.ticker}
          </span>
        </div>

        <h1 className="font-serif text-3xl md:text-4xl font-bold text-[#1A1A1A] dark:text-[#F5F5F4] mb-3 leading-tight">
          {evaluation.title}
        </h1>

        <div className="flex items-center gap-2 text-xs text-[#6B7280] mb-8 pb-6 border-b border-[#E5E0D8] dark:border-[#2D2D2D]">
          <FiCalendar size={12} />
          {format(new Date(evaluation.createdAt), "MMMM d, yyyy")}
          {evaluation.updatedAt !== evaluation.createdAt && (
            <span>
              &middot; Updated{" "}
              {format(new Date(evaluation.updatedAt), "MMM d, yyyy")}
            </span>
          )}
        </div>

        <MarkdownRenderer content={evaluation.content} />
      </article>
    </div>
  );
}
