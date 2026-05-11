/*
  Warnings:

  - You are about to drop the column `location` on the `Court` table. All the data in the column will be lost.
  - You are about to drop the column `occupancyRate` on the `Court` table. All the data in the column will be lost.
  - You are about to drop the column `surface` on the `Court` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "CoverType" AS ENUM ('Aberta', 'Fechada');

-- AlterTable
ALTER TABLE "Court" DROP COLUMN "location",
DROP COLUMN "occupancyRate",
DROP COLUMN "surface",
ADD COLUMN     "address" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "coverType" "CoverType" NOT NULL DEFAULT 'Aberta',
ADD COLUMN     "maintenanceEnd" TIMESTAMP(3),
ADD COLUMN     "number" TEXT,
ADD COLUMN     "zipCode" TEXT,
ALTER COLUMN "status" SET DEFAULT 'Disponivel';

-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "type" SET DEFAULT 'Avulso',
ALTER COLUMN "status" SET DEFAULT 'Ativo';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "phone" TEXT;

-- DropEnum
DROP TYPE "CourtSurface";

-- CreateTable
CREATE TABLE "ReservationHistory" (
    "id" TEXT NOT NULL,
    "arenaId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "courtId" TEXT NOT NULL,
    "courtName" TEXT NOT NULL,
    "sport" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "status" "ReservationStatus" NOT NULL,
    "notes" TEXT,
    "archivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReservationHistory_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ReservationHistory" ADD CONSTRAINT "ReservationHistory_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
