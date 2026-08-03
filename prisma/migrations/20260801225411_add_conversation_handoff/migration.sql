-- CreateEnum
CREATE TYPE "ConversationMode" AS ENUM ('AI', 'HUMAN');

-- AlterTable
ALTER TABLE "Conversation" ADD COLUMN     "assignedMemberId" TEXT,
ADD COLUMN     "mode" "ConversationMode" NOT NULL DEFAULT 'AI';

-- CreateIndex
CREATE INDEX "Conversation_assignedMemberId_idx" ON "Conversation"("assignedMemberId");

-- CreateIndex
CREATE INDEX "Conversation_mode_idx" ON "Conversation"("mode");

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_assignedMemberId_fkey" FOREIGN KEY ("assignedMemberId") REFERENCES "WorkspaceMember"("id") ON DELETE SET NULL ON UPDATE CASCADE;
