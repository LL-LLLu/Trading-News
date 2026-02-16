import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { EvaluationDetail } from "./EvaluationDetail";

export default async function EvaluationDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const evaluation = await prisma.stockEvaluation.findUnique({
    where: { slug },
  });

  if (!evaluation || !evaluation.published) {
    notFound();
  }

  return (
    <EvaluationDetail
      evaluation={{
        ...evaluation,
        createdAt: evaluation.createdAt.toISOString(),
        updatedAt: evaluation.updatedAt.toISOString(),
      }}
    />
  );
}
