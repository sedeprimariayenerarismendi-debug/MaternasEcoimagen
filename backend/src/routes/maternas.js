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
    res.json(maternas);
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
        creadaPorId: req.user.id
      },
      include: {
        creadaPor: {
          select: { nombre: true }
        }
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

    const materna = await prisma.materna.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        creadaPor: {
          select: { nombre: true }
        }
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

module.exports = router;
