-- AlterTable
ALTER TABLE "Materna" ADD COLUMN     "carpetaEntregada" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "FichaFomag" (
    "id" SERIAL NOT NULL,
    "maternaId" INTEGER NOT NULL,
    "regional" TEXT,
    "departamento" TEXT,
    "municipio" TEXT,
    "correo" TEXT,
    "grupoEtnico" TEXT,
    "nivelEducativo" TEXT,
    "ocupacion" TEXT,
    "regimen" TEXT,
    "tipoVinculacion" TEXT,
    "fechaUltimaRegla" TIMESTAMP(3),
    "fechaProbableParto" TIMESTAMP(3),
    "fechaIngresoControl" TIMESTAMP(3),
    "antecedentes" TEXT,
    "hierroCantidad" TEXT,
    "hierroFecha" TIMESTAMP(3),
    "acidoFolicoCantidad" TEXT,
    "acidoFolicoFecha" TIMESTAMP(3),
    "calcioCantidad" TEXT,
    "calcioFecha" TIMESTAMP(3),
    "toxoideTetanico" TEXT,
    "tdap" TEXT,
    "influenza" TEXT,
    "covid1Fecha" TIMESTAMP(3),
    "covid2Fecha" TIMESTAMP(3),
    "fechaParto" TIMESTAMP(3),
    "tipoParto" TEXT,
    "estadoRecienNacido" TEXT,
    "pesoRN" DOUBLE PRECISION,
    "tallaRN" DOUBLE PRECISION,
    "apgar" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FichaFomag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ControlPrenatal" (
    "id" SERIAL NOT NULL,
    "maternaId" INTEGER NOT NULL,
    "numeroControl" INTEGER NOT NULL,
    "fecha" TIMESTAMP(3),
    "profesional" TEXT,
    "tensionArterial" TEXT,
    "peso" DOUBLE PRECISION,
    "clasificacionNutricional" TEXT,
    "alturaUterina" DOUBLE PRECISION,
    "frecuenciaCardiacaFetal" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ControlPrenatal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FichaFomag_maternaId_key" ON "FichaFomag"("maternaId");

-- CreateIndex
CREATE UNIQUE INDEX "ControlPrenatal_maternaId_numeroControl_key" ON "ControlPrenatal"("maternaId", "numeroControl");

-- AddForeignKey
ALTER TABLE "FichaFomag" ADD CONSTRAINT "FichaFomag_maternaId_fkey" FOREIGN KEY ("maternaId") REFERENCES "Materna"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ControlPrenatal" ADD CONSTRAINT "ControlPrenatal_maternaId_fkey" FOREIGN KEY ("maternaId") REFERENCES "Materna"("id") ON DELETE CASCADE ON UPDATE CASCADE;
