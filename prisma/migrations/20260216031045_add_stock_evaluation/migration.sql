-- CreateTable
CREATE TABLE "StockEvaluation" (
    "id" TEXT NOT NULL,
    "ticker" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "coverImage" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StockEvaluation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StockEvaluation_slug_key" ON "StockEvaluation"("slug");

-- CreateIndex
CREATE INDEX "StockEvaluation_ticker_idx" ON "StockEvaluation"("ticker");

-- CreateIndex
CREATE INDEX "StockEvaluation_published_createdAt_idx" ON "StockEvaluation"("published", "createdAt");
