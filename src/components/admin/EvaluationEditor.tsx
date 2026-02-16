"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FiSave, FiEye, FiEdit3, FiArrowLeft, FiImage, FiTrash2 } from "react-icons/fi";
import { MarkdownRenderer } from "@/components/ui/MarkdownRenderer";

interface EvaluationData {
  id?: string;
  ticker: string;
  title: string;
  content: string;
  coverImage: string;
  published: boolean;
}

export function EvaluationEditor({ id }: { id?: string }) {
  const router = useRouter();
  const [data, setData] = useState<EvaluationData>({
    ticker: "",
    title: "",
    content: "",
    coverImage: "",
    published: false,
  });
  const [preview, setPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [loading, setLoading] = useState(!!id);

  useEffect(() => {
    if (id) {
      fetch(`/api/evaluations/${id}`)
        .then((r) => r.json())
        .then((eval_data) => {
          setData({
            id: eval_data.id,
            ticker: eval_data.ticker,
            title: eval_data.title,
            content: eval_data.content,
            coverImage: eval_data.coverImage || "",
            published: eval_data.published,
          });
          setLoading(false);
        });
    }
  }, [id]);

  async function handleSave() {
    setSaving(true);
    try {
      const url = id ? `/api/evaluations/${id}` : "/api/evaluations";
      const method = id ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        router.push("/admin");
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!id || !confirm("Delete this evaluation?")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/evaluations/${id}`, { method: "DELETE" });
      if (res.ok) router.push("/admin");
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="p-6 text-[#6B7280]">Loading...</div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] dark:bg-[#111111]">
      {/* Header bar */}
      <div className="sticky top-0 z-10 bg-[#FAF7F2]/95 dark:bg-[#111111]/95 backdrop-blur border-b border-[#E5E0D8] dark:border-[#2D2D2D]">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => router.push("/admin")}
            className="flex items-center gap-2 text-sm text-[#6B7280] hover:text-[#1A1A1A] dark:hover:text-[#F5F5F4] transition-colors"
          >
            <FiArrowLeft size={16} />
            Back
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPreview(!preview)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-[#6B7280] hover:text-[#1A1A1A] dark:hover:text-[#F5F5F4] border border-[#E5E0D8] dark:border-[#2D2D2D] rounded-lg transition-colors"
            >
              {preview ? <FiEdit3 size={14} /> : <FiEye size={14} />}
              {preview ? "Edit" : "Preview"}
            </button>

            {id && (
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-600 hover:text-red-700 border border-red-200 dark:border-red-900 rounded-lg transition-colors"
              >
                <FiTrash2 size={14} />
                {deleting ? "..." : "Delete"}
              </button>
            )}

            <label className="flex items-center gap-2 px-3 py-1.5 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={data.published}
                onChange={(e) =>
                  setData({ ...data, published: e.target.checked })
                }
                className="accent-[#0F4C81]"
              />
              <span className="text-[#6B7280]">Published</span>
            </label>

            <button
              onClick={handleSave}
              disabled={saving || !data.ticker || !data.title || !data.content}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-[#0F4C81] text-white text-sm font-medium rounded-lg hover:bg-[#0D3F6B] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <FiSave size={14} />
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {preview ? (
          /* Preview mode */
          <div>
            {data.coverImage && (
              <div className="mb-6 rounded-lg overflow-hidden aspect-[21/9]">
                <img
                  src={data.coverImage}
                  alt={data.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="mb-2">
              <span className="inline-block px-2 py-0.5 bg-[#0F4C81] text-white text-xs font-medium rounded">
                {data.ticker || "TICKER"}
              </span>
            </div>
            <h1 className="font-serif text-3xl font-bold text-[#1A1A1A] dark:text-[#F5F5F4] mb-6">
              {data.title || "Untitled"}
            </h1>
            <MarkdownRenderer content={data.content} />
          </div>
        ) : (
          /* Edit mode */
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#6B7280] mb-1">
                  Ticker
                </label>
                <input
                  type="text"
                  value={data.ticker}
                  onChange={(e) =>
                    setData({ ...data, ticker: e.target.value.toUpperCase() })
                  }
                  placeholder="AAPL"
                  className="w-full px-3 py-2 bg-white dark:bg-[#1A1A1A] border border-[#E5E0D8] dark:border-[#2D2D2D] rounded-lg text-sm text-[#1A1A1A] dark:text-[#F5F5F4] placeholder-[#9CA3AF] focus:outline-none focus:border-[#0F4C81] dark:focus:border-[#5BA3D9]"
                />
              </div>
              <div className="sm:col-span-3">
                <label className="block text-xs font-medium text-[#6B7280] mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={data.title}
                  onChange={(e) =>
                    setData({ ...data, title: e.target.value })
                  }
                  placeholder="Stock evaluation title"
                  className="w-full px-3 py-2 bg-white dark:bg-[#1A1A1A] border border-[#E5E0D8] dark:border-[#2D2D2D] rounded-lg text-sm text-[#1A1A1A] dark:text-[#F5F5F4] placeholder-[#9CA3AF] focus:outline-none focus:border-[#0F4C81] dark:focus:border-[#5BA3D9]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#6B7280] mb-1">
                <FiImage className="inline mr-1" size={12} />
                Cover Image URL
              </label>
              <input
                type="url"
                value={data.coverImage}
                onChange={(e) =>
                  setData({ ...data, coverImage: e.target.value })
                }
                placeholder="https://example.com/image.jpg"
                className="w-full px-3 py-2 bg-white dark:bg-[#1A1A1A] border border-[#E5E0D8] dark:border-[#2D2D2D] rounded-lg text-sm text-[#1A1A1A] dark:text-[#F5F5F4] placeholder-[#9CA3AF] focus:outline-none focus:border-[#0F4C81] dark:focus:border-[#5BA3D9]"
              />
              {data.coverImage && (
                <div className="mt-2 rounded-lg overflow-hidden h-32">
                  <img
                    src={data.coverImage}
                    alt="Cover preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-[#6B7280] mb-1">
                Content (Markdown)
              </label>
              <textarea
                value={data.content}
                onChange={(e) =>
                  setData({ ...data, content: e.target.value })
                }
                placeholder="Write your evaluation in Markdown..."
                rows={24}
                className="w-full px-3 py-2 bg-white dark:bg-[#1A1A1A] border border-[#E5E0D8] dark:border-[#2D2D2D] rounded-lg text-sm font-mono text-[#1A1A1A] dark:text-[#F5F5F4] placeholder-[#9CA3AF] focus:outline-none focus:border-[#0F4C81] dark:focus:border-[#5BA3D9] resize-y"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
