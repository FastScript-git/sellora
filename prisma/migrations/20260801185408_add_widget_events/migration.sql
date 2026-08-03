-- CreateEnum
CREATE TYPE "WidgetEventType" AS ENUM ('VIEW', 'OPEN', 'CONVERSATION_STARTED', 'USER_MESSAGE', 'LEAD_CREATED', 'AI_RESPONSE');

-- CreateTable
CREATE TABLE "WidgetEvent" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "channelId" TEXT,
    "type" "WidgetEventType" NOT NULL,
    "visitorId" TEXT,
    "sessionId" TEXT,
    "pageUrl" TEXT,
    "referrer" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WidgetEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WidgetEvent_workspaceId_idx" ON "WidgetEvent"("workspaceId");

-- CreateIndex
CREATE INDEX "WidgetEvent_channelId_idx" ON "WidgetEvent"("channelId");

-- CreateIndex
CREATE INDEX "WidgetEvent_type_idx" ON "WidgetEvent"("type");

-- CreateIndex
CREATE INDEX "WidgetEvent_workspaceId_type_createdAt_idx" ON "WidgetEvent"("workspaceId", "type", "createdAt");

-- CreateIndex
CREATE INDEX "WidgetEvent_channelId_type_createdAt_idx" ON "WidgetEvent"("channelId", "type", "createdAt");

-- CreateIndex
CREATE INDEX "WidgetEvent_visitorId_idx" ON "WidgetEvent"("visitorId");

-- CreateIndex
CREATE INDEX "WidgetEvent_sessionId_idx" ON "WidgetEvent"("sessionId");

-- AddForeignKey
ALTER TABLE "WidgetEvent" ADD CONSTRAINT "WidgetEvent_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WidgetEvent" ADD CONSTRAINT "WidgetEvent_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel"("id") ON DELETE SET NULL ON UPDATE CASCADE;
