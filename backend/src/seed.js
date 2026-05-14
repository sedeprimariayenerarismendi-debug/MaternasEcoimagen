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
        clinicName: 'Dulce espera',
      },
    });
    console.log('✅ Configuración de tema creada');
  }

  // Crear paquetes FOMAG
  await seedPaquetesFomag();

  console.log('🎉 Seed completado exitosamente!');
  console.log('📝 Credenciales de acceso: admin@maternas.com / Admin1234');
}

async function seedPaquetesFomag() {
  console.log('📦 Creando paquetes FOMAG...');

  // --- PAQUETE 1: TRIMESTRE 1 ---
  const pt1 = await prisma.paqueteEventos.upsert({
    where: { id: 1 },
    update: { nombre: 'FOMAG Trimestre 1', trimestre: '1er Trimestre' },
    create: {
      id: 1,
      nombre: 'FOMAG Trimestre 1',
      descripcion: 'Controles y paraclínicos iniciales de ingreso al programa.',
      trimestre: '1er Trimestre'
    }
  });

  await prisma.plantillaEvento.deleteMany({ where: { paqueteId: 1 } });
  
  await prisma.plantillaEvento.createMany({
    data: [
      { paqueteId: 1, tipo: 'CONSULTA', descripcion: 'Control Prenatal Ingreso (Médico/Ginecobstetra)', semanasRelativas: 0, esObligatorio: true, esControl: true },
      { paqueteId: 1, tipo: 'CONSULTA', descripcion: 'Control Prenatal (Enfermería)', semanasRelativas: 4, esObligatorio: true, esControl: true },
      { paqueteId: 1, tipo: 'LABORATORIO', descripcion: 'TSH', semanasRelativas: 1, esObligatorio: true, esControl: false },
      { paqueteId: 1, tipo: 'LABORATORIO', descripcion: 'Hemograma I', semanasRelativas: 1, esObligatorio: true, esControl: false },
      { paqueteId: 1, tipo: 'LABORATORIO', descripcion: 'Hemoclasificación', semanasRelativas: 1, esObligatorio: true, esControl: false },
      { paqueteId: 1, tipo: 'LABORATORIO', descripcion: 'VIH (Prueba Rápida I)', semanasRelativas: 1, esObligatorio: true, esControl: false },
      { paqueteId: 1, tipo: 'LABORATORIO', descripcion: 'Sífilis (Prueba Treponémica I)', semanasRelativas: 1, esObligatorio: true, esControl: false },
      { paqueteId: 1, tipo: 'LABORATORIO', descripcion: 'Glicemia', semanasRelativas: 1, esObligatorio: true, esControl: false },
      { paqueteId: 1, tipo: 'LABORATORIO', descripcion: 'Urocultivo I', semanasRelativas: 1, esObligatorio: true, esControl: false },
      { paqueteId: 1, tipo: 'LABORATORIO', descripcion: 'Toxoplasma IgG/IgM', semanasRelativas: 1, esObligatorio: true, esControl: false },
      { paqueteId: 1, tipo: 'LABORATORIO', descripcion: 'Rubeola IgG', semanasRelativas: 1, esObligatorio: false, esControl: false },
      { paqueteId: 1, tipo: 'LABORATORIO', descripcion: 'Chagas', semanasRelativas: 1, esObligatorio: false, esControl: false },
      { paqueteId: 1, tipo: 'LABORATORIO', descripcion: 'HBsAg (Hepatitis B)', semanasRelativas: 1, esObligatorio: true, esControl: false },
      { paqueteId: 1, tipo: 'ESTUDIO', descripcion: 'Ecografía 1er Trimestre (10.6 - 13.6 Sem)', semanasRelativas: 11, esObligatorio: true, esControl: false },
    ]
  });

  // --- PAQUETE 2: TRIMESTRE 2 ---
  const pt2 = await prisma.paqueteEventos.upsert({
    where: { id: 2 },
    update: { nombre: 'FOMAG Trimestre 2', trimestre: '2do Trimestre' },
    create: {
      id: 2,
      nombre: 'FOMAG Trimestre 2',
      descripcion: 'Seguimiento especializado mitad del embarazo.',
      trimestre: '2do Trimestre'
    }
  });

  await prisma.plantillaEvento.deleteMany({ where: { paqueteId: 2 } });

  await prisma.plantillaEvento.createMany({
    data: [
      { paqueteId: 2, tipo: 'CONSULTA', descripcion: 'Control Prenatal (Semana 16)', semanasRelativas: 16, esObligatorio: true, esControl: true },
      { paqueteId: 2, tipo: 'CONSULTA', descripcion: 'Control Prenatal (Semana 20)', semanasRelativas: 20, esObligatorio: true, esControl: true },
      { paqueteId: 2, tipo: 'CONSULTA', descripcion: 'Control Prenatal (Semana 24)', semanasRelativas: 24, esObligatorio: true, esControl: true },
      { paqueteId: 2, tipo: 'CONSULTA', descripcion: 'Control Prenatal (Semana 26)', semanasRelativas: 26, esObligatorio: true, esControl: true },
      { paqueteId: 2, tipo: 'ESTUDIO', descripcion: 'Ecografía Detalle Anatómico (18-23 Sem)', semanasRelativas: 20, esObligatorio: true, esControl: false },
      { paqueteId: 2, tipo: 'LABORATORIO', descripcion: 'Hemograma II', semanasRelativas: 24, esObligatorio: true, esControl: false },
      { paqueteId: 2, tipo: 'LABORATORIO', descripcion: 'PTOG (Glucosa 24-28 Sem)', semanasRelativas: 24, esObligatorio: true, esControl: false },
      { paqueteId: 2, tipo: 'LABORATORIO', descripcion: 'VIH (Prueba Rápida II)', semanasRelativas: 24, esObligatorio: true, esControl: false },
      { paqueteId: 2, tipo: 'LABORATORIO', descripcion: 'Sífilis (Prueba Treponémica II)', semanasRelativas: 24, esObligatorio: true, esControl: false },
      { paqueteId: 2, tipo: 'LABORATORIO', descripcion: 'Tamizaje CCU (Citología)', semanasRelativas: 16, esObligatorio: false, esControl: false },
    ]
  });

  // --- PAQUETE 3: TRIMESTRE 3 ---
  const pt3 = await prisma.paqueteEventos.upsert({
    where: { id: 3 },
    update: { nombre: 'FOMAG Trimestre 3', trimestre: '3er Trimestre' },
    create: {
      id: 3,
      nombre: 'FOMAG Trimestre 3',
      descripcion: 'Preparación para el parto y exámenes finales.',
      trimestre: '3er Trimestre'
    }
  });

  await prisma.plantillaEvento.deleteMany({ where: { paqueteId: 3 } });

  await prisma.plantillaEvento.createMany({
    data: [
      { paqueteId: 3, tipo: 'CONSULTA', descripcion: 'Control Prenatal (Semana 28)', semanasRelativas: 28, esObligatorio: true, esControl: true },
      { paqueteId: 3, tipo: 'CONSULTA', descripcion: 'Control Prenatal (Semana 32)', semanasRelativas: 32, esObligatorio: true, esControl: true },
      { paqueteId: 3, tipo: 'CONSULTA', descripcion: 'Control Prenatal (Semana 36)', semanasRelativas: 36, esObligatorio: true, esControl: true },
      { paqueteId: 3, tipo: 'CONSULTA', descripcion: 'Control Prenatal (Semana 38)', semanasRelativas: 38, esObligatorio: true, esControl: true },
      { paqueteId: 3, tipo: 'CONSULTA', descripcion: 'Control Prenatal (Semana 40)', semanasRelativas: 40, esObligatorio: true, esControl: true },
      { paqueteId: 3, tipo: 'LABORATORIO', descripcion: 'Hemograma Semana 28', semanasRelativas: 28, esObligatorio: true, esControl: false },
      { paqueteId: 3, tipo: 'LABORATORIO', descripcion: 'VIH (Prueba Rápida III)', semanasRelativas: 32, esObligatorio: true, esControl: false },
      { paqueteId: 3, tipo: 'LABORATORIO', descripcion: 'Sífilis (Prueba Treponémica III)', semanasRelativas: 32, esObligatorio: true, esControl: false },
      { paqueteId: 3, tipo: 'LABORATORIO', descripcion: 'Estreptococo B (35-37 Sem)', semanasRelativas: 36, esObligatorio: true, esControl: false },
      { paqueteId: 3, tipo: 'ESTUDIO', descripcion: 'Ecografía Obstétrica Crecimiento', semanasRelativas: 32, esObligatorio: true, esControl: false },
      { paqueteId: 3, tipo: 'VACUNA', descripcion: 'Toxoide Tetánico / Tdap', semanasRelativas: 28, esObligatorio: true, esControl: false },
      { paqueteId: 3, tipo: 'CONSULTA', descripcion: 'Cursos Preparación Maternidad/Paternidad', semanasRelativas: 28, esObligatorio: false, esControl: false },
    ]
  });

  console.log('✅ Paquetes y plantillas creados.');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
