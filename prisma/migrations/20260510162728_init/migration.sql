-- CreateEnum
CREATE TYPE "ReservationStatus" AS ENUM ('Confirmado', 'Pendente', 'Cancelado');

-- CreateEnum
CREATE TYPE "CourtStatus" AS ENUM ('Disponivel', 'Ocupada', 'Manutencao');

-- CreateEnum
CREATE TYPE "CourtSurface" AS ENUM ('Coberta', 'Aberta');

-- CreateEnum
CREATE TYPE "CustomerType" AS ENUM ('Mensalista', 'Avulso');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('Administrador', 'Gerente', 'Recepcao');

-- CreateTable
CREATE TABLE "Arena" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "taxId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Arena_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArenaSettings" (
    "id" TEXT NOT NULL,
    "arenaId" TEXT NOT NULL,
    "reservationReminder" BOOLEAN NOT NULL DEFAULT true,
    "paymentConfirmation" BOOLEAN NOT NULL DEFAULT true,
    "cancellationAlert" BOOLEAN NOT NULL DEFAULT true,
    "marketingCampaigns" BOOLEAN NOT NULL DEFAULT false,
    "pix" BOOLEAN NOT NULL DEFAULT true,
    "creditCard" BOOLEAN NOT NULL DEFAULT true,
    "debitCard" BOOLEAN NOT NULL DEFAULT true,
    "cash" BOOLEAN NOT NULL DEFAULT true,
    "bankTransfer" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ArenaSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OperatingHour" (
    "id" TEXT NOT NULL,
    "settingsId" TEXT NOT NULL,
    "day" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL,
    "open" TEXT NOT NULL,
    "close" TEXT NOT NULL,

    CONSTRAINT "OperatingHour_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "arenaId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Court" (
    "id" TEXT NOT NULL,
    "arenaId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sport" TEXT NOT NULL,
    "surface" "CourtSurface" NOT NULL,
    "location" TEXT NOT NULL,
    "pricePerHour" DECIMAL(65,30) NOT NULL,
    "status" "CourtStatus" NOT NULL,
    "occupancyRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "features" TEXT[],

    CONSTRAINT "Court_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL,
    "arenaId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "type" "CustomerType" NOT NULL,
    "status" TEXT NOT NULL,
    "favoriteSport" TEXT,
    "totalSpent" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "reservationsCount" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reservation" (
    "id" TEXT NOT NULL,
    "arenaId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "courtId" TEXT NOT NULL,
    "sport" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "status" "ReservationStatus" NOT NULL,
    "notes" TEXT,

    CONSTRAINT "Reservation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamMember" (
    "id" TEXT NOT NULL,
    "arenaId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "status" TEXT NOT NULL,

    CONSTRAINT "TeamMember_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ArenaSettings_arenaId_key" ON "ArenaSettings"("arenaId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_email_key" ON "Customer"("email");

-- CreateIndex
CREATE UNIQUE INDEX "TeamMember_email_key" ON "TeamMember"("email");

-- AddForeignKey
ALTER TABLE "ArenaSettings" ADD CONSTRAINT "ArenaSettings_arenaId_fkey" FOREIGN KEY ("arenaId") REFERENCES "Arena"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OperatingHour" ADD CONSTRAINT "OperatingHour_settingsId_fkey" FOREIGN KEY ("settingsId") REFERENCES "ArenaSettings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_arenaId_fkey" FOREIGN KEY ("arenaId") REFERENCES "Arena"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Court" ADD CONSTRAINT "Court_arenaId_fkey" FOREIGN KEY ("arenaId") REFERENCES "Arena"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_arenaId_fkey" FOREIGN KEY ("arenaId") REFERENCES "Arena"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_arenaId_fkey" FOREIGN KEY ("arenaId") REFERENCES "Arena"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_courtId_fkey" FOREIGN KEY ("courtId") REFERENCES "Court"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamMember" ADD CONSTRAINT "TeamMember_arenaId_fkey" FOREIGN KEY ("arenaId") REFERENCES "Arena"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
