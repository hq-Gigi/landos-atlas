CREATE TABLE "ExperimentEvent" (
  "id" TEXT PRIMARY KEY,
  "experiment" TEXT NOT NULL,
  "variant" TEXT NOT NULL,
  "eventType" TEXT NOT NULL,
  "userId" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "ExperimentEvent_experiment_variant_eventType_createdAt_idx"
ON "ExperimentEvent"("experiment", "variant", "eventType", "createdAt");
