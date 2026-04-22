const express = require('express');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/users - listar todos los usuarios (solo ADMIN)
router.get('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        nombre: true,
        email: true,
        rol: true,
        activo: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

// POST /api/users - crear usuario (solo ADMIN)
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { nombre, email, password, rol } = req.body;

    if (!nombre || !email || !password) {
      return res.status(400).json({ error: 'Nombre, email y contraseña son requeridos' });
    }

    const rolesValidos = ['ADMIN', 'MEDICO', 'ENFERMERA'];
    const rolFinal = rolesValidos.includes(rol) ? rol : 'ENFERMERA';

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: 'Ya existe un usuario con ese email' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        nombre,
        email,
        password: hashedPassword,
        rol: rolFinal,
      },
      select: {
        id: true,
        nombre: true,
        email: true,
        rol: true,
        activo: true,
        createdAt: true,
      },
    });

    res.status(201).json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear usuario' });
  }
});

// PUT /api/users/:id - editar usuario (solo ADMIN)
router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, email, password, rol, activo } = req.body;

    const userId = parseInt(id);
    const existingUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!existingUser) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const updateData = {};
    if (nombre) updateData.nombre = nombre;
    if (email) updateData.email = email;
    if (rol) updateData.rol = rol;
    if (typeof activo === 'boolean') updateData.activo = activo;
    if (password) updateData.password = await bcrypt.hash(password, 12);

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        nombre: true,
        email: true,
        rol: true,
        activo: true,
        createdAt: true,
      },
    });

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar usuario' });
  }
});

// DELETE /api/users/:id - desactivar usuario (soft delete, solo ADMIN)
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);

    // No se puede desactivar a sí mismo
    if (req.user.id === userId) {
      return res.status(400).json({ error: 'No puedes desactivar tu propia cuenta' });
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { activo: false },
      select: { id: true, nombre: true, activo: true },
    });

    res.json({ message: 'Usuario desactivado', user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al desactivar usuario' });
  }
});

module.exports = router;
