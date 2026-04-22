const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/theme - obtener configuración del tema (público)
router.get('/', async (req, res) => {
  try {
    let theme = await prisma.themeConfig.findFirst();
    if (!theme) {
      theme = await prisma.themeConfig.create({
        data: {
          primaryColor: '#E91E8C',
          secondaryColor: '#3B82F6',
          accentColor: '#F472B6',
          darkMode: false,
          clinicName: 'Clínica Maternas',
        },
      });
    }
    res.json(theme);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener configuración del tema' });
  }
});

// PUT /api/theme - actualizar tema (solo ADMIN)
router.put('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { primaryColor, secondaryColor, accentColor, darkMode, clinicName, logoUrl } = req.body;

    let theme = await prisma.themeConfig.findFirst();

    if (!theme) {
      theme = await prisma.themeConfig.create({
        data: {
          primaryColor: primaryColor || '#E91E8C',
          secondaryColor: secondaryColor || '#3B82F6',
          accentColor: accentColor || '#F472B6',
          darkMode: darkMode ?? false,
          clinicName: clinicName || 'Clínica Maternas',
          logoUrl: logoUrl || null,
        },
      });
    } else {
      theme = await prisma.themeConfig.update({
        where: { id: theme.id },
        data: {
          ...(primaryColor && { primaryColor }),
          ...(secondaryColor && { secondaryColor }),
          ...(accentColor && { accentColor }),
          ...(typeof darkMode === 'boolean' && { darkMode }),
          ...(clinicName && { clinicName }),
          ...(logoUrl !== undefined && { logoUrl }),
        },
      });
    }

    res.json(theme);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar el tema' });
  }
});

module.exports = router;
