-- CreateTable
CREATE TABLE "Materna" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "documento" TEXT NOT NULL,
    "tipoDocumento" TEXT NOT NULL,
    "fechaNacimiento" DATETIME NOT NULL,
    "fechaEmbarazo" DATETIME NOT NULL,
    "fechaRegistro" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tipoRiesgo" TEXT NOT NULL,
    "creadaPorId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Materna_creadaPorId_fkey" FOREIGN KEY ("creadaPorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Materna_documento_key" ON "Materna"("documento");
