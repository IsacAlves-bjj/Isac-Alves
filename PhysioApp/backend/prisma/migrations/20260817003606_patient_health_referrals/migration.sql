-- AlterTable
ALTER TABLE "Patient" ADD COLUMN "comorbidities" TEXT;
ALTER TABLE "Patient" ADD COLUMN "height" REAL;
ALTER TABLE "Patient" ADD COLUMN "preferredLocation" TEXT;
ALTER TABLE "Patient" ADD COLUMN "weight" REAL;

-- CreateTable
CREATE TABLE "Referral" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "patientId" TEXT NOT NULL,
    "specialty" TEXT NOT NULL,
    "reason" TEXT,
    "status" TEXT NOT NULL DEFAULT 'SOLICITADO',
    "requestedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    CONSTRAINT "Referral_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
