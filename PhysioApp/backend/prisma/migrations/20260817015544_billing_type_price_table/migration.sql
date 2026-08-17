-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN "billingType" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN "priceTableName" TEXT;
ALTER TABLE "User" ADD COLUMN "priceTableUpdatedAt" DATETIME;
ALTER TABLE "User" ADD COLUMN "priceTableUrl" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Patient" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "birthDate" DATETIME,
    "document" TEXT,
    "address" TEXT,
    "notes" TEXT,
    "weight" REAL,
    "height" REAL,
    "comorbidities" TEXT,
    "preferredLocation" TEXT,
    "billingType" TEXT NOT NULL DEFAULT 'PARTICULAR',
    "insuranceName" TEXT,
    "leadId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Patient_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Patient" ("address", "birthDate", "comorbidities", "createdAt", "document", "email", "height", "id", "leadId", "name", "notes", "phone", "preferredLocation", "updatedAt", "weight") SELECT "address", "birthDate", "comorbidities", "createdAt", "document", "email", "height", "id", "leadId", "name", "notes", "phone", "preferredLocation", "updatedAt", "weight" FROM "Patient";
DROP TABLE "Patient";
ALTER TABLE "new_Patient" RENAME TO "Patient";
CREATE UNIQUE INDEX "Patient_leadId_key" ON "Patient"("leadId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
