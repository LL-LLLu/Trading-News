"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiLogOut,
  FiEye,
  FiEyeOff,
  FiTrendingUp,
} from "react-icons/fi";

interface Evaluation {
  id: string;
  ticker: string;
  title: string;
  slug: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function AdminDashboard() {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/admin/me")
      .then((r) => r.json())
      .then((data) => {
        if (!data.authenticated) {
          router.push("/admin/login");
        } else {
          setAuthenticated(true);
          loadEvaluations();
        }
      });
  }, [router]);

  function loadEvaluations() {
    fetch("/api/evaluations")
      .then((r) => r.json())
      .then((data) => {
        setEvaluations(data);
        setLoading(false);
      });
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this evaluation?")) return;
    const res = await fetch(`/api/evaluations/${id}`, { method: "DELETE" });
    if (res.ok) loadEvaluations();
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  }

  if (!authenticated) return null;

  return (
    <div className="min-h-screen bg-[#FAF7F2] dark:bg-[#111111]">
      {/* Header */}
      <div className="border-b border-[#E5E0D8] dark:border-[#2D2D2D]">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#0F4C81] rounded-sm flex items-center justify-center">
              <FiTrendingUp className="text-white" size={16} />
            </div>
            <div>
              <h1 className="font-serif text-lg font-bold text-[#1A1A1A] dark:text-[#F5F5F4]">
                Admin Dashboard
              </h1>
              <p className="text-xs text-[#6B7280]">Stock Evaluations</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/admin/evaluations/new"
              className="flex items-center gap-1.5 px-4 py-2 bg-[#0F4C81] text-white text-sm font-medium rounded-lg hover:bg-[#0D3F6B] transition-colors"
            >
              <FiPlus size={14} />
              New Evaluation
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-2 text-sm text-[#6B7280] hover:text-[#1A1A1A] dark:hover:text-[#F5F5F4] border border-[#E5E0D8] dark:border-[#2D2D2D] rounded-lg transition-colors"
            >
              <FiLogOut size={14} />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 py-6">
        {loading ? (
          <p className="text-[#6B7280] text-sm">Loading...</p>
        ) : evaluations.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-[#6B7280] mb-4">No evaluations yet</p>
            <Link
              href="/admin/evaluations/new"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0F4C81] text-white text-sm font-medium rounded-lg hover:bg-[#0D3F6B] transition-colors"
            >
              <FiPlus size={14} />
              Create your first evaluation
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {evaluations.map((ev) => (
              <div
                key={ev.id}
                className="flex items-center justify-between p-4 bg-white dark:bg-[#1A1A1A] border border-[#E5E0D8] dark:border-[#2D2D2D] rounded-lg"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="shrink-0 px-2 py-0.5 bg-[#0F4C81] text-white text-xs font-medium rounded">
                    {ev.ticker}
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-sm font-medium text-[#1A1A1A] dark:text-[#F5F5F4] truncate">
                      {ev.title}
                    </h3>
                    <p className="text-xs text-[#6B7280]">
                      {format(new Date(ev.createdAt), "MMM d, yyyy")}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`flex items-center gap-1 text-xs ${
                      ev.published
                        ? "text-green-600 dark:text-green-400"
                        : "text-[#9CA3AF]"
                    }`}
                  >
                    {ev.published ? (
                      <FiEye size={12} />
                    ) : (
                      <FiEyeOff size={12} />
                    )}
                    {ev.published ? "Published" : "Draft"}
                  </span>

                  <Link
                    href={`/admin/evaluations/${ev.id}`}
                    className="p-1.5 text-[#6B7280] hover:text-[#0F4C81] dark:hover:text-[#5BA3D9] transition-colors"
                  >
                    <FiEdit2 size={14} />
                  </Link>

                  <button
                    onClick={() => handleDelete(ev.id)}
                    className="p-1.5 text-[#6B7280] hover:text-red-600 dark:hover:text-red-400 transition-colors"
                  >
                    <FiTrash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
