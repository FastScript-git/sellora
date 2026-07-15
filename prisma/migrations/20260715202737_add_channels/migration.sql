-- CreateEnum
CREATE TYPE "ChannelType" AS ENUM ('WEBSITE', 'TELEGRAM', 'WHATSAPP', 'MESSENGER', 'INSTAGRAM', 'API');

-- CreateTable
CREATE TABLE "Channel" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "type" "ChannelType" NOT NULL,
    "name" TEXT NOT NULL,
    "widgetKey" TEXT,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Channel_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Channel_widgetKey_key" ON "Channel"("widgetKey");

-- CreateIndex
CREATE INDEX "Channel_employeeId_idx" ON "Channel"("employeeId");

-- CreateIndex
CREATE INDEX "Channel_employeeId_type_idx" ON "Channel"("employeeId", "type");

-- AddForeignKey
ALTER TABLE "Channel" ADD CONSTRAINT "Channel_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "AIEmployee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
