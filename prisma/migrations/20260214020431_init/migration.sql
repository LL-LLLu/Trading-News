-- CreateEnum
CREATE TYPE "Importance" AS ENUM ('HIGH', 'MEDIUM', 'LOW');

-- CreateEnum
CREATE TYPE "Category" AS ENUM ('EMPLOYMENT', 'INFLATION', 'GDP', 'MANUFACTURING', 'HOUSING', 'CONSUMER', 'TRADE', 'MONETARY_POLICY', 'GOVERNMENT', 'ENERGY', 'OTHER');

-- CreateEnum
CREATE TYPE "ImpactDirection" AS ENUM ('BULLISH', 'BEARISH', 'NEUTRAL');

-- CreateTable
CREATE TABLE "EconomicEvent" (
    "id" TEXT NOT NULL,
    "eventName" TEXT NOT NULL,
    "eventSlug" TEXT NOT NULL,
    "dateTime" TIMESTAMP(3) NOT NULL,
    "period" TEXT,
    "actual" TEXT,
    "forecast" TEXT,
    "previous" TEXT,
    "unit" TEXT,
    "importance" "Importance" NOT NULL DEFAULT 'MEDIUM',
    "category" "Category" NOT NULL DEFAULT 'OTHER',
    "sourceUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EconomicEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventAnalysis" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "impactScore" INTEGER NOT NULL,
    "impactDirection" "ImpactDirection" NOT NULL,
    "summary" TEXT NOT NULL,
    "detailedAnalysis" TEXT NOT NULL,
    "affectedSectors" JSONB NOT NULL,
    "affectedAssets" JSONB NOT NULL,
    "tradingImplications" JSONB NOT NULL,
    "historicalContext" TEXT NOT NULL,
    "riskFactors" JSONB NOT NULL,
    "keyLevelsToWatch" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeeklyOutlook" (
    "id" TEXT NOT NULL,
    "weekStart" TIMESTAMP(3) NOT NULL,
    "weekEnd" TIMESTAMP(3) NOT NULL,
    "overallSentiment" "ImpactDirection" NOT NULL,
    "executiveSummary" TEXT NOT NULL,
    "keyEvents" JSONB NOT NULL,
    "themeAnalysis" JSONB NOT NULL,
    "riskAssessment" JSONB NOT NULL,
    "sectorRotation" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WeeklyOutlook_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatMessage" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EconomicEvent_dateTime_idx" ON "EconomicEvent"("dateTime");

-- CreateIndex
CREATE INDEX "EconomicEvent_importance_idx" ON "EconomicEvent"("importance");

-- CreateIndex
CREATE INDEX "EconomicEvent_category_idx" ON "EconomicEvent"("category");

-- CreateIndex
CREATE UNIQUE INDEX "EconomicEvent_eventSlug_dateTime_key" ON "EconomicEvent"("eventSlug", "dateTime");

-- CreateIndex
CREATE UNIQUE INDEX "EventAnalysis_eventId_key" ON "EventAnalysis"("eventId");

-- CreateIndex
CREATE UNIQUE INDEX "WeeklyOutlook_weekStart_key" ON "WeeklyOutlook"("weekStart");

-- CreateIndex
CREATE INDEX "ChatMessage_sessionId_idx" ON "ChatMessage"("sessionId");

-- AddForeignKey
ALTER TABLE "EventAnalysis" ADD CONSTRAINT "EventAnalysis_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "EconomicEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
