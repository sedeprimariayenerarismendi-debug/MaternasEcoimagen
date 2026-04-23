-- AlterTable
ALTER TABLE "EventoMedico" ADD COLUMN     "paqueteId" INTEGER,
ADD COLUMN     "plantillaId" INTEGER,
ADD COLUMN     "trimestre" TEXT;

-- AlterTable
ALTER TABLE "PaqueteEventos" ADD COLUMN     "trimestre" TEXT;

-- AlterTable
ALTER TABLE "PlantillaEvento" ADD COLUMN     "trimestre" TEXT;

-- AddForeignKey
ALTER TABLE "EventoMedico" ADD CONSTRAINT "EventoMedico_plantillaId_fkey" FOREIGN KEY ("plantillaId") REFERENCES "PlantillaEvento"("id") ON DELETE SET NULL ON UPDATE CASCADE;
