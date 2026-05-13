const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/maternas - listar todas las maternas
router.get('/', authMiddleware, async (req, res) => {
  try {
    const maternas = await prisma.materna.findMany({
      include: {
        creadaPor: {
          select: { nombre: true }
        },
        eventos: {
          where: { estado: 'PENDIENTE' },
          select: {
            id: true,
            tipo: true,
            descripcion: true,
            fechaProgramada: true,
            estado: true,
            estaAgendado: true,
            fechaAgendamiento: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    });
    
    const allEventsForPackages = await prisma.eventoMedico.findMany({
       where: { maternaId: { in: maternas.map(m => m.id) } },
       select: { maternaId: true, paqueteId: true, tipo: true, esControl: true }
    });
    
    // Agrupar por materna
    const pkgMap = {};
    allEventsForPackages.forEach(e => {
       if (!pkgMap[e.maternaId]) pkgMap[e.maternaId] = { s: new Set(), basico: false };
       if (e.paqueteId) pkgMap[e.maternaId].s.add(e.paqueteId);
       if (e.tipo === 'CITA' && e.esControl && !e.paqueteId) pkgMap[e.maternaId].basico = true;
    });

    const processedMaternas = maternas.map(m => {
       const p = pkgMap[m.id] || { s: new Set(), basico: false };
       const arr = Array.from(p.s);
       if (p.basico) arr.push('basico');
       return { ...m, paquetesSeleccionados: arr };
    });

    res.json(processedMaternas);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener registros de maternas' });
  }
});

// POST /api/maternas - registrar nueva materna
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { 
      nombre, 
      documento, 
      tipoDocumento, 
      fechaNacimiento, 
      fechaEmbarazo, 
      tipoRiesgo,
      alertas,
      telefono,
      direccion,
      contactoEmergencia
    } = req.body;

    if (!nombre || !documento || !tipoDocumento || !fechaNacimiento || !fechaEmbarazo || !tipoRiesgo) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    const existing = await prisma.materna.findUnique({ where: { documento } });
    if (existing) {
      return res.status(409).json({ error: 'Ya existe una paciente con ese número de documento' });
    }

    const materna = await prisma.materna.create({
      data: {
        nombre,
        documento,
        tipoDocumento,
        fechaNacimiento: new Date(fechaNacimiento),
        fechaEmbarazo: new Date(fechaEmbarazo),
        tipoRiesgo,
        alertas,
        telefono,
        direccion,
        contactoEmergencia,
        carpetaEntregada: !!req.body.carpetaEntregada,
        creadaPorId: req.user.id,
        ...(req.body.fichaFomag ? {
          fichaFomag: { create: req.body.fichaFomag }
        } : {})
      },
      include: {
        creadaPor: {
          select: { nombre: true }
        },
        fichaFomag: true
      }
    });

    res.status(201).json(materna);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al registrar paciente' });
  }
});

// PUT /api/maternas/:id - editar datos de materna
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      nombre, 
      documento, 
      tipoDocumento, 
      fechaNacimiento, 
      fechaEmbarazo, 
      tipoRiesgo,
      alertas,
      telefono,
      direccion,
      contactoEmergencia
    } = req.body;

    const updateData = {};
    if (nombre) updateData.nombre = nombre;
    if (documento) updateData.documento = documento;
    if (tipoDocumento) updateData.tipoDocumento = tipoDocumento;
    if (fechaNacimiento) updateData.fechaNacimiento = new Date(fechaNacimiento);
    if (fechaEmbarazo) updateData.fechaEmbarazo = new Date(fechaEmbarazo);
    if (tipoRiesgo) updateData.tipoRiesgo = tipoRiesgo;
    if (alertas !== undefined) updateData.alertas = alertas;
    if (telefono !== undefined) updateData.telefono = telefono;
    if (direccion !== undefined) updateData.direccion = direccion;
    if (contactoEmergencia !== undefined) updateData.contactoEmergencia = contactoEmergencia;
    if (req.body.carpetaEntregada !== undefined) updateData.carpetaEntregada = !!req.body.carpetaEntregada;

    if (req.body.fichaFomag) {
      updateData.fichaFomag = {
        upsert: {
          create: req.body.fichaFomag,
          update: req.body.fichaFomag
        }
      };
    }

    const materna = await prisma.materna.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        creadaPor: {
          select: { nombre: true }
        },
        fichaFomag: true
      }
    });

    res.json(materna);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar datos de paciente' });
  }
});

// DELETE /api/maternas/:id - eliminar registro (solo ADMIN)
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    await prisma.materna.delete({
      where: { id: parseInt(req.params.id) }
    });
    res.json({ message: 'Registro eliminado correctamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar registro' });
  }
});

// GET /api/maternas/:id - obtener detalle de una materna
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const maternaId = parseInt(id);


    const materna = await prisma.materna.findUnique({
      where: { id: maternaId },
      include: {
        creadaPor: { select: { nombre: true } },
        eventos: { 
            orderBy: { fechaProgramada: 'asc' },
            include: { prestadores: true } 
        }
      }
    });

    if (!materna) {
      return res.status(404).json({ error: 'Paciente no encontrada' });
    }

    const paquetes = new Set();
    let hasBasico = false;
    materna.eventos.forEach(e => {
       if (e.paqueteId) paquetes.add(e.paqueteId);
       if (e.tipo === 'CITA' && e.esControl && !e.paqueteId) hasBasico = true;
    });
    
    const paquetesSeleccionados = Array.from(paquetes);
    if (hasBasico) paquetesSeleccionados.push('basico');

    res.json({ ...materna, paquetesSeleccionados });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener detalle de materna' });
  }
});

module.exports = router;
