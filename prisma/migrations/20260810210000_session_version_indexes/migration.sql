-- sessionVersion + índices de escopo (idempotente para DBs que já receberam db push)

DO $$ BEGIN
  ALTER TABLE "User" ADD COLUMN "sessionVersion" INTEGER NOT NULL DEFAULT 0;
EXCEPTION
  WHEN duplicate_column THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS "Property_teamId_idx" ON "Property"("teamId");
CREATE INDEX IF NOT EXISTS "Lead_brokerId_idx" ON "Lead"("brokerId");
CREATE INDEX IF NOT EXISTS "Visit_brokerId_idx" ON "Visit"("brokerId");
CREATE INDEX IF NOT EXISTS "Proposal_brokerId_idx" ON "Proposal"("brokerId");
