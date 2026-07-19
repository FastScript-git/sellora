-- AlterTable
ALTER TABLE "KnowledgeSource" ADD COLUMN     "fileName" TEXT,
ADD COLUMN     "fileSizeBytes" INTEGER,
ADD COLUMN     "mimeType" TEXT,
ADD COLUMN     "storageKey" TEXT;
