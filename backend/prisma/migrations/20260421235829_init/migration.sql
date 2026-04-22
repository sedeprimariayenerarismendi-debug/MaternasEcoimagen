-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "rol" TEXT NOT NULL DEFAULT 'ENFERMERA',
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ThemeConfig" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "primaryColor" TEXT NOT NULL DEFAULT '#E91E8C',
    "secondaryColor" TEXT NOT NULL DEFAULT '#3B82F6',
    "accentColor" TEXT NOT NULL DEFAULT '#F472B6',
    "darkMode" BOOLEAN NOT NULL DEFAULT false,
    "clinicName" TEXT NOT NULL DEFAULT 'Clínica Maternas',
    "logoUrl" TEXT
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
