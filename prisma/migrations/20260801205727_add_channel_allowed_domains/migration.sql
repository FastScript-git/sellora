-- AlterTable
ALTER TABLE "Channel" ADD COLUMN     "allowedDomains" TEXT[] DEFAULT ARRAY[]::TEXT[];
