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

// UPDATE /api/paquetes/:id - Editar paquete (SIN propagación automática a maternas)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, plantillas, trimestre } = req.body;

    if (!nombre) {
      return res.status(400).json({ error: 'El nombre es obligatorio' });
    }

    const result = await prisma.$transaction(async (tx) => {
        const currentPaquete = await tx.paqueteEventos.findUnique({
            where: { id: parseInt(id) },
            include: { plantillas: true }
        });
        if (!currentPaquete) throw new Error('Paquete no encontrado');

        // Identificar plantillas eliminadas (cast a int para evitar string vs number mismatch)
        const incomingPlantillaIds = plantillas.filter(p => p.id).map(p => parseInt(p.id));
        const plantillasToRemove = currentPaquete.plantillas.filter(p => !incomingPlantillaIds.includes(p.id));

        // Actualizar info básica del paquete
        const updatedPaquete = await tx.paqueteEventos.update({
            where: { id: parseInt(id) },
            data: { nombre, descripcion, trimestre },
        });

        // Eliminar solo las plantillas removidas (NO tocar eventos de maternas)
        for (const p of plantillasToRemove) {
            await tx.plantillaEvento.delete({ where: { id: p.id } });
        }

        // Upsert plantillas (solo en la tabla de plantillas, sin propagar a maternas)
        const processedPlantillas = [];
        for (const pMap of plantillas) {
            const pData = {
                tipo: pMap.tipo,
                descripcion: pMap.descripcion || '',
                semanasRelativas: parseInt(pMap.semanasRelativas) || 0,
                esObligatorio: !!pMap.esObligatorio,
                esControl: !!pMap.esControl,
                codigoCUPS: pMap.codigoCUPS || null,
                cantidad: parseInt(pMap.cantidad) || 1,
                trimestre: pMap.trimestre || trimestre || null
            };

            if (pMap.id) {
                const updatedP = await tx.plantillaEvento.update({
                    where: { id: pMap.id },
                    data: pData
                });
                processedPlantillas.push(updatedP);
            } else {
                const newP = await tx.plantillaEvento.create({
                    data: { ...pData, paqueteId: parseInt(id) }
                });
                processedPlantillas.push(newP);
            }
        }

        return { ...updatedPaquete, plantillas: processedPlantillas };
    });

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar paquete' });
  }
});

// GET /api/paquetes/check-sync/:maternaId
// Devuelve los IDs de paquetes que necesitan sincronización para esta materna
router.get('/check-sync/:maternaId', authMiddleware, async (req, res) => {
  try {
    const { maternaId } = req.params;
    const mid = parseInt(maternaId);

    // Obtener todos los eventos de la materna que pertenecen a algún paquete
    const eventos = await prisma.eventoMedico.findMany({
      where: { maternaId: mid, paqueteId: { not: null } },
      select: { paqueteId: true, createdAt: true }
    });

    if (eventos.length === 0) return res.json({ desactualizados: [] });

    // Agrupar: para cada paquete, obtener el createdAt más reciente de sus eventos en esta materna
    const mapaFechas = {};
    eventos.forEach(ev => {
      const pid = ev.paqueteId;
      if (!mapaFechas[pid] || ev.createdAt > mapaFechas[pid]) {
        mapaFechas[pid] = ev.createdAt;
      }
    });

    // Obtener los paquetes involucrados con su updatedAt
    const paqueteIds = Object.keys(mapaFechas).map(Number);
    const paquetes = await prisma.paqueteEventos.findMany({
      where: { id: { in: paqueteIds } },
      select: { id: true, updatedAt: true }
    });

    // Comparar: si paquete.updatedAt > createdAt más reciente de eventos → desactualizado
    const desactualizados = paquetes
      .filter(pq => new Date(pq.updatedAt) > new Date(mapaFechas[pq.id]))
      .map(pq => pq.id);

    res.json({ desactualizados });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al verificar sincronización' });
  }
});

// POST /api/paquetes/:paqueteId/sincronizar-materna/:maternaId
// Aplica el estado actual del paquete a UNA materna (reemplaza eventos PENDIENTES del paquete)
router.post('/:paqueteId/sincronizar-materna/:maternaId', authMiddleware, async (req, res) => {
  try {
    const { paqueteId, maternaId } = req.params;

    const materna = await prisma.materna.findUnique({ where: { id: parseInt(maternaId) } });
    const paquete = await prisma.paqueteEventos.findUnique({
      where: { id: parseInt(paqueteId) },
      include: { plantillas: true }
    });

    if (!materna || !paquete) {
      return res.status(404).json({ error: 'Paciente o paquete no encontrado' });
    }

    const startDate = new Date(materna.fechaEmbarazo);

    await prisma.$transaction(async (tx) => {
      // 1. Eliminar eventos PENDIENTES de ese paquete para esa materna
      await tx.eventoMedico.deleteMany({
        where: {
          maternaId: parseInt(maternaId),
          paqueteId: parseInt(paqueteId),
          estado: 'PENDIENTE'
        }
      });

      // 2. Recrear desde las plantillas actuales del paquete
      const eventosParaCrear = paquete.plantillas.map(p => {
        const fechaProgramada = new Date(startDate);
        fechaProgramada.setDate(fechaProgramada.getDate() + (p.semanasRelativas * 7));
        return {
          tipo: p.tipo,
          descripcion: p.descripcion || '',
          fechaProgramada,
          esObligatorio: !!p.esObligatorio,
          esControl: !!p.esControl,
          codigoCUPS: p.codigoCUPS || null,
          cantidad: p.cantidad || 1,
          trimestre: p.trimestre || paquete.trimestre || null,
          paqueteId: paquete.id,
          plantillaId: p.id,
          maternaId: materna.id,
          estado: 'PENDIENTE',
          estaAgendado: false
          // semanasRelativas NO se incluye: pertenece a PlantillaEvento, no a EventoMedico
        };
      });

      await tx.eventoMedico.createMany({ data: eventosParaCrear });
    });

    res.json({ message: 'Paquete sincronizado correctamente', paquete: paquete.nombre });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al sincronizar paquete' });
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
        paqueteId: paquete.id,
        plantillaId: p.id,
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
