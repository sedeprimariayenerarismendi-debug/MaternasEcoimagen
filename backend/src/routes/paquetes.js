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

    // Usar transacción para asegurar sincronización consistente
    const result = await prisma.$transaction(async (tx) => {
        // 1. Obtener estado actual
        const currentPaquete = await tx.paqueteEventos.findUnique({
            where: { id: parseInt(id) },
            include: { plantillas: true }
        });

        if (!currentPaquete) throw new Error('Paquete no encontrado');

        // 2. Identificar cambios
        const incomingPlantillaIds = plantillas.filter(p => p.id).map(p => p.id);
        const plantillasToRemove = currentPaquete.plantillas.filter(p => !incomingPlantillaIds.includes(p.id));
        
        // 3. Actualizar info básica del paquete
        const updatedPaquete = await tx.paqueteEventos.update({
            where: { id: parseInt(id) },
            data: { nombre, descripcion, trimestre },
            include: { plantillas: true }
        });

        // 4. Eliminar plantillas removidas y sus eventos PENDIENTES vinculados
        for (const p of plantillasToRemove) {
            await tx.eventoMedico.deleteMany({
                where: { plantillaId: p.id, estado: 'PENDIENTE' }
            });
            await tx.plantillaEvento.delete({ where: { id: p.id } });
        }

        // 5. Procesar cada plantilla (Upsert + Propagación)
        const processedPlantillas = [];
        for (const pMap of plantillas) {
            const pData = {
                tipo: pMap.tipo,
                descripcion: pMap.descripcion,
                semanasRelativas: parseInt(pMap.semanasRelativas) || 0,
                esObligatorio: !!pMap.esObligatorio,
                esControl: !!pMap.esControl,
                codigoCUPS: pMap.codigoCUPS,
                cantidad: parseInt(pMap.cantidad) || 1,
                trimestre: pMap.trimestre || updatedPaquete.trimestre
            };

            if (pMap.id) {
                // ACTUALIZAR plantilla existente
                const updatedP = await tx.plantillaEvento.update({
                    where: { id: pMap.id },
                    data: pData
                });
                processedPlantillas.push(updatedP);

                // PROPAGAR cambios a eventos PENDIENTES
                const eventsToUpdate = await tx.eventoMedico.findMany({
                    where: { plantillaId: pMap.id, estado: 'PENDIENTE' },
                    include: { materna: true }
                });

                for (const ev of eventsToUpdate) {
                    const startDate = new Date(ev.materna.fechaEmbarazo);
                    const fechaProgramada = new Date(startDate);
                    fechaProgramada.setDate(fechaProgramada.getDate() + (pData.semanasRelativas * 7));

                    await tx.eventoMedico.update({
                        where: { id: ev.id },
                        data: {
                            tipo: pData.tipo,
                            descripcion: pData.descripcion,
                            fechaProgramada,
                            esObligatorio: pData.esObligatorio,
                            esControl: pData.esControl,
                            codigoCUPS: pData.codigoCUPS,
                            cantidad: pData.cantidad,
                            trimestre: pData.trimestre
                        }
                    });
                }
            } else {
                // CREAR nueva plantilla y añadirla a maternas que ya tienen el paquete
                const newP = await tx.plantillaEvento.create({
                    data: { ...pData, paqueteId: parseInt(id) }
                });
                processedPlantillas.push(newP);

                const maternasConPaquete = await tx.materna.findMany({
                    where: {
                        eventos: {
                            some: { paqueteId: parseInt(id) }
                        }
                    }
                });

                for (const m of maternasConPaquete) {
                    const startDate = new Date(m.fechaEmbarazo);
                    const fechaProgramada = new Date(startDate);
                    fechaProgramada.setDate(fechaProgramada.getDate() + (pData.semanasRelativas * 7));

                    await tx.eventoMedico.create({
                        data: {
                            ...pData,
                            fechaProgramada,
                            paqueteId: parseInt(id),
                            plantillaId: newP.id,
                            maternaId: m.id,
                            estado: 'PENDIENTE',
                            estaAgendado: false
                        }
                    });
                }
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
