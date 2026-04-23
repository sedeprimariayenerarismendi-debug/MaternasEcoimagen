const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/prestadores - Listar todos los prestadores
router.get('/', authMiddleware, async (req, res) => {
  try {
    const prestadores = await prisma.prestador.findMany({
      orderBy: { nombre: 'asc' }
    });
    res.json(prestadores);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener prestadores' });
  }
});

// POST /api/prestadores - Crear nuevo prestador
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { nombre, nit } = req.body;
    if (!nombre) {
      return res.status(400).json({ error: 'El nombre es obligatorio' });
    }

    const prestador = await prisma.prestador.create({
      data: { nombre, nit }
    });
    res.status(201).json(prestador);
  } catch (err) {
    console.error(err);
    if (err.code === 'P2002') return res.status(409).json({ error: 'Ya existe un prestador con ese nombre' });
    res.status(500).json({ error: 'Error al crear prestador' });
  }
});

// DELETE /api/prestadores/:id - Eliminar prestador
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    await prisma.prestador.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: 'Prestador eliminado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar prestador' });
  }
});

module.exports = router;
