/**
 * fomagExportService.js
 * Genera el archivo .xlsx de Cohorte Materno Perinatal FOMAG
 * con encabezado jerárquico de 4 filas.
 */
const ExcelJS = require('exceljs');

// ─── Constantes de estilos ─────────────────────────────────────────────────

const HEADER_FONT_BOLD = { bold: true, size: 11, name: 'Calibri', color: { argb: 'FFFFFFFF' } };
const HEADER_FONT_DARK = { bold: true, size: 10, name: 'Calibri', color: { argb: 'FF000000' } };

const BG = {
  title:    { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F4E78' } }, // Azul oscuro institucional
  group1:   { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9D9D9' } }, // Gris claro
  group2:   { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9D9D9' } }, // Gris claro
  colName:  { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9D9D9' } }, // Gris claro
};

const BORDER_THIN = {
  top: { style: 'thin' }, left: { style: 'thin' },
  bottom: { style: 'thin' }, right: { style: 'thin' },
};

const CENTER = { vertical: 'middle', horizontal: 'center', wrapText: true };

// ─── Definición de columnas ────────────────────────────────────────────────

/**
 * Estructura de columnas planas para la fila 4 (encabezados individuales).
 * group1 → fila 2, group2 → fila 3, label → fila 4.
 * key → campo en el objeto de datos.
 */
function buildColumnDefs() {
  const GRUPO_DEMO = 'DATOS DEMOGRÁFICOS E IDENTIFICACIÓN';
  const GRUPO_GEST = 'INFORMACIÓN GESTACIONAL';
  const GRUPO_CTRL = 'SEGUIMIENTO PRENATAL';
  const GRUPO_LAB  = 'LABORATORIOS Y PARACLÍNICOS';
  const GRUPO_MICRO = 'ENTREGA DE MICRONUTRIENTES';
  const GRUPO_VAC  = 'VACUNACIÓN';
  const GRUPO_PARTO = 'RESULTADO FINAL';

  const cols = [];

  // ─ Demografía ─
  const demoFields = [
    { label: 'Tipo ID',          key: 'tipoDocumento', width: 10 },
    { label: 'Número ID',        key: 'documento', width: 15 },
    { label: 'Nombres y Apellidos', key: 'nombre', width: 35 },
    { label: 'Regional',         key: 'regional', width: 10 },
    { label: 'Departamento',     key: 'departamento', width: 15 },
    { label: 'Municipio',        key: 'municipio', width: 15 },
    { label: 'Fecha Nacimiento', key: 'fechaNacimiento', width: 12 },
    { label: 'Edad',             key: 'edad', width: 8 },
    { label: 'Dirección',        key: 'direccion', width: 25 },
    { label: 'Teléfono',         key: 'telefono', width: 12 },
    { label: 'Correo',           key: 'correo', width: 20 },
    { label: 'Grupo Étnico',     key: 'grupoEtnico', width: 15 },
    { label: 'Nivel Educativo',  key: 'nivelEducativo', width: 15 },
    { label: 'Ocupación',        key: 'ocupacion', width: 15 },
    { label: 'Régimen',          key: 'regimen', width: 15 },
    { label: 'Tipo Vinculación', key: 'tipoVinculacion', width: 15 },
  ];
  demoFields.forEach(f => cols.push({ group1: GRUPO_DEMO, group2: 'Identificación / Demografía', ...f }));

  // ─ Gestacional ─
  const gestFields = [
    { label: 'FUR',                    key: 'fechaUltimaRegla', width: 12 },
    { label: 'FPP',                    key: 'fechaProbableParto', width: 12 },
    { label: 'EG Actual (sem)',        key: 'edadGestacional', width: 10 },
    { label: 'Ingreso Control Prenatal', key: 'fechaIngresoControl', width: 12 },
    { label: 'Clasificación Riesgo',   key: 'tipoRiesgo', width: 15 },
    { label: 'Antecedentes',           key: 'antecedentes', width: 30 },
  ];
  gestFields.forEach(f => cols.push({ group1: GRUPO_GEST, group2: 'Datos Gestacionales', ...f }));

  // ─ Controles 1–12 ─
  for (let n = 1; n <= 12; n++) {
    const ctrlFields = [
      { label: 'Fecha',         key: `ctrl${n}_fecha`, width: 12 },
      { label: 'Profesional',   key: `ctrl${n}_profesional`, width: 35 },
      { label: 'TA',            key: `ctrl${n}_tensionArterial`, width: 8 },
      { label: 'Peso',          key: `ctrl${n}_peso`, width: 8 },
      { label: 'Clasif. Nut.',  key: `ctrl${n}_clasificacionNutricional`, width: 12 },
      { label: 'A.U.',          key: `ctrl${n}_alturaUterina`, width: 8 },
      { label: 'F.C.F.',        key: `ctrl${n}_frecuenciaCardiacaFetal`, width: 8 },
    ];
    ctrlFields.forEach(f => cols.push({ group1: GRUPO_CTRL, group2: `Control ${n}`, ...f }));
  }

  // ─ Laboratorios ─
  const labFields = [
    { label: 'Hb Valor',       key: 'lab_hbValor',    sub: 'Hemoglobina' },
    { label: 'Hb Fecha',       key: 'lab_hbFecha',    sub: 'Hemoglobina' },
    { label: 'Hemoclasif.',    key: 'lab_hemoclasif',  sub: 'Sangre' },
    { label: 'Serología',      key: 'lab_serologia',   sub: 'Infectología' },
    { label: 'VIH',            key: 'lab_vih',         sub: 'Infectología' },
    { label: 'Glicemia',       key: 'lab_glicemia',    sub: 'Metabólico' },
    { label: 'Urocultivo',     key: 'lab_urocultivo',  sub: 'Urinario' },
    { label: 'Frotis Vaginal', key: 'lab_frotis',      sub: 'Urinario' },
    { label: 'Toxo IgG',       key: 'lab_toxoIgG',     sub: 'TORCH' },
    { label: 'Toxo IgM',       key: 'lab_toxoIgM',     sub: 'TORCH' },
    { label: 'Ecografía Det.', key: 'lab_ecoDetalle',  sub: 'Ecografías' },
    { label: 'Ecografía Fecha',key: 'lab_ecoFecha',    sub: 'Ecografías' },
  ];
  labFields.forEach(f => cols.push({ group1: GRUPO_LAB, group2: f.sub, ...f, width: 16 }));

  // ─ Micronutrientes ─
  const microFields = [
    { label: 'Hierro Cant.',       key: 'hierroCantidad',      sub: 'Hierro' },
    { label: 'Hierro Fecha',       key: 'hierroFecha',          sub: 'Hierro' },
    { label: 'Ác. Fólico Cant.',   key: 'acidoFolicoCantidad', sub: 'Ác. Fólico' },
    { label: 'Ác. Fólico Fecha',   key: 'acidoFolicoFecha',    sub: 'Ác. Fólico' },
    { label: 'Calcio Cant.',       key: 'calcioCantidad',       sub: 'Calcio' },
    { label: 'Calcio Fecha',       key: 'calcioFecha',          sub: 'Calcio' },
  ];
  microFields.forEach(f => cols.push({ group1: GRUPO_MICRO, group2: f.sub, ...f, width: 15 }));

  // ─ Vacunas ─
  const vacFields = [
    { label: 'Toxoide Tet.',  key: 'toxoideTetanico', sub: 'Tetanos' },
    { label: 'Tdap',          key: 'tdap',            sub: 'Tetanos' },
    { label: 'Influenza',     key: 'influenza',        sub: 'Influenza' },
    { label: 'COVID 1ra',     key: 'covid1Fecha',      sub: 'COVID-19' },
    { label: 'COVID 2da',     key: 'covid2Fecha',      sub: 'COVID-19' },
  ];
  vacFields.forEach(f => cols.push({ group1: GRUPO_VAC, group2: f.sub, ...f, width: 14 }));

  // ─ Resultado final ─
  const partoFields = [
    { label: 'Fecha Parto/Aborto',   key: 'fechaParto' },
    { label: 'Tipo Parto',           key: 'tipoParto' },
    { label: 'Vivo / Muerto',        key: 'estadoRecienNacido' },
    { label: 'Peso RN (g)',          key: 'pesoRN' },
    { label: 'Talla RN (cm)',        key: 'tallaRN' },
    { label: 'APGAR',                key: 'apgar' },
  ];
  partoFields.forEach(f => cols.push({ group1: GRUPO_PARTO, group2: 'Datos del Parto', ...f, width: 16 }));

  return cols;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function fmtDate(value) {
  if (!value) return '';
  try {
    return new Date(value).toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' });
  } catch { return String(value); }
}

function calcEdad(fechaNacimiento) {
  if (!fechaNacimiento) return '';
  const diff = Date.now() - new Date(fechaNacimiento).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
}

function calcEdadGestacional(fechaEmbarazo) {
  if (!fechaEmbarazo) return '';
  const diff = Date.now() - new Date(fechaEmbarazo).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 7));
}

/**
 * Aplana los datos de una materna (con su ficha y controles) en un objeto clave→valor.
 */
function flattenMaterna(materna) {
  const ficha = materna.fichaFomag || {};
  const eventos = materna.eventos || [];
  
  const controles = eventos
    .filter(e => e.esControl && e.estado === 'REALIZADO')
    .sort((a, b) => new Date(a.fechaRealizada) - new Date(b.fechaRealizada));

  // Indexar laboratorios desde EventoMedico
  const hemoglobinas = eventos.filter(e => /hemoglobin/i.test(e.descripcion)).sort((a, b) => new Date(a.fechaProgramada) - new Date(b.fechaProgramada));
  const ecografias   = eventos.filter(e => /ecograf/i.test(e.descripcion)).sort((a, b) => new Date(a.fechaProgramada) - new Date(b.fechaProgramada));
  const vih          = eventos.filter(e => /\bvih\b/i.test(e.descripcion));
  const serologia    = eventos.filter(e => /sifilis|serolog/i.test(e.descripcion));
  const glicemia     = eventos.filter(e => /glicemia/i.test(e.descripcion));
  const urocultivo   = eventos.filter(e => /urocultivo/i.test(e.descripcion));
  const frotis       = eventos.filter(e => /frotis/i.test(e.descripcion));
  const toxo         = eventos.filter(e => /toxoplasma/i.test(e.descripcion));

  const row = {
    // Demografía (base + ficha)
    regional:          ficha.regional || '',
    departamento:      ficha.departamento || '',
    municipio:         ficha.municipio || '',
    tipoDocumento:     materna.tipoDocumento || '',
    documento:         materna.documento || '',
    nombre:            materna.nombre || '',
    fechaNacimiento:   fmtDate(materna.fechaNacimiento),
    edad:              calcEdad(materna.fechaNacimiento),
    direccion:         materna.direccion || '',
    telefono:          materna.telefono || '',
    correo:            ficha.correo || '',
    grupoEtnico:       ficha.grupoEtnico || '',
    nivelEducativo:    ficha.nivelEducativo || '',
    ocupacion:         ficha.ocupacion || '',
    regimen:           ficha.regimen || '',
    tipoVinculacion:   ficha.tipoVinculacion || '',

    // Gestacional
    fechaUltimaRegla:   fmtDate(ficha.fechaUltimaRegla),
    fechaProbableParto:  fmtDate(ficha.fechaProbableParto),
    edadGestacional:     calcEdadGestacional(materna.fechaEmbarazo),
    fechaIngresoControl: fmtDate(ficha.fechaIngresoControl),
    tipoRiesgo:          materna.tipoRiesgo || '',
    antecedentes:        ficha.antecedentes || '',

    // Laboratorios
    lab_hbValor:    hemoglobinas[0]?.resultado || '',
    lab_hbFecha:    fmtDate(hemoglobinas[0]?.fechaRealizada),
    lab_hemoclasif: '',
    lab_serologia:  serologia[0]?.resultado || '',
    lab_vih:        vih[0]?.resultado || '',
    lab_glicemia:   glicemia[0]?.resultado || '',
    lab_urocultivo: urocultivo[0]?.resultado || '',
    lab_frotis:     frotis[0]?.resultado || '',
    lab_toxoIgG:    '',
    lab_toxoIgM:    '',
    lab_ecoDetalle: ecografias[0]?.notas || ecografias[0]?.descripcion || '',
    lab_ecoFecha:   fmtDate(ecografias[0]?.fechaRealizada),

    // Micronutrientes
    hierroCantidad:     ficha.hierroCantidad || '',
    hierroFecha:        fmtDate(ficha.hierroFecha),
    acidoFolicoCantidad: ficha.acidoFolicoCantidad || '',
    acidoFolicoFecha:   fmtDate(ficha.acidoFolicoFecha),
    calcioCantidad:     ficha.calcioCantidad || '',
    calcioFecha:        fmtDate(ficha.calcioFecha),

    // Vacunas
    toxoideTetanico: ficha.toxoideTetanico || '',
    tdap:            ficha.tdap || '',
    influenza:       ficha.influenza || '',
    covid1Fecha:     fmtDate(ficha.covid1Fecha),
    covid2Fecha:     fmtDate(ficha.covid2Fecha),

    // Parto
    fechaParto:          fmtDate(ficha.fechaParto),
    tipoParto:           ficha.tipoParto || '',
    estadoRecienNacido:  ficha.estadoRecienNacido || '',
    pesoRN:              ficha.pesoRN ?? '',
    tallaRN:             ficha.tallaRN ?? '',
    apgar:               ficha.apgar || '',
  };

  // Controles 1–12
  for (let n = 1; n <= 12; n++) {
    const ctrl = controles[n-1] || {};
    row[`ctrl${n}_fecha`]                    = fmtDate(ctrl.fechaRealizada);
    row[`ctrl${n}_profesional`]              = ctrl.prestadores?.map(p => p.nombre).join(', ') || '';
    row[`ctrl${n}_tensionArterial`]          = ctrl.tensionArterial || '';
    row[`ctrl${n}_peso`]                     = ctrl.peso ?? '';
    row[`ctrl${n}_clasificacionNutricional`] = ctrl.clasificacionNutricional || '';
    row[`ctrl${n}_alturaUterina`]            = ctrl.alturaUterina ?? '';
    row[`ctrl${n}_frecuenciaCardiacaFetal`]  = ctrl.frecuenciaCardiacaFetal ?? '';
  }

  return row;
}

// ─── Función principal ───────────────────────────────────────────────────────

/**
 * @param {Array} maternas - Array de maternas con fichaFomag, controlesPrenatal y eventos incluidos
 * @returns {Buffer} Buffer del archivo .xlsx
 */
async function generateFomagExcel(maternas) {
  const workbook  = new ExcelJS.Workbook();
  workbook.creator = 'MaternasEcoimagen';
  workbook.created  = new Date();

  const sheet = workbook.addWorksheet('Cohorte Materno Perinatal', {
    pageSetup: { orientation: 'landscape', fitToPage: true },
  });

  const colDefs = buildColumnDefs();
  const totalCols = colDefs.length;

  // ── Fila 1: Título ──────────────────────────────────────────────────────
  sheet.mergeCells(1, 1, 1, totalCols);
  const titleCell = sheet.getCell(1, 1);
  titleCell.value = 'COHORTE MATERNO PERINATAL - MATERNAS ECOIMAGEN';
  titleCell.font  = { bold: true, size: 16, name: 'Calibri', color: { argb: 'FFFFFFFF' } };
  titleCell.fill  = BG.title;
  titleCell.alignment = CENTER;
  titleCell.border = BORDER_THIN;
  sheet.getRow(1).height = 28;

  // ── Fila 2: Grupos principales (group1) ─────────────────────────────────
  let startCol = 1;
  let currentGroup1 = null;
  let group1Start = 1;

  for (let ci = 0; ci < colDefs.length; ci++) {
    const col = colDefs[ci];
    const colIdx = ci + 1;
    const isLast = ci === colDefs.length - 1;

    if (currentGroup1 !== col.group1) {
      if (currentGroup1 !== null) {
        // Cerrar grupo anterior
        if (group1Start !== colIdx - 1) {
          sheet.mergeCells(2, group1Start, 2, colIdx - 1);
        }
        const gc = sheet.getCell(2, group1Start);
        gc.value = currentGroup1;
        gc.font  = HEADER_FONT_BOLD;
        gc.fill  = BG.group1;
        gc.alignment = CENTER;
        gc.border = BORDER_THIN;
      }
      currentGroup1 = col.group1;
      group1Start = colIdx;
    }

    if (isLast) {
      if (group1Start !== colIdx) {
        sheet.mergeCells(2, group1Start, 2, colIdx);
      }
      const gc = sheet.getCell(2, group1Start);
      gc.value = currentGroup1;
      gc.font  = HEADER_FONT_BOLD;
      gc.fill  = BG.group1;
      gc.alignment = CENTER;
      gc.border = BORDER_THIN;
    }
  }
  sheet.getRow(2).height = 40;

  // ── Fila 3: Sub-grupos (group2) ─────────────────────────────────────────
  let currentGroup2 = null;
  let group2Start = 1;

  for (let ci = 0; ci < colDefs.length; ci++) {
    const col = colDefs[ci];
    const colIdx = ci + 1;
    const isLast = ci === colDefs.length - 1;

    if (currentGroup2 !== col.group2) {
      if (currentGroup2 !== null) {
        if (group2Start !== colIdx - 1) {
          sheet.mergeCells(3, group2Start, 3, colIdx - 1);
        }
        const gc = sheet.getCell(3, group2Start);
        gc.value = currentGroup2;
        gc.font  = HEADER_FONT_BOLD;
        gc.fill  = BG.group2;
        gc.alignment = CENTER;
        gc.border = BORDER_THIN;
      }
      currentGroup2 = col.group2;
      group2Start = colIdx;
    }

    if (isLast) {
      if (group2Start !== colIdx) {
        sheet.mergeCells(3, group2Start, 3, colIdx);
      }
      const gc = sheet.getCell(3, group2Start);
      gc.value = currentGroup2;
      gc.font  = HEADER_FONT_BOLD;
      gc.fill  = BG.group2;
      gc.alignment = CENTER;
      gc.border = BORDER_THIN;
    }
  }
  sheet.getRow(3).height = 32;

  // ── Fila 4: Nombres de columna individuales ─────────────────────────────
  colDefs.forEach((col, ci) => {
    const cell = sheet.getCell(4, ci + 1);
    cell.value = col.label;
    cell.font  = HEADER_FONT_DARK;
    cell.fill  = BG.colName;
    cell.alignment = CENTER;
    cell.border = BORDER_THIN;
    sheet.getColumn(ci + 1).width = col.width || 16;
  });
  sheet.getRow(4).height = 30;

  // ── Filas de datos (fila 5 en adelante) ────────────────────────────────
  maternas.forEach((materna, index) => {
    const flat = flattenMaterna(materna);
    const rowValues = colDefs.map(col => flat[col.key] ?? '');
    const dataRow = sheet.addRow(rowValues);
    
    // Zebra striping
    const rowBgColor = index % 2 === 0 ? 'FFF9F9F9' : 'FFFFFFFF';
    
    dataRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      cell.border = BORDER_THIN;
      cell.alignment = { vertical: 'middle', wrapText: false };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: rowBgColor } };
      
      const colDef = colDefs[colNumber - 1];
      
      // Formato Condicional y Validación de Datos para Riesgo
      if (colDef && colDef.key === 'tipoRiesgo') {
        const riesgo = (flat.tipoRiesgo || '').toUpperCase();
        
        if (riesgo === 'ALTA' || riesgo === 'ALTO') {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFC7CE' } };
          cell.font = { color: { argb: 'FF9C0006' }, bold: true };
        } else if (riesgo === 'MEDIANA' || riesgo === 'MEDIO') {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFCC' } }; // Amarillo claro
          cell.font = { color: { argb: 'FF9C6500' }, bold: true }; // Texto oscuro
        }
        
        cell.dataValidation = {
          type: 'list',
          allowBlank: true,
          formulae: ['"BAJA,MEDIANA,ALTA"']
        };
      }
    });
    dataRow.height = 20;
  });

  // Inmovilizar Paneles: 4 filas y las primeras 3 columnas (Tipo ID, Número ID, Nombre)
  sheet.views = [{ state: 'frozen', xSplit: 3, ySplit: 4 }];

  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
}

module.exports = { generateFomagExcel };
