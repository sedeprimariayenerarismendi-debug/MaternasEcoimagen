# Sistema de Seguimiento de Maternas 🌸

Plataforma integral para clínicas enfocada en el monitoreo y seguimiento de pacientes maternas.

## 🚀 Inicio Rápido (Local)

### Requisitos

- Node.js 20+
- Docker y Docker Compose (opcional)

### Opción 1: Docker (Recomendado)

```bash
docker-compose up --build
```

Accede a:

- Frontend: http://localhost:5173
- Backend: http://localhost:3001

### Opción 2: Manual

1. **Backend**:
   ```bash
   cd backend
   npm install
   npx prisma migrate dev --name init
   node src/seed.js
   npm run dev
   ```
2. **Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## 🔐 Credenciales por Defecto

- **Email**: `admin@maternas.com`
- **Password**: `Admin1234`

## 🎨 Características

- **Login Seguro**: Autenticación basada en JWT.
- **Panel Administrativo**: Gestión completa de usuarios (CRUD).
- **Personalización**: El administrador puede cambiar los colores (Rosa/Azul por defecto) y el nombre de la clínica desde la interfaz.
- **Diseño Premium**: Interfaz moderna con animaciones (Framer Motion) y fuentes optimizadas (Inter).

## ☁️ Despliegue en Railway

1. Crea un nuevo proyecto en [Railway](https://railway.app/).
2. Conecta tu repositorio.
3. Railway detectará automáticamente los subdirectorios.
4. Asegúrate de configurar las variables de entorno en el panel de Railway:
   - `JWT_SECRET`
   - `FRONTEND_URL`
   - `DATABASE_URL` (puedes usar SQLite en un volume o conectar una base de datos PostgreSQL/MySQL cambiando el provider en Prisma).

© 2024 Proyecto Maternas.
# MaternasEcoimagen
