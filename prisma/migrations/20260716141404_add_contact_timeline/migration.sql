-- CreateEnum
CREATE TYPE "ContactTimelineEventType" AS ENUM ('CONTACT_CREATED', 'CONVERSATION_STARTED', 'USER_MESSAGE', 'AI_MESSAGE', 'AI_SUMMARY_UPDATED', 'SENTIMENT_CHANGED', 'LEAD_SCORE_CHANGED', 'TAGS_UPDATED', 'STATUS_CHANGED');

-- CreateTable
CREATE TABLE "ContactTimelineEvent" (
    "id" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "type" "ContactTimelineEventType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContactTimelineEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ContactTimelineEvent_contactId_createdAt_idx" ON "ContactTimelineEvent"("contactId", "createdAt");

-- AddForeignKey
ALTER TABLE "ContactTimelineEvent" ADD CONSTRAINT "ContactTimelineEvent_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;
