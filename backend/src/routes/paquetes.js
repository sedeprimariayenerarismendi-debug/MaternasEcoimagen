const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/paquetes - Listar todos los paquetes
router.get('/', authMiddleware, async (req, res) => {
  try {
    const paquetes = await prisma.paqueteEventos.findMany({
      include: { plantillas: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(paquetes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener paquetes' });
  }
});

// POST /api/paquetes - Crear nuevo paquete
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { nombre, descripcion, plantillas, trimestre } = req.body;

    if (!nombre) {
      return res.status(400).json({ error: 'El nombre es obligatorio' });
    }

    const paquete = await prisma.paqueteEventos.create({
      data: {
        nombre,
        descripcion,
        trimestre,
        plantillas: {
          create: plantillas.map(p => ({
            tipo: p.tipo,
            descripcion: p.descripcion,
            semanasRelativas: parseInt(p.semanasRelativas) || 0,
            esObligatorio: !!p.esObligatorio,
            esControl: !!p.esControl,
            codigoCUPS: p.codigoCUPS,
            cantidad: parseInt(p.cantidad) || 1,
            trimestre: p.trimestre
          }))
        }
      },
      include: { plantillas: true }
    });

    res.status(201).json(paquete);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear paquete' });
  }
});

// UPDATE /api/paquetes/:id - Editar paquete
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, plantillas, trimestre } = req.body;

    if (!nombre) {
      return res.status(400).json({ error: 'El nombre es obligatorio' });
    }

    // Usar transacción para asegurar que la eliminación y creación de plantillas sea atómica
    const paquete = await prisma.$transaction(async (tx) => {
        // Eliminar plantillas existentes
        await tx.plantillaEvento.deleteMany({
            where: { paqueteId: parseInt(id) }
        });

        // Actualizar paquete y crear nuevas plantillas
        return await tx.paqueteEventos.update({
            where: { id: parseInt(id) },
            data: {
                nombre,
                descripcion,
                trimestre,
                plantillas: {
                    create: plantillas.map(p => ({
                        tipo: p.tipo,
                        descripcion: p.descripcion,
                        semanasRelativas: parseInt(p.semanasRelativas) || 0,
                        esObligatorio: !!p.esObligatorio,
                        esControl: !!p.esControl,
                        codigoCUPS: p.codigoCUPS,
                        cantidad: parseInt(p.cantidad) || 1,
                        trimestre: p.trimestre
                    }))
                }
            },
            include: { plantillas: true }
        });
    });

    res.json(paquete);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar paquete' });
  }
});

// DELETE /api/paquetes/:id - Eliminar paquete
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.paqueteEventos.delete({
      where: { id: parseInt(id) }
    });
    res.json({ message: 'Paquete eliminado correctamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar paquete' });
  }
});

// POST /api/maternas/:id/aplicar-paquete/:paqueteId - Aplicar paquete a paciente
router.post('/aplicar/:paqueteId/materna/:maternaId', authMiddleware, async (req, res) => {
  try {
    const { maternaId, paqueteId } = req.params;

    const materna = await prisma.materna.findUnique({ where: { id: parseInt(maternaId) } });
    const paquete = await prisma.paqueteEventos.findUnique({
      where: { id: parseInt(paqueteId) },
      include: { plantillas: true }
    });

    if (!materna || !paquete) {
      return res.status(404).json({ error: 'Paciente o paquete no encontrado' });
    }

    const startDate = new Date(materna.fechaEmbarazo);
    const eventosParaCrear = paquete.plantillas.map(p => {
      const fechaProgramada = new Date(startDate);
      fechaProgramada.setDate(fechaProgramada.getDate() + (p.semanasRelativas * 7));
      
      return {
        tipo: p.tipo,
        descripcion: p.descripcion,
        fechaProgramada,
        esObligatorio: !!p.esObligatorio,
        esControl: !!p.esControl,
        codigoCUPS: p.codigoCUPS,
        cantidad: p.cantidad || 1,
        trimestre: p.trimestre || paquete.trimestre,
        maternaId: materna.id,
        estado: 'PENDIENTE',
        estaAgendado: false
      };
    });

    const created = await prisma.eventoMedico.createMany({
      data: eventosParaCrear
    });

    res.json({ message: 'Paquete aplicado correctamente', count: created.count });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al aplicar paquete' });
  }
});

module.exports = router;
