-- CreateEnum
CREATE TYPE "AIEmployeeToolKey" AS ENUM ('KNOWLEDGE_SEARCH', 'LEAD_COLLECTION', 'CONTACT_CREATION', 'HUMAN_HANDOFF', 'WEB_SEARCH', 'EMAIL', 'CALENDAR', 'CRM', 'CUSTOM_API');

-- CreateTable
CREATE TABLE "AIEmployeeTool" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "key" "AIEmployeeToolKey" NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT false,
    "configuration" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AIEmployeeTool_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AIEmployeeTool_employeeId_idx" ON "AIEmployeeTool"("employeeId");

-- CreateIndex
CREATE INDEX "AIEmployeeTool_employeeId_isEnabled_idx" ON "AIEmployeeTool"("employeeId", "isEnabled");

-- CreateIndex
CREATE UNIQUE INDEX "AIEmployeeTool_employeeId_key_key" ON "AIEmployeeTool"("employeeId", "key");

-- AddForeignKey
ALTER TABLE "AIEmployeeTool" ADD CONSTRAINT "AIEmployeeTool_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "AIEmployee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
