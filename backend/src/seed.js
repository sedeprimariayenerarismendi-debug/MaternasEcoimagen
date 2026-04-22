require('dotenv').config();
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed...');

  // Crear usuario admin por defecto
  const adminPassword = await bcrypt.hash('Admin1234', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@maternas.com' },
    update: {},
    create: {
      nombre: 'Administrador',
      email: 'admin@maternas.com',
      password: adminPassword,
      rol: 'ADMIN',
      activo: true,
    },
  });

  console.log(`✅ Admin creado: ${admin.email}`);

  // Crear configuración del tema inicial
  const existingTheme = await prisma.themeConfig.findFirst();
  if (!existingTheme) {
    await prisma.themeConfig.create({
      data: {
        primaryColor: '#E91E8C',
        secondaryColor: '#3B82F6',
        accentColor: '#F472B6',
        darkMode: false,
        clinicName: 'Clínica Maternas',
      },
    });
    console.log('✅ Configuración de tema creada');
  }

  console.log('🎉 Seed completado exitosamente!');
  console.log('');
  console.log('📝 Credenciales de acceso:');
  console.log('   Email:    admin@maternas.com');
  console.log('   Password: Admin1234');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
