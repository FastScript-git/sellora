-- CreateEnum
CREATE TYPE "ContactSentiment" AS ENUM ('POSITIVE', 'NEUTRAL', 'NEGATIVE');

-- CreateEnum
CREATE TYPE "ContactStatus" AS ENUM ('LEAD', 'QUALIFIED', 'CUSTOMER', 'CLOSED');

-- AlterTable
ALTER TABLE "Contact" ADD COLUMN     "lastInteractionAt" TIMESTAMP(3),
ADD COLUMN     "sentiment" "ContactSentiment" NOT NULL DEFAULT 'NEUTRAL',
ADD COLUMN     "status" "ContactStatus" NOT NULL DEFAULT 'LEAD',
ADD COLUMN     "summary" TEXT,
ADD COLUMN     "tags" JSONB;
