CREATE TYPE "KnowledgeSourceStatus" AS ENUM (
  'PENDING',
  'INDEXING',
  'INDEXED',
  'FAILED'
);

ALTER TABLE "KnowledgeSource"
ALTER COLUMN "status" DROP DEFAULT;

ALTER TABLE "KnowledgeSource"
ALTER COLUMN "status" TYPE "KnowledgeSourceStatus"
USING (
  CASE
    WHEN "status" IN ('PENDING', 'INDEXING', 'INDEXED', 'FAILED')
      THEN "status"::text::"KnowledgeSourceStatus"
    ELSE 'PENDING'::"KnowledgeSourceStatus"
  END
);

ALTER TABLE "KnowledgeSource"
ALTER COLUMN "status"
SET DEFAULT 'PENDING'::"KnowledgeSourceStatus";