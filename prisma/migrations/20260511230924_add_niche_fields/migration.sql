-- CreateEnum
CREATE TYPE "PlayerLevel" AS ENUM ('Iniciante', 'Intermediario', 'Avancado', 'Pro');

-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "level" "PlayerLevel" DEFAULT 'Iniciante';

-- AlterTable
ALTER TABLE "Reservation" ADD COLUMN     "isOpen" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "ConsumptionItem" (
    "id" TEXT NOT NULL,
    "reservationId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price" DECIMAL(65,30) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConsumptionItem_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ConsumptionItem" ADD CONSTRAINT "ConsumptionItem_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "Reservation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
