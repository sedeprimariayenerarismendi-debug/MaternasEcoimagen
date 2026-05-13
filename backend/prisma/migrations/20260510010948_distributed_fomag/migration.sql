/*
  Warnings:

  - You are about to drop the `ControlPrenatal` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ControlPrenatal" DROP CONSTRAINT "ControlPrenatal_maternaId_fkey";

-- AlterTable
ALTER TABLE "EventoMedico" ADD COLUMN     "alturaUterina" DOUBLE PRECISION,
ADD COLUMN     "clasificacionNutricional" TEXT,
ADD COLUMN     "frecuenciaCardiacaFetal" INTEGER,
ADD COLUMN     "peso" DOUBLE PRECISION,
ADD COLUMN     "tensionArterial" TEXT;

-- DropTable
DROP TABLE "ControlPrenatal";
