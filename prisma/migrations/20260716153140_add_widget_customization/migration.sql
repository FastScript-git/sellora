-- AlterTable
ALTER TABLE "Channel" ADD COLUMN     "widgetGreeting" TEXT,
ADD COLUMN     "widgetPosition" TEXT DEFAULT 'bottom-right',
ADD COLUMN     "widgetPrimaryColor" TEXT DEFAULT '#2563eb',
ADD COLUMN     "widgetTitle" TEXT;
