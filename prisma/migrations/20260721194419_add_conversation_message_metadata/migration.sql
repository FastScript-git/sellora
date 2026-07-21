/*
  Warnings:

  - A unique constraint covering the columns `[storageKey]` on the table `KnowledgeSource` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "ConversationMessage" ADD COLUMN     "metadata" JSONB;

-- CreateIndex
CREATE UNIQUE INDEX "KnowledgeSource_storageKey_key" ON "KnowledgeSource"("storageKey");
