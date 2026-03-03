-- Add template provenance fields to Case
ALTER TABLE "Case" ADD COLUMN "appliedTemplateIdsJson" TEXT NOT NULL DEFAULT '[]';
ALTER TABLE "Case" ADD COLUMN "appliedTemplateSnapshotJson" TEXT NOT NULL DEFAULT '[]';
ALTER TABLE "Case" ADD COLUMN "appliedTemplateValuesJson" TEXT NOT NULL DEFAULT '{}';

-- Add template semantic version tracking
ALTER TABLE "Template" ADD COLUMN "version" TEXT NOT NULL DEFAULT '1.0';

-- Normalize legacy uppercase status values
UPDATE "Case" SET "status" = 'Draft' WHERE "status" = 'DRAFT';
