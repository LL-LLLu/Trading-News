"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FiLock, FiTrendingUp } from "react-icons/fi";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        router.push("/admin");
      } else {
        setError("Invalid password");
      }
    } catch {
      setError("Connection error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF7F2] dark:bg-[#111111] px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-[#0F4C81] rounded-sm flex items-center justify-center mx-auto mb-4">
            <FiTrendingUp className="text-white" size={24} />
          </div>
          <h1 className="font-serif text-2xl font-bold text-[#1A1A1A] dark:text-[#F5F5F4]">
            Admin Access
          </h1>
          <p className="text-sm text-[#6B7280] mt-1">
            Enter your password to continue
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" size={16} />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              autoFocus
              className="w-full pl-10 pr-4 py-3 bg-white dark:bg-[#1A1A1A] border border-[#E5E0D8] dark:border-[#2D2D2D] rounded-lg text-sm text-[#1A1A1A] dark:text-[#F5F5F4] placeholder-[#9CA3AF] focus:outline-none focus:border-[#0F4C81] dark:focus:border-[#5BA3D9] transition-colors"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            className="w-full py-3 bg-[#0F4C81] text-white text-sm font-medium rounded-lg hover:bg-[#0D3F6B] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
