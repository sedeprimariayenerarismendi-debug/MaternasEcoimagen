const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/maternas/:id/eventos - obtener eventos de una materna
router.get('/materna/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const eventos = await prisma.eventoMedico.findMany({
      where: { maternaId: parseInt(id) },
      include: { prestadores: true },
      orderBy: { fechaProgramada: 'asc' },
    });
    res.json(eventos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener eventos médicos' });
  }
});

// POST /api/eventos - crear nuevo evento
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { 
      tipo, 
      descripcion, 
      fechaProgramada, 
      esObligatorio, 
      maternaId,
      notas,
      codigoCUPS,
      prestadoresIds,
      esControl,
      resultado
    } = req.body;

    if (!tipo || !descripcion || !fechaProgramada || !maternaId) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    const evento = await prisma.eventoMedico.create({
      data: {
        tipo,
        descripcion,
        fechaProgramada: new Date(fechaProgramada),
        esObligatorio: !!esObligatorio,
        esControl: !!esControl,
        resultado,
        codigoCUPS,
        maternaId: parseInt(maternaId),
        notas,
        estado: 'PENDIENTE',
        estaAgendado: false,
        prestadores: (prestadoresIds && prestadoresIds.length > 0) ? {
          connect: prestadoresIds.map(id => ({ id: parseInt(id) }))
        } : undefined
      },
      include: { prestadores: true }
    });

    res.status(201).json(evento);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear evento médico' });
  }
});

// PATCH /api/eventos/:id - actualizar evento (ej. marcar como realizado)
router.patch('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { estado, fechaRealizada, notas, fechaProgramada, descripcion, codigoCUPS, prestadoresIds, esControl, resultado, estaAgendado, fechaAgendamiento } = req.body;

    const data = {};
    if (estado) data.estado = estado;
    if (fechaRealizada) data.fechaRealizada = new Date(fechaRealizada);
    if (notas !== undefined) data.notas = notas;
    if (fechaProgramada) data.fechaProgramada = new Date(fechaProgramada);
    if (descripcion) data.descripcion = descripcion;
    if (codigoCUPS !== undefined) data.codigoCUPS = codigoCUPS;
    if (esControl !== undefined) data.esControl = !!esControl;
    if (resultado !== undefined) data.resultado = resultado;
    if (estaAgendado !== undefined) data.estaAgendado = !!estaAgendado;
    // fechaAgendamiento puede ser null (para limpiarla) o una fecha válida
    if (fechaAgendamiento !== undefined) {
      data.fechaAgendamiento = fechaAgendamiento ? new Date(fechaAgendamiento) : null;
    }
    if (prestadoresIds) {
      data.prestadores = {
        set: prestadoresIds.map(id => ({ id: parseInt(id) }))
      };
    }

    // Si se marca como REALIZADO y no hay fechaRealizada, poner hoy
    if (estado === 'REALIZADO' && !fechaRealizada) {
      data.fechaRealizada = new Date();
    }

    const evento = await prisma.eventoMedico.update({
      where: { id: parseInt(id) },
      data
    });

    res.json(evento);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar evento médico' });
  }
});

// DELETE /api/eventos/:id - eliminar evento
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.eventoMedico.delete({
      where: { id: parseInt(id) }
    });
    res.json({ message: 'Evento eliminado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar evento' });
  }
});

// POST /api/eventos/materna/:id/generar-basicos - generar set básico de eventos
router.post('/materna/:id/generar-basicos', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const materna = await prisma.materna.findUnique({
      where: { id: parseInt(id) }
    });

    if (!materna) {
      return res.status(404).json({ error: 'Paciente no encontrada' });
    }

    const startDate = new Date(materna.fechaEmbarazo);
    const basicEvents = [];

    // 1. Controles Prenatales (cada 4 semanas hasta la semana 36, luego cada semana)
    // Para simplificar, generaremos 10 controles estándar
    for (let i = 1; i <= 10; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + (i * 28)); // Aprox cada mes
        basicEvents.push({
            tipo: 'CITA',
            descripcion: i === 0 ? 'Primera Vez Control Prenatal' : `Control Prenatal #${i}`,
            fechaProgramada: date,
            esObligatorio: true,
            esControl: i > 0, // La primera vez no suele ser un "re-control"
            maternaId: materna.id,
            estado: 'PENDIENTE',
            estaAgendado: false
        });
    }

    // 2. Ecografías
    const eco1 = new Date(startDate); eco1.setDate(eco1.getDate() + (12 * 7)); // Sem 12
    const eco2 = new Date(startDate); eco2.setDate(eco2.getDate() + (22 * 7)); // Sem 22
    const eco3 = new Date(startDate); eco3.setDate(eco3.getDate() + (32 * 7)); // Sem 32

    basicEvents.push(
        { tipo: 'ESTUDIO', descripcion: 'Ecografía de Tamizaje (Sem 11-14)', fechaProgramada: eco1, esObligatorio: true, maternaId: materna.id, estaAgendado: false },
        { tipo: 'ESTUDIO', descripcion: 'Ecografía Detalle Anatómico (Sem 20-24)', fechaProgramada: eco2, esObligatorio: true, maternaId: materna.id, estaAgendado: false },
        { tipo: 'ESTUDIO', descripcion: 'Ecografía de Crecimiento (Sem 32+)', fechaProgramada: eco3, esObligatorio: true, maternaId: materna.id, estaAgendado: false }
    );

    // 3. Laboratorios
    const lab1 = new Date(startDate); lab1.setDate(lab1.getDate() + 7); // Inmediato
    const lab2 = new Date(startDate); lab2.setDate(lab2.getDate() + (24 * 7)); // Sem 24 (Glucosa)
    const lab3 = new Date(startDate); lab3.setDate(lab3.getDate() + (35 * 7)); // Sem 35

    basicEvents.push(
        { tipo: 'LABORATORIO', descripcion: 'Laboratorios 1er Trimestre', fechaProgramada: lab1, esObligatorio: true, maternaId: materna.id, estado: 'PENDIENTE', estaAgendado: false },
        { tipo: 'LABORATORIO', descripcion: 'Prueba de Tolerancia a la Glucosa', fechaProgramada: lab2, esObligatorio: true, maternaId: materna.id, estado: 'PENDIENTE', estaAgendado: false },
        { tipo: 'LABORATORIO', descripcion: 'Laboratorios 3er Trimestre', fechaProgramada: lab3, esObligatorio: true, maternaId: materna.id, estado: 'PENDIENTE', estaAgendado: false }
    );

    // Crear todos los eventos
    const created = await prisma.eventoMedico.createMany({
        data: basicEvents
    });

    res.json({ message: 'Eventos básicos generados', count: created.count });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al generar eventos básicos' });
  }
});

module.exports = router;
