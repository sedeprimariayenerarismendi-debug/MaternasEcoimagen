/**
 * routes/fomag.js
 * CRUD para FichaFomag, ControlPrenatal y exportación Excel FOMAG
 */
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authMiddleware } = require('../middleware/auth');
const { generateFomagExcel } = require('../services/fomagExportService');

const router = express.Router();
const prisma = new PrismaClient();

const MATERNA_INCLUDE = {
  fichaFomag: true,
  eventos: {
    select: {
      id: true,
      tipo: true,
      descripcion: true,
      fechaProgramada: true,
      fechaRealizada: true,
      resultado: true,
      notas: true,
      estado: true,
      esControl: true,
      tensionArterial: true,
      peso: true,
      clasificacionNutricional: true,
      alturaUterina: true,
      frecuenciaCardiacaFetal: true,
      prestadores: {
        select: { nombre: true }
      }
    },
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/fomag/export/excel  — Export ALL maternas
// NOTE: This route must be defined BEFORE /:maternaId routes to avoid conflict
// ─────────────────────────────────────────────────────────────────────────────
router.get('/export/excel', authMiddleware, async (req, res) => {
  try {
    const maternas = await prisma.materna.findMany({
      include: MATERNA_INCLUDE,
      orderBy: { nombre: 'asc' },
    });

    const buffer = await generateFomagExcel(maternas);
    const filename = `FOMAG_Cohorte_Materno_${new Date().toISOString().slice(0, 10)}.xlsx`;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
  } catch (err) {
    console.error('[FOMAG Export All]', err);
    res.status(500).json({ error: 'Error al generar el reporte Excel' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/fomag/export/excel/:maternaId  — Export ONE materna
// ─────────────────────────────────────────────────────────────────────────────
router.get('/export/excel/:maternaId', authMiddleware, async (req, res) => {
  try {
    const maternaId = parseInt(req.params.maternaId);
    const materna = await prisma.materna.findUnique({
      where: { id: maternaId },
      include: MATERNA_INCLUDE,
    });

    if (!materna) return res.status(404).json({ error: 'Materna no encontrada' });

    const buffer = await generateFomagExcel([materna]);
    const safeName = (materna.nombre || 'Materna').replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `FOMAG_${safeName}_${new Date().toISOString().slice(0, 10)}.xlsx`;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
  } catch (err) {
    console.error('[FOMAG Export One]', err);
    res.status(500).json({ error: 'Error al generar el reporte Excel' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/fomag/:maternaId  — Obtener ficha + controles
// ─────────────────────────────────────────────────────────────────────────────
router.get('/:maternaId', authMiddleware, async (req, res) => {
  try {
    const maternaId = parseInt(req.params.maternaId);

    const ficha = await prisma.fichaFomag.findUnique({ where: { maternaId } });
    
    // We just return the standalone ficha here, as controles are returned by /eventos
    res.json({ ficha });
  } catch (err) {
    console.error('[FOMAG GET]', err);
    res.status(500).json({ error: 'Error al obtener ficha FOMAG' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/fomag/:maternaId  — Crear o actualizar ficha
// ─────────────────────────────────────────────────────────────────────────────
router.put('/:maternaId', authMiddleware, async (req, res) => {
  try {
    const maternaId = parseInt(req.params.maternaId);

    // Verificar que la materna existe
    const maternaExists = await prisma.materna.findUnique({ where: { id: maternaId }, select: { id: true } });
    if (!maternaExists) return res.status(404).json({ error: 'Materna no encontrada' });

    const {
      regional, departamento, municipio, correo,
      grupoEtnico, nivelEducativo, ocupacion, regimen, tipoVinculacion,
      fechaUltimaRegla, fechaProbableParto, fechaIngresoControl, antecedentes,
      hierroCantidad, hierroFecha, acidoFolicoCantidad, acidoFolicoFecha, calcioCantidad, calcioFecha,
      toxoideTetanico, tdap, influenza, covid1Fecha, covid2Fecha,
      fechaParto, tipoParto, estadoRecienNacido, pesoRN, tallaRN, apgar,
    } = req.body;

    const parseDate = (v) => (v ? new Date(v) : undefined);
    const parseFloat_ = (v) => (v !== undefined && v !== '' ? parseFloat(v) : undefined);

    const data = {
      regional, departamento, municipio, correo,
      grupoEtnico, nivelEducativo, ocupacion, regimen, tipoVinculacion,
      fechaUltimaRegla:    parseDate(fechaUltimaRegla),
      fechaProbableParto:  parseDate(fechaProbableParto),
      fechaIngresoControl: parseDate(fechaIngresoControl),
      antecedentes,
      hierroCantidad, hierroFecha: parseDate(hierroFecha),
      acidoFolicoCantidad, acidoFolicoFecha: parseDate(acidoFolicoFecha),
      calcioCantidad, calcioFecha: parseDate(calcioFecha),
      toxoideTetanico, tdap, influenza,
      covid1Fecha: parseDate(covid1Fecha),
      covid2Fecha: parseDate(covid2Fecha),
      fechaParto:  parseDate(fechaParto),
      tipoParto, estadoRecienNacido,
      pesoRN: parseFloat_(pesoRN),
      tallaRN: parseFloat_(tallaRN),
      apgar,
    };

    // Remove undefined keys so Prisma doesn't try to set them to null unintentionally
    Object.keys(data).forEach(k => data[k] === undefined && delete data[k]);

    const ficha = await prisma.fichaFomag.upsert({
      where: { maternaId },
      create: { maternaId, ...data },
      update: data,
    });

    res.json(ficha);
  } catch (err) {
    console.error('[FOMAG PUT]', err);
    res.status(500).json({ error: 'Error al guardar ficha FOMAG' });
  }
});



module.exports = router;
