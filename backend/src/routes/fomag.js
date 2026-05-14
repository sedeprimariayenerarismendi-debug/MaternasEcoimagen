/**
 * routes/fomag.js
 * CRUD para FichaFomag, ControlPrenatal, importación y exportación Excel FOMAG
 */
const express = require('express');
const multer  = require('multer');
const ExcelJS = require('exceljs');
const { PrismaClient } = require('@prisma/client');
const { authMiddleware } = require('../middleware/auth');
const { generateFomagExcel } = require('../services/fomagExportService');

const router  = express.Router();
const prisma  = new PrismaClient();
const upload  = multer({ storage: multer.memoryStorage() });

// ─── Helpers avanzados ────────────────────────────────────────────────────────

/** Convierte cualquier valor de celda Excel a Date o null */
function toDate(val) {
  if (val == null) return null;
  if (val instanceof Date) return isNaN(val) ? null : val;
  // Número serial de Excel
  if (typeof val === 'number' && val > 1000 && val < 100000) {
    const d = new Date(Math.round((val - 25569) * 86400 * 1000));
    return isNaN(d) ? null : d;
  }
  // String en formato DD/MM/AAAA
  if (typeof val === 'string') {
    const dmyMatch = val.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
    if (dmyMatch) {
      const d = new Date(`${dmyMatch[3]}-${dmyMatch[2].padStart(2,'0')}-${dmyMatch[1].padStart(2,'0')}`);
      return isNaN(d) ? null : d;
    }
    const d = new Date(val);
    return isNaN(d) ? null : d;
  }
  return null;
}

/** Limpia un string: elimina espacios, devuelve null si vacío */
function str(val) {
  if (val == null) return null;
  const s = String(val).trim().replace(/\s+/g, ' ');
  return s === '' || s === '0' ? null : s;
}

/** Lee el valor real de una celda (incluye richText y fórmulas) */
function cellVal(row, col) {
  const c = row.getCell(col);
  if (!c.value) return null;
  if (typeof c.value === 'object') {
    if ('richText' in c.value) return c.value.richText.map(r => r.text).join('');
    if ('formula' in c.value) return c.value.result ?? null;
    if (c.value instanceof Date) return c.value;
  }
  return c.value;
}

/** Extrae número de documento limpiando caracteres no numéricos */
function cleanDoc(val) {
  if (!val) return null;
  const s = String(val).trim().replace(/[^0-9]/g, '');
  return s || str(val); // si no queda número, devolver string original
}

/** Normaliza clasificación de riesgo al enum del sistema */
function normalizeRiesgo(val) {
  if (!val) return 'BAJO';
  const v = String(val).toUpperCase().trim();
  if (v.includes('ALT')) return 'ALTA'; // FichaFomag dice "ALTA"
  if (v.includes('MED')) return 'MEDIANA';
  return 'BAJA';
}

function colToNum(col) {
  let n = 0;
  for (let i = 0; i < col.length; i++) n = n * 26 + (col.charCodeAt(i) - 64);
  return n;
}

