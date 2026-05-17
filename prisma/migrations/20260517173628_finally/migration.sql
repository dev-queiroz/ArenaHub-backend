/*
  Warnings:

  - The values [Disponivel,Ocupada,Manutencao] on the enum `CourtStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [Aberta,Fechada] on the enum `CoverType` will be removed. If these variants are still used in the database, this will fail.
  - The values [Mensalista,Avulso] on the enum `CustomerType` will be removed. If these variants are still used in the database, this will fail.
  - The values [Iniciante,Intermediario,Avancado] on the enum `PlayerLevel` will be removed. If these variants are still used in the database, this will fail.
  - The values [Confirmado,Pendente,Cancelado] on the enum `ReservationStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [Administrador,Gerente,Recepcao] on the enum `UserRole` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "CourtStatus_new" AS ENUM ('Available', 'Occupied', 'Maintenance');
ALTER TABLE "public"."Court" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Court" ALTER COLUMN "status" TYPE "CourtStatus_new" USING ("status"::text::"CourtStatus_new");
ALTER TYPE "CourtStatus" RENAME TO "CourtStatus_old";
ALTER TYPE "CourtStatus_new" RENAME TO "CourtStatus";
DROP TYPE "public"."CourtStatus_old";
ALTER TABLE "Court" ALTER COLUMN "status" SET DEFAULT 'Available';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "CoverType_new" AS ENUM ('Open', 'Closed');
ALTER TABLE "public"."Court" ALTER COLUMN "coverType" DROP DEFAULT;
ALTER TABLE "Court" ALTER COLUMN "coverType" TYPE "CoverType_new" USING ("coverType"::text::"CoverType_new");
ALTER TYPE "CoverType" RENAME TO "CoverType_old";
ALTER TYPE "CoverType_new" RENAME TO "CoverType";
DROP TYPE "public"."CoverType_old";
ALTER TABLE "Court" ALTER COLUMN "coverType" SET DEFAULT 'Open';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "CustomerType_new" AS ENUM ('Monthly', 'Casual');
ALTER TABLE "public"."Customer" ALTER COLUMN "type" DROP DEFAULT;
ALTER TABLE "Customer" ALTER COLUMN "type" TYPE "CustomerType_new" USING ("type"::text::"CustomerType_new");
ALTER TYPE "CustomerType" RENAME TO "CustomerType_old";
ALTER TYPE "CustomerType_new" RENAME TO "CustomerType";
DROP TYPE "public"."CustomerType_old";
ALTER TABLE "Customer" ALTER COLUMN "type" SET DEFAULT 'Casual';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "PlayerLevel_new" AS ENUM ('Beginner', 'Intermediate', 'Advanced', 'Pro');
ALTER TABLE "public"."Customer" ALTER COLUMN "level" DROP DEFAULT;
ALTER TABLE "Customer" ALTER COLUMN "level" TYPE "PlayerLevel_new" USING ("level"::text::"PlayerLevel_new");
ALTER TYPE "PlayerLevel" RENAME TO "PlayerLevel_old";
ALTER TYPE "PlayerLevel_new" RENAME TO "PlayerLevel";
DROP TYPE "public"."PlayerLevel_old";
ALTER TABLE "Customer" ALTER COLUMN "level" SET DEFAULT 'Beginner';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "ReservationStatus_new" AS ENUM ('Confirmed', 'Pending', 'Cancelled');
ALTER TABLE "Reservation" ALTER COLUMN "status" TYPE "ReservationStatus_new" USING ("status"::text::"ReservationStatus_new");
ALTER TABLE "ReservationHistory" ALTER COLUMN "status" TYPE "ReservationStatus_new" USING ("status"::text::"ReservationStatus_new");
ALTER TYPE "ReservationStatus" RENAME TO "ReservationStatus_old";
ALTER TYPE "ReservationStatus_new" RENAME TO "ReservationStatus";
DROP TYPE "public"."ReservationStatus_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "UserRole_new" AS ENUM ('Administrator', 'Manager', 'Reception');
ALTER TABLE "User" ALTER COLUMN "role" TYPE "UserRole_new" USING ("role"::text::"UserRole_new");
ALTER TABLE "TeamMember" ALTER COLUMN "role" TYPE "UserRole_new" USING ("role"::text::"UserRole_new");
ALTER TYPE "UserRole" RENAME TO "UserRole_old";
ALTER TYPE "UserRole_new" RENAME TO "UserRole";
DROP TYPE "public"."UserRole_old";
COMMIT;

-- AlterTable
ALTER TABLE "Court" ALTER COLUMN "status" SET DEFAULT 'Available',
ALTER COLUMN "coverType" SET DEFAULT 'Open';

-- AlterTable
ALTER TABLE "Customer" ALTER COLUMN "type" SET DEFAULT 'Casual',
ALTER COLUMN "status" SET DEFAULT 'Active',
ALTER COLUMN "level" SET DEFAULT 'Beginner';
