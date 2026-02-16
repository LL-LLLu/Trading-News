"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { EvaluationEditor } from "@/components/admin/EvaluationEditor";

export default function NewEvaluationPage() {
  const router = useRouter();

  useEffect(() => {
    fetch("/api/admin/me")
      .then((r) => r.json())
      .then((data) => {
        if (!data.authenticated) router.push("/admin/login");
      });
  }, [router]);

  return <EvaluationEditor />;
}