// ─── POST /api/fomag/import ───────────────────────────────────────────────────
// MAPA DE COLUMNAS NUEVO FORMATO FOMAG: Filas 8-11 Encabezados, Datos desde Fila 12.
// Columnas de la A a la NF (370 columnas aprox)
// ─────────────────────────────────────────────────────────────────────────────
router.post('/import', authMiddleware, upload.single('archivo'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No se recibió archivo' });
  try {
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(req.file.buffer);
    const ws = wb.worksheets[0];
    const results = { creados: 0, actualizados: 0, errores: [], advertencias: [] };

    // Datos inician en la fila 12 según nuestro nuevo formato de exportación
    console.log(`[FOMAG Import] Total filas en archivo: ${ws.rowCount}`);
    for (let r = 12; r <= ws.rowCount; r++) {
      const row = ws.getRow(r);
      
      const val = (colStr) => cellVal(row, colToNum(colStr));
      const valStr = (colStr) => str(val(colStr));
      const valDate = (colStr) => toDate(val(colStr));
      const valDoc = (colStr) => cleanDoc(val(colStr));

      // ── Identificación y Demografía ─────────────────────────────────────
      const documento = valDoc('J'); // J: No DE IDENTIFICACION
      if (!documento) {
        if (r === 12) {
          console.log(`[FOMAG Import] Fila 12 valores reales:`, JSON.stringify(row.values));
        }
        console.log(`[FOMAG Import] Fila ${r}: Saltada por documento vacío. Valor bruto en J: ${val('J')}`);
        continue;
      }
      
      console.log(`[FOMAG Import] Procesando fila ${r} con documento: ${documento}`);

      const ips           = valStr('C');
      const regional      = valStr('B');
      const departamento  = valStr('E');
      const municipio     = valStr('F');
      
      const nombres       = valStr('G') || '';
      const apellidos     = valStr('H') || '';
      const tipoDoc       = valStr('I') || 'CC';
      
      const fechaNacimiento = valDate('L') || new Date('1990-01-01');
      const nivelEducativo  = valStr('N');
      const direccion       = valStr('P');
      const telefono        = valStr('R');
      const ocupacion       = valStr('T');
      const etnia           = valStr('U');
      const identidadGenero = valStr('V');
      const discapacidad    = valStr('W');
      const victimaViolencia= valStr('X');
      const atencionPre     = valStr('Z');
      const asesoriaAnti    = valStr('AA');
      const acidoFolicoPrev = valStr('AB');
      const citasPreconcep  = val('AC'); 

      // ── Información Gestacional ─────────────────────────────────────────
      const fechaIngresoControl = valDate('AD');
      const embarazoDeseado   = valStr('AF');
      const redApoyo          = valStr('AG');
      const tamizajeViolencia = valStr('AH');
      const tamizajeDepresion = valStr('AI');
      const sifilis1Res       = valStr('AJ');
      const sifilis1Fecha     = valDate('AK');
      const vihRes            = valStr('AL');
      const vihFecha          = valDate('AM');
      const chagasRes         = valStr('AP');
      const fur               = valDate('AQ');
      const fpp               = valDate('AT');
      const riesgoActual      = valStr('AU') || 'BAJA';
      const antecedentes      = valStr('AW');

      // ── Paraclínicos Fijos (1er y demás) ────────────────────────────────
      const hemoclasificacion = valStr('CM');
      const hb1Res            = valStr('CN');
      const glicemiaRes       = valStr('CQ');
      const rubeolaRes        = valStr('CR');
      const toxoIggRes        = valStr('CS');
      const urocultivo        = valStr('CW');
      const chagasRes2        = valStr('CY');
      const eco1Fecha         = valDate('CZ');
      const eco1Int           = valStr('DA');

      const hb2Res            = valStr('FQ');
      const ptogRes           = valStr('FT');
      
      // Sifilis Tratamiento
      const sifilisDx         = valStr('GD');
      const sifilisSemanas    = val('GE');
      const sifilisTrat       = valStr('GF');
      const sifilisComp       = valStr('GG');
      const sifilisCont       = val('GH');

      // ── Resultado Parto y RN ────────────────────────────────────────────
      const mme               = valStr('LM');
      const dxMme             = valStr('LN');
      const zika              = valStr('LO');
      const institucionParto  = valStr('LP');
      const eventoObs         = valStr('LQ');
      const fechaParto        = valDate('LR');
      const partoHuman        = valStr('LS');
      const lactancia         = valStr('LT');
      const pesoRN            = val('LW'); 
      const tallaRN           = val('LX'); 
      const estadoRN          = valStr('LV');
      const tshRnFecha        = valDate('LZ');
      const tshRnRes          = valStr('MA');
      const tamizajeAuditivo  = valStr('MB');
      const altaRnFecha       = valDate('MC');
      const consultaRnFecha   = valDate('MD');
      const altaPuerpFecha    = valDate('ME');
      const consPuerpFecha    = valDate('MF');
      const metodoPost        = valStr('MG');
      const metodoEle         = valStr('MH');
      const entregaMed        = valStr('MI');
      const motivoCierre      = valStr('MJ');

      try {
        // 1. Encontrar o crear Materna
        let materna = await prisma.materna.findUnique({ where: { documento } });
        const fullNombre = [nombres, apellidos].filter(Boolean).join(' ') || 'SIN NOMBRE';
        
        if (!materna) {
          materna = await prisma.materna.create({
            data: {
              documento,
              tipoDocumento: tipoDoc,
              nombre: fullNombre,
              fechaNacimiento,
              fechaEmbarazo: fur || new Date(),
              fechaRegistro: fechaIngresoControl || new Date(),
              tipoRiesgo: normalizeRiesgo(riesgoActual),
              telefono,
              direccion,
              creadaPorId: req.user.id,
              fichaFomag: {
                create: {} 
              }
            }
          });
          results.creados++;
        } else {
          materna = await prisma.materna.update({
            where: { id: materna.id },
            data: {
              nombre: fullNombre,
              telefono: telefono || materna.telefono,
              direccion: direccion || materna.direccion,
              tipoRiesgo: normalizeRiesgo(riesgoActual)
            }
          });
          results.actualizados++;
        }

        // 2. Actualizar FichaFomag
        const fichaData = {
            ips, regional, departamento, municipio,
            nivelEducativo, ocupacion, etnia, identidadGenero,
            discapacidad, victimaViolencia, atencionPreconcepcional: atencionPre,
            asesoriaAnticonceptivo: asesoriaAnti, acidoFolicoPrevio: acidoFolicoPrev,
            citasPreconcepcionales: typeof citasPreconcep === 'number' ? citasPreconcep : null,
            fechaIngresoControl, embarazoDeseado, redApoyo,
            tamizajeViolencia, tamizajeDepresion, sifilis1Resultado: sifilis1Res,
            sifilis1Fecha, vihResultado: vihRes, vihFecha, chagasResultado: chagasRes || chagasRes2,
            fechaUltimaRegla: fur, fechaProbableParto: fpp, antecedentes,
            hemoclasificacionResultado: hemoclasificacion, hemoglobina1Resultado: hb1Res,
            glicemiaResultado: glicemiaRes, rubeolaIggResultado: rubeolaRes,
            toxoplasmaIggResultado: toxoIggRes, urocultivoResultado: urocultivo,
            eco1Fecha, eco1Interpretacion: eco1Int, hemoglobina2Resultado: hb2Res, ptogResultado: ptogRes,
            sifilisDiagnostico: sifilisDx, sifilisSemanasTratamiento: typeof sifilisSemanas === 'number' ? sifilisSemanas : null,
            sifilisTratamiento: sifilisTrat, sifilisCompleto: sifilisComp, sifilisContactos: typeof sifilisCont === 'number' ? sifilisCont : null,
            presentoMme: mme, dxMme, zikaGestacion: zika, institucionParto, eventoObstetrico: eventoObs,
            fechaParto, partoHumanizado: partoHuman, lactanciaExclusiva: lactancia,
            pesoRN: parseFloat(pesoRN) || null, tallaRN: parseFloat(tallaRN) || null, estadoRecienNacido: estadoRN,
            tshRnFecha, tshRnResultado: tshRnRes, tamizajeAuditivoRn: tamizajeAuditivo,
            altaRnFecha, consultaRnFecha, altaPuerperaFecha: altaPuerpFecha,
            consultaPuerperaFecha: consPuerpFecha, metodoPostparto: metodoPost,
            metodoElegido: metodoEle, entregaMedicamentos: entregaMed, motivoCierre
        };

        // Limpiar undefined
        Object.keys(fichaData).forEach(k => fichaData[k] === undefined && delete fichaData[k]);

        await prisma.fichaFomag.upsert({
          where: { maternaId: materna.id },
          update: fichaData,
          create: { maternaId: materna.id, ...fichaData }
        });

        // 3. Procesar los 11 Controles FOMAG
        const controlesMap = [
          { c:1, fFecha:'BU', fTa:'BZ', fPeso:'CF', fImc:'CG', fNutr:'CH' },
          { c:2, fFecha:'DF', fTa:'DI', fPeso:'DM', fImc:'DN', fNutr:'DO', fRiesgo:'DJ', fAro:'DK' },
          { c:3, fFecha:'DV', fTa:'DY', fPeso:'EC', fImc:'ED', fNutr:'EE', fRiesgo:'DZ', fAro:'EA' },
          { c:4, fFecha:'EK', fTa:'EN', fPeso:'ER', fImc:'ES', fNutr:'ET', fRiesgo:'EO', fAro:'EP' },
          { c:5, fFecha:'FA', fTa:'FD', fPeso:'FH', fImc:'FI', fNutr:'FJ', fRiesgo:'FE', fAro:'FF' },
          { c:6, fFecha:'GI', fTa:'GL', fPeso:'GQ', fImc:'GR', fNutr:'GS', fRiesgo:'GM', fAro:'GO' },
          { c:7, fFecha:'GZ', fTa:'HC', fPeso:'HG', fImc:'HH', fNutr:'HI', fRiesgo:'HD', fAro:'HE' },
          { c:8, fFecha:'HO', fTa:'HR', fPeso:'HV', fImc:'HW', fNutr:'HX', fRiesgo:'HS', fAro:'HT' },
          { c:9, fFecha:'IE', fTa:'IH', fPeso:'IL', fImc:'IM', fNutr:'IN', fRiesgo:'II', fAro:'IJ' },
          { c:10,fFecha:'IV', fTa:'IY', fPeso:'JC', fImc:'JD', fNutr:'JE', fRiesgo:'IZ', fAro:'JA' },
          { c:11,fFecha:'JK', fTa:'JN', fPeso:'JR', fImc:'JS', fNutr:'JT', fRiesgo:'JO', fAro:'JP' }
        ];

        for (const ctrl of controlesMap) {
          const fechaControl = valDate(ctrl.fFecha);
          if (!fechaControl) continue; // Si no hay fecha, no hay control en esta columna

          const ta      = valStr(ctrl.fTa);
          const peso    = parseFloat(val(ctrl.fPeso)) || null;
          const imc     = parseFloat(val(ctrl.fImc)) || null;
          const nutr    = valStr(ctrl.fNutr);
          const riesgo  = ctrl.fRiesgo ? valStr(ctrl.fRiesgo) : null;
          const aro     = ctrl.fAro ? valStr(ctrl.fAro) : null;

          const startDate = new Date(fechaControl);
          startDate.setHours(0,0,0,0);
          const endDate = new Date(fechaControl);
          endDate.setHours(23,59,59,999);

          const existeControl = await prisma.eventoMedico.findFirst({
            where: {
              maternaId: materna.id,
              esControl: true,
              fechaProgramada: { gte: startDate, lte: endDate }
            }
          });

          if (existeControl) {
            await prisma.eventoMedico.update({
              where: { id: existeControl.id },
              data: {
                estado: 'REALIZADO',
                fechaRealizada: fechaControl,
                tensionArterial: ta || existeControl.tensionArterial,
                peso: peso || existeControl.peso,
                imc: imc || existeControl.imc,
                clasificacionNutricional: nutr || existeControl.clasificacionNutricional,
                riesgoObstetrico: riesgo || existeControl.riesgoObstetrico,
                diagnosticoAro: aro || existeControl.diagnosticoAro
              }
            });
          } else {
            await prisma.eventoMedico.create({
              data: {
                maternaId: materna.id,
                tipo: 'CONSULTA',
                descripcion: `Control Prenatal ${ctrl.c} (Importado FOMAG)`,
                esObligatorio: true,
                esControl: true,
                estado: 'REALIZADO',
                fechaProgramada: fechaControl,
                fechaRealizada: fechaControl,
                tensionArterial: ta,
                peso: peso,
                imc: imc,
                clasificacionNutricional: nutr,
                riesgoObstetrico: riesgo,
                diagnosticoAro: aro
              }
            });
          }
        }
      } catch (rowErr) {
        console.error(`Error procesando fila ${r} (Doc: ${documento}):`, rowErr);
        results.errores.push({ fila: r, documento, error: rowErr.message });
      }
    }

    res.json({
      message: 'Archivo FOMAG procesado correctamente',
      resultados: results
    });

  } catch (error) {
    console.error('Error importando Excel FOMAG:', error);
    res.status(500).json({ error: 'Ocurrió un error al procesar el archivo Excel', detalle: error.message });
  }
});





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
