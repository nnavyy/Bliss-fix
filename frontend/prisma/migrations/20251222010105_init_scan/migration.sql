/*
  Warnings:

  - You are about to drop the `ScanResult` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "ScanResult";

-- CreateTable
CREATE TABLE "scan" (
    "id" TEXT NOT NULL,
    "patientName" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "result" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "predictions" JSONB NOT NULL,
    "scannedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "doctorId" TEXT NOT NULL,

    CONSTRAINT "scan_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "scan" ADD CONSTRAINT "scan_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Doctor"("doctorId") ON DELETE RESTRICT ON UPDATE CASCADE;
