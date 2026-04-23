-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "rol" TEXT NOT NULL DEFAULT 'ENFERMERA',
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Materna" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "documento" TEXT NOT NULL,
    "tipoDocumento" TEXT NOT NULL,
    "fechaNacimiento" TIMESTAMP(3) NOT NULL,
    "fechaEmbarazo" TIMESTAMP(3) NOT NULL,
    "fechaRegistro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tipoRiesgo" TEXT NOT NULL,
    "alertas" TEXT,
    "telefono" TEXT,
    "direccion" TEXT,
    "contactoEmergencia" TEXT,
    "creadaPorId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Materna_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventoMedico" (
    "id" SERIAL NOT NULL,
    "tipo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "fechaProgramada" TIMESTAMP(3) NOT NULL,
    "fechaRealizada" TIMESTAMP(3),
    "estado" TEXT NOT NULL DEFAULT 'PENDIENTE',
    "esObligatorio" BOOLEAN NOT NULL DEFAULT false,
    "esControl" BOOLEAN NOT NULL DEFAULT false,
    "estaAgendado" BOOLEAN NOT NULL DEFAULT false,
    "resultado" TEXT,
    "codigoCUPS" TEXT,
    "notas" TEXT,
    "cantidad" INTEGER DEFAULT 1,
    "maternaId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventoMedico_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaqueteEventos" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaqueteEventos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlantillaEvento" (
    "id" SERIAL NOT NULL,
    "tipo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "semanasRelativas" INTEGER NOT NULL DEFAULT 0,
    "esObligatorio" BOOLEAN NOT NULL DEFAULT false,
    "esControl" BOOLEAN NOT NULL DEFAULT false,
    "codigoCUPS" TEXT,
    "cantidad" INTEGER NOT NULL DEFAULT 1,
    "paqueteId" INTEGER NOT NULL,

    CONSTRAINT "PlantillaEvento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Prestador" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "nit" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Prestador_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ThemeConfig" (
    "id" SERIAL NOT NULL,
    "primaryColor" TEXT NOT NULL DEFAULT '#E91E8C',
    "secondaryColor" TEXT NOT NULL DEFAULT '#3B82F6',
    "accentColor" TEXT NOT NULL DEFAULT '#F472B6',
    "darkMode" BOOLEAN NOT NULL DEFAULT false,
    "clinicName" TEXT NOT NULL DEFAULT 'Clínica Maternas',
    "logoUrl" TEXT,

    CONSTRAINT "ThemeConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_EventoMedicoToPrestador" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Materna_documento_key" ON "Materna"("documento");

-- CreateIndex
CREATE UNIQUE INDEX "Prestador_nombre_key" ON "Prestador"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "_EventoMedicoToPrestador_AB_unique" ON "_EventoMedicoToPrestador"("A", "B");

-- CreateIndex
CREATE INDEX "_EventoMedicoToPrestador_B_index" ON "_EventoMedicoToPrestador"("B");

-- AddForeignKey
ALTER TABLE "Materna" ADD CONSTRAINT "Materna_creadaPorId_fkey" FOREIGN KEY ("creadaPorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventoMedico" ADD CONSTRAINT "EventoMedico_maternaId_fkey" FOREIGN KEY ("maternaId") REFERENCES "Materna"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlantillaEvento" ADD CONSTRAINT "PlantillaEvento_paqueteId_fkey" FOREIGN KEY ("paqueteId") REFERENCES "PaqueteEventos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EventoMedicoToPrestador" ADD CONSTRAINT "_EventoMedicoToPrestador_A_fkey" FOREIGN KEY ("A") REFERENCES "EventoMedico"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EventoMedicoToPrestador" ADD CONSTRAINT "_EventoMedicoToPrestador_B_fkey" FOREIGN KEY ("B") REFERENCES "Prestador"("id") ON DELETE CASCADE ON UPDATE CASCADE;
