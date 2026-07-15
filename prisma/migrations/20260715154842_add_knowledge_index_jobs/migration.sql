-- CreateEnum
CREATE TYPE "KnowledgeIndexJobStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "KnowledgeIndexJob" (
    "id" TEXT NOT NULL,
    "knowledgeSourceId" TEXT NOT NULL,
    "status" "KnowledgeIndexJobStatus" NOT NULL DEFAULT 'PENDING',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KnowledgeIndexJob_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "KnowledgeIndexJob_knowledgeSourceId_idx" ON "KnowledgeIndexJob"("knowledgeSourceId");

-- CreateIndex
CREATE INDEX "KnowledgeIndexJob_status_createdAt_idx" ON "KnowledgeIndexJob"("status", "createdAt");

-- CreateIndex
CREATE INDEX "KnowledgeIndexJob_knowledgeSourceId_status_idx" ON "KnowledgeIndexJob"("knowledgeSourceId", "status");

-- AddForeignKey
ALTER TABLE "KnowledgeIndexJob" ADD CONSTRAINT "KnowledgeIndexJob_knowledgeSourceId_fkey" FOREIGN KEY ("knowledgeSourceId") REFERENCES "KnowledgeSource"("id") ON DELETE CASCADE ON UPDATE CASCADE;
