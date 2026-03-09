-- CreateTable
CREATE TABLE "FeasibilityAssumptionSet" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'Default',
    "payload" JSONB NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FeasibilityAssumptionSet_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "FeasibilityReport" ADD COLUMN "assumptionSetId" TEXT;

-- CreateIndex
CREATE INDEX "FeasibilityAssumptionSet_projectId_active_idx" ON "FeasibilityAssumptionSet"("projectId", "active");

-- AddForeignKey
ALTER TABLE "FeasibilityAssumptionSet" ADD CONSTRAINT "FeasibilityAssumptionSet_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeasibilityReport" ADD CONSTRAINT "FeasibilityReport_assumptionSetId_fkey" FOREIGN KEY ("assumptionSetId") REFERENCES "FeasibilityAssumptionSet"("id") ON DELETE SET NULL ON UPDATE CASCADE;
