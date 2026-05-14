const ExcelJS = require('exceljs');

// ─── Helpers ─────────────────────────────────────────────────────────────
function colToNum(col) {
  let n = 0;
  for (let i = 0; i < col.length; i++) n = n * 26 + (col.charCodeAt(i) - 64);
  return n;
}

function fmtDate(value) {
  if (!value) return '';
  try { return new Date(value).toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' }); }
  catch { return String(value); }
}

function calcEdad(fechaNacimiento) {
  if (!fechaNacimiento) return '';
  const diff = Date.now() - new Date(fechaNacimiento).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
}

function calcEdadGestacional(fechaEmbarazo, dateToCompare = Date.now()) {
  if (!fechaEmbarazo) return '';
  const diff = new Date(dateToCompare).getTime() - new Date(fechaEmbarazo).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 7));
}

// ─── Mapeo de datos ──────────────────────────────────────────────────────
function flattenMaterna(materna, index) {
  const ficha = materna.fichaFomag || {};
  const eventos = materna.eventos || [];
  
  const controles = eventos
    .filter(e => e.esControl && e.estado === 'REALIZADO')
    .sort((a, b) => new Date(a.fechaRealizada) - new Date(b.fechaRealizada));

  const ecografias = eventos.filter(e => /ecograf/i.test(e.descripcion)).sort((a, b) => new Date(a.fechaProgramada) - new Date(b.fechaProgramada));
  
  const row = {};
  const setVal = (colStr, val) => {
    if (val !== null && val !== undefined && val !== '') row[colToNum(colStr)] = val;
  };

  // 1. Identificación y Demografía
  setVal('A', index + 1);
  setVal('B', ficha.regional);
  setVal('C', ficha.ips);
  setVal('E', ficha.departamento);
  setVal('F', ficha.municipio);
  
  const partesNombre = (materna.nombre || '').split(' ');
  const apellidos = partesNombre.length > 2 ? partesNombre.slice(-2).join(' ') : (partesNombre[1] || '');
  const nombres = partesNombre.length > 2 ? partesNombre.slice(0, -2).join(' ') : (partesNombre[0] || '');
  
  setVal('G', nombres);
  setVal('H', apellidos);
  setVal('I', materna.tipoDocumento);
  setVal('J', materna.documento);
  setVal('L', fmtDate(materna.fechaNacimiento));
  setVal('M', calcEdad(materna.fechaNacimiento));
  setVal('N', ficha.nivelEducativo);
  setVal('P', materna.direccion);
  setVal('R', materna.telefono);
  setVal('T', ficha.ocupacion);
  setVal('U', ficha.etnia || ficha.grupoEtnico); 
  setVal('V', ficha.identidadGenero);
  setVal('W', ficha.discapacidad);
  setVal('X', ficha.victimaViolencia);
  setVal('Z', ficha.atencionPreconcepcional);
  setVal('AA', ficha.asesoriaAnticonceptivo);
  setVal('AB', ficha.acidoFolicoPrevio);
  setVal('AC', ficha.citasPreconcepcionales);

  // 2. Información Gestacional
  setVal('AD', fmtDate(ficha.fechaIngresoControl));
  setVal('AE', calcEdadGestacional(materna.fechaEmbarazo, ficha.fechaIngresoControl));
  setVal('AF', ficha.embarazoDeseado);
  setVal('AG', ficha.redApoyo);
  setVal('AH', ficha.tamizajeViolencia);
  setVal('AI', ficha.tamizajeDepresion);
  setVal('AJ', ficha.sifilis1Resultado);
  setVal('AK', fmtDate(ficha.sifilis1Fecha));
  setVal('AL', ficha.vihResultado);
  setVal('AM', fmtDate(ficha.vihFecha));
  setVal('AP', ficha.chagasResultado);

  setVal('AQ', fmtDate(ficha.fechaUltimaRegla));
  setVal('AR', calcEdadGestacional(materna.fechaEmbarazo));
  setVal('AT', fmtDate(ficha.fechaProbableParto));
  setVal('AU', materna.tipoRiesgo);
  setVal('AW', ficha.antecedentes);

  // 3. Paraclínicos 1er trimestre
  setVal('CM', ficha.hemoclasificacionResultado);
  setVal('CN', ficha.hemoglobina1Resultado);
  setVal('CQ', ficha.glicemiaResultado);
  setVal('CR', ficha.rubeolaIggResultado);
  setVal('CS', ficha.toxoplasmaIggResultado);
  setVal('CW', ficha.urocultivoResultado);
  setVal('CY', ficha.chagasResultado);
  setVal('CZ', fmtDate(ficha.eco1Fecha) || fmtDate(ecografias[0]?.fechaRealizada));
  setVal('DA', ficha.eco1Interpretacion || ecografias[0]?.notas || ecografias[0]?.descripcion);

  // 4. Controles Prenatales
  const mapControl = (n, ctrl) => {
      if (!ctrl) return;
      let fFecha, fEsp, fEg, fTa, fRiesgo, fAro, fTalla, fPeso, fImc, fNutr;
      if (n===1) { fFecha='BU'; fTa='BZ'; fPeso='CF'; fImc='CG'; fNutr='CH'; } 
      if (n===2) { fFecha='DF'; fEsp='DG'; fEg='DH'; fTa='DI'; fRiesgo='DJ'; fAro='DK'; fTalla='DL'; fPeso='DM'; fImc='DN'; fNutr='DO'; }
      if (n===3) { fFecha='DV'; fEsp='DW'; fEg='DX'; fTa='DY'; fRiesgo='DZ'; fAro='EA'; fTalla='EB'; fPeso='EC'; fImc='ED'; fNutr='EE'; }
      if (n===4) { fFecha='EK'; fEsp='EL'; fEg='EM'; fTa='EN'; fRiesgo='EO'; fAro='EP'; fTalla='EQ'; fPeso='ER'; fImc='ES'; fNutr='ET'; }
      if (n===5) { fFecha='FA'; fEsp='FB'; fEg='FC'; fTa='FD'; fRiesgo='FE'; fAro='FF'; fTalla='FG'; fPeso='FH'; fImc='FI'; fNutr='FJ'; }
      if (n===6) { fFecha='GI'; fEsp='GJ'; fEg='GK'; fTa='GL'; fRiesgo='GM'; fAro='GO'; fTalla='GP'; fPeso='GQ'; fImc='GR'; fNutr='GS'; }
      if (n===7) { fFecha='GZ'; fEsp='HA'; fEg='HB'; fTa='HC'; fRiesgo='HD'; fAro='HE'; fTalla='HF'; fPeso='HG'; fImc='HH'; fNutr='HI'; }
      if (n===8) { fFecha='HO'; fEsp='HP'; fEg='HQ'; fTa='HR'; fRiesgo='HS'; fAro='HT'; fTalla='HU'; fPeso='HV'; fImc='HW'; fNutr='HX'; }
      if (n===9) { fFecha='IE'; fEsp='IF'; fEg='IG'; fTa='IH'; fRiesgo='II'; fAro='IJ'; fTalla='IK'; fPeso='IL'; fImc='IM'; fNutr='IN'; }
      if (n===10){ fFecha='IV'; fEsp='IW'; fEg='IX'; fTa='IY'; fRiesgo='IZ'; fAro='JA'; fTalla='JB'; fPeso='JC'; fImc='JD'; fNutr='JE'; }
      if (n===11){ fFecha='JK'; fEsp='JL'; fEg='JM'; fTa='JN'; fRiesgo='JO'; fAro='JP'; fTalla='JQ'; fPeso='JR'; fImc='JS'; fNutr='JT'; }

      if(fFecha) setVal(fFecha, fmtDate(ctrl.fechaRealizada));
      if(fEsp) setVal(fEsp, ctrl.prestadores?.map(p=>p.nombre).join(', '));
      if(fEg) setVal(fEg, ctrl.edadGestacional);
      if(fTa) setVal(fTa, ctrl.tensionArterial);
      if(fRiesgo) setVal(fRiesgo, ctrl.riesgoObstetrico);
      if(fAro) setVal(fAro, ctrl.diagnosticoAro);
      if(fPeso) setVal(fPeso, ctrl.peso);
      if(fImc) setVal(fImc, ctrl.imc);
      if(fNutr) setVal(fNutr, ctrl.clasificacionNutricional);
  };
  for (let i = 0; i < 11; i++) mapControl(i+1, controles[i]);

  // 5. Paraclínicos 2do trimestre y 3er trimestre
  setVal('FQ', ficha.hemoglobina2Resultado);
  setVal('FT', ficha.ptogResultado);
  setVal('FU', ficha.vihResultado); 
  setVal('FV', fmtDate(ficha.vihFecha));
  setVal('FW', ficha.sifilis1Resultado); 
  setVal('FX', fmtDate(ficha.sifilis1Fecha));
  setVal('GA', fmtDate(ficha.eco2Fecha));
  setVal('GB', ficha.eco2Interpretacion);

  setVal('GD', ficha.sifilisDiagnostico);
  setVal('GE', ficha.sifilisSemanasTratamiento);
  setVal('GF', ficha.sifilisTratamiento);
  setVal('GG', ficha.sifilisCompleto);
  setVal('GH', ficha.sifilisContactos);

  // 6. Vacunas
  setVal('KO', ficha.toxoideTetanico);
  setVal('KP', ficha.tdap);
  setVal('KQ', ficha.influenza);
  setVal('KR', fmtDate(ficha.covid1Fecha));
  setVal('KS', fmtDate(ficha.covid2Fecha));

  // 7. Resultado Parto y RN
  setVal('LM', ficha.presentoMme);
  setVal('LN', ficha.dxMme);
  setVal('LO', ficha.zikaGestacion);

  setVal('LP', ficha.institucionParto);
  setVal('LQ', ficha.eventoObstetrico || ficha.tipoParto);
  setVal('LR', fmtDate(ficha.fechaParto));
  setVal('LS', ficha.partoHumanizado);
  setVal('LT', ficha.lactanciaExclusiva);
  setVal('LW', ficha.pesoRN);
  setVal('LX', ficha.tallaRN);
  setVal('LV', ficha.estadoRecienNacido);
  setVal('LZ', fmtDate(ficha.tshRnFecha));
  setVal('MA', ficha.tshRnResultado);
  setVal('MB', ficha.tamizajeAuditivoRn);
  setVal('MC', fmtDate(ficha.altaRnFecha));
  setVal('MD', fmtDate(ficha.consultaRnFecha));
  setVal('ME', fmtDate(ficha.altaPuerperaFecha));
  setVal('MF', fmtDate(ficha.consultaPuerperaFecha));
  setVal('MG', ficha.metodoPostparto);
  setVal('MH', ficha.metodoElegido);
  setVal('MI', ficha.entregaMedicamentos);
  setVal('MJ', ficha.motivoCierre);

  return row;
}

async function generateFomagExcel(maternas) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Cohorte Materno Perinatal');

  // ─── FORMATO DE ENCABEZADOS ───
  // Estilo base para encabezados principales
  const headerStyle = {
    font: { bold: true, color: { argb: 'FFFFFFFF' }, size: 9, name: 'Arial' },
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F4E78' } },
    alignment: { vertical: 'middle', horizontal: 'center', wrapText: true },
    border: {
      top: { style: 'thin', color: { argb: 'FFBFBFBF' } },
      left: { style: 'thin', color: { argb: 'FFBFBFBF' } },
      bottom: { style: 'thin', color: { argb: 'FFBFBFBF' } },
      right: { style: 'thin', color: { argb: 'FFBFBFBF' } }
    }
  };

  const setHeader = (ref, value, mergeTo = null) => {
    const cell = sheet.getCell(ref);
    cell.value = value;
    cell.style = headerStyle;
    if (mergeTo) {
      sheet.mergeCells(`${ref}:${mergeTo}`);
    }
  };

  // Ajustamos altura de las filas de encabezado
  sheet.getRow(8).height = 40;
  sheet.getRow(9).height = 30;
  sheet.getRow(10).height = 40;
  sheet.getRow(11).height = 60;

  // ─── PARTE 1 DEL MAPA (Fila 8) ───
  // Individuales
  setHeader('A8', 'CONSECUTIVO');
  setHeader('B8', 'REGION');
  setHeader('C8', 'IPS DE ATENCIÓN');
  setHeader('D8', 'CODIGO DE HABILITACION DE IPS');
  setHeader('E8', 'DEPARTAMENTO');
  setHeader('F8', 'MUNICIPIO');
  setHeader('G8', 'NOMBRES');
  setHeader('H8', 'APELLIDOS');
  setHeader('I8', 'TIPO DE IDENTIFICACIÓN');
  setHeader('J8', 'No DE IDENTIFICACION');
  setHeader('K8', 'ESTADO CIVIL');
  setHeader('L8', 'FECHA DE NACIMIENTO GESTANTE');
  setHeader('M8', 'EDAD ACTUAL EN AÑOS');
  setHeader('N8', 'ESCOLARIDAD');
  setHeader('O8', 'MUNICIPIO DE RESIDENCIA');
  setHeader('P8', 'DIRECCION');
  setHeader('Q8', 'BARRIO');
  setHeader('R8', 'TELEFONO CEL Nº 1');
  setHeader('S8', 'TELEFONO CEL Nº 2');
  setHeader('T8', 'OCUPACION/OFICIO');

  // Combinados
  setHeader('U8', 'ENFOQUE DIFERENCIAL');
  setHeader('Y8', 'CARACTERIZACION DE LA POBLACION GESTANTE');
  setHeader('Z8', 'ETAPA PRECONCEPCIONAL');
  setHeader('AD8', 'INSCRIPCION AL CONTROL PRENATAL');
  setHeader('AW8', 'ANTECEDENTES GINECOBSTETRICOS', 'BF10');
  setHeader('BG8', 'ANTECEDENTES PERSONALES', 'BM10');
  setHeader('BN8', 'ANTECEDENTES FAMILIARES');
  setHeader('BO8', 'MEDIDAS ANTROPOMETRICAS AL INICIO CPN', 'BS10');
  setHeader('BT8', 'VALORACION DE MEDICO GINECOOBSTETRA', 'CL8');
  setHeader('CM8', 'PARACLINICOS PRIMER TRIMESTRE ( SEMANA 1 HASTA LA 12)');
  setHeader('DF8', 'SEGUNDO CONTROL PRENATAL', 'DS8');
  setHeader('DU8', 'TERCER CONTROL PRENATAL', 'EI8');
  setHeader('EK8', 'CUARTO CONTROL PRENATAL', 'EX8');
  setHeader('EZ8', 'QUINTO CONTROL PRENATAL', 'FN8');
  setHeader('FP8', 'CLASIFICACION DEL RIESGO BPS DURANTE EL SEGUNDO TRIMESTRE');
  setHeader('FQ8', 'PARACLINICOS SEGUNDO TRIMESTRE ( SEMANA 13 A LA 26)');
  setHeader('GD8', 'TAMIZAJE DE SIFILIS', 'GH8');
  setHeader('GI8', 'SEXTO CONTROL PRENATAL', 'GX8');
  setHeader('GY8', 'SEPTIMO CONTROL PRENATAL', 'HN8');
  setHeader('HO8', 'OCTAVO CONTROL PRENATAL', 'IC8');
  setHeader('ID8', 'NOVENO CONTROL PRENATAL', 'IU8');
  setHeader('IV8', 'DECIMO CONTROL PRENATAL', 'JJ8');
  setHeader('JK8', 'ONCEAVO CONTROL PRENATAL', 'JY8');
  setHeader('JZ8', 'GESTANTE CON 4 O MÁS CPN');
  setHeader('KA8', 'ADHRENCIA AL CONTROL PRENATAL');
  setHeader('KB8', 'CAUSA DE NO ADHERENCIA AL CNP');
  setHeader('KC8', 'PARACLINICOS TERCER TRIMESTRE ( SEMANA 26 HASTA EL PARTO)', 'KK8');
  setHeader('KL8', 'FECHA DE VALORACION ANTENATAL O POR PEDIATRIA');
  setHeader('KM8', 'ASESORIA IVE');
  setHeader('KN8', 'FECHA ASESORIA EN ANTICONCEPCIÓN SEM 28 A 34');
  setHeader('KO8', 'VACUNACIÓN', 'KS10');
  setHeader('KT8', 'CURSOS PREPARACION PARA LA MATERNIDAD Y LA PATERNIDAD', 'KZ8');
  setHeader('LA8', 'CONSULTAS', 'LJ8');
  setHeader('LK8', 'FECHA ENTREGA Y ASESORIA DE PRESERVATIVO');
  setHeader('LL8', 'FECHA DE CONSEJERIA EN LACTANCIA MATERNA PRENATAL');
  setHeader('LM8', 'EVENTOS DE NOTIFICACION Y SEGUIMIENTO', 'LO8');
  setHeader('LP8', 'INFORMACION POSPARTO-RN', 'MF8');
  setHeader('MG8', 'PLANIFICACION POST EVENTO', 'MJ8');
  
  // Seguimientos 
  setHeader('MK8', 'SEGUIMIENTO 1', 'ML10');
  setHeader('MM8', 'SEGUIMIENTO 2', 'MN10'); 
  setHeader('MO8', 'SEGUIMIENTO 3', 'MP10');
  setHeader('MQ8', 'SEGUIMIENTO 4', 'MR10');
  setHeader('MS8', 'SEGUIMIENTO 5', 'MT10');
  setHeader('MU8', 'SEGUIMIENTO 6', 'MV10');
  setHeader('MW8', 'SEGUIMIENTO 7', 'MX10');
  setHeader('MY8', 'SEGUIMIENTO 8', 'MZ10');
  setHeader('NA8', 'SEGUIMIENTO 9', 'NB10');
  setHeader('NC8', 'SEGUIMIENTO 10', 'ND10');
  setHeader('NE8', 'SEGUIMIENTO 11', 'NF10');

  // ─── PARTE 2 DEL MAPA (Fila 10) ───
  setHeader('U10', 'ETNIA');
  setHeader('V10', 'IDENTIDAD DE GENERO');
  setHeader('W10', 'DISCAPACIDAD');
  setHeader('X10', 'VICTIMA DE VIOLENCIA');
  setHeader('Z10', 'RECIBIO ATENCION PRECONCEPCIONAL ANTES DEL ACTUAL EMBARAZO (PLANEADO)');
  setHeader('AA10', 'RECIBIO ASESORIA Y PROVISION DE METODO ANTICONCEPTIVO PREEVENTO OBSTETRICO POR PARTE DEL PRESTADOR PRIMARIO');
  setHeader('AB10', 'RECIBIO ACIDO FOLICO DURANTE LOS 3 MESES ANTERIORES A LA GESTACION');
  setHeader('AC10', '¿A CUANTAS CITAS PRECONCEPCIONALES ASISTIO?');
  setHeader('AD10', 'FECHA DE INSCRIPCION AL CPN POR MEDICO GENERAL (DD/MM/AAA)');
  setHeader('AE10', 'EDAD GESTACIONAL AL INICIO DE CNP (INGRESO AL CONTROL PRENATAL)');
  setHeader('AF10', 'EMBARAZO DESEADO');
  setHeader('AG10', '¿TIENE RED DE APOYO FAMILIAR/SOCIAL?');
  setHeader('AH10', 'SE REALIZO TAMIZAJE DE VIOLENCIA');
  setHeader('AI10', 'SE REALIZO TAMIZAJE DE DEPRESION SEGÚN ESCALA HERRERA Y HURTADO');
  setHeader('AJ10', 'TAMIZAJE Y RESULTADO DE SIFILIS');
  setHeader('AK10', 'FECHA DE RESULTADO DE SIFILIS');
  setHeader('AL10', 'TAMIZACIÓN Y RESULTADO DE PRUEBA RAPIDA DE VIH');
  setHeader('AM10', 'FECHA DE RESULTADO VIH');
  setHeader('AN10', 'TAMIZAJE Y RESULTADO DE PRUEBA RAPIDA DE HBSAG');
  setHeader('AO10', 'FECHA DE RESULTADOS DE HBSAG');
  setHeader('AP10', 'TAMIZAJE DE CHAGAS');
  setHeader('AQ10', 'FUR');
  setHeader('AR10', 'EDAD GESTACIONAL ACTUAL');
  setHeader('AS10', 'EDAD GESTACIONAL POR ECOGRAFIA');
  setHeader('AT10', 'FPP');
  setHeader('AU10', 'CLASIFICACION DEL RIESGO OBSTETRICO ACTUAL');
  setHeader('AV10', 'DIAGNOSTICO ESCRITO DE ARO (ACTUALIZADO)');
  
  setHeader('BT10', 'FECHA DE EDUCACION INDIVIDUAL POR ENFERMERIA');
  setHeader('BU10', '1 CPN');
  setHeader('BV10', 'CLASIFICACION DEL RIESGO OBSTETRICO (AL INGRESO DEL CPN)');
  setHeader('BW10', 'DIAGNOSTICO DESCRITO DE ARO');
  setHeader('BX10', 'CLASIFICACION DEL RIESGO PSICOSOCIAL');
  setHeader('BY10', 'ATRIBUTO EVALUADO DE RIESGO PSICOSOCIAL');
  setHeader('BZ10', 'RIESGO DE HIPERTENSION');
  setHeader('CA10', 'RIESGO DE PREECLAMPSIA');
  setHeader('CB10', 'CLASIFICACIÓN DEL RIESGO TROMBOEMBÓLICO AL INGRESO DEL CONTROL PRENATAL');
  setHeader('CC10', 'PRESCRIPCIÓN DE ASA');
  setHeader('CD10', 'EDAD GESTACIONAL');
  setHeader('CE10', 'TALLA (CM)');
  setHeader('CF10', 'PESO ACTUAL (kg)');
  setHeader('CG10', 'IMC GESTACIONAL');
  setHeader('CH10', 'CLASIFICACION DEL RIESGO NUTRICIONAL');
  
  setHeader('CI10', 'MICRONUTRIENTES', 'CL10'); // Combinado
  
  setHeader('CM10', 'RESULTADO HEMOCLASIFICACION');
  setHeader('CN10', 'RESULTADO HEMOGRAMA', 'CP10'); // Combinado
  setHeader('CQ10', 'RESULTADO GLICEMIA');
  setHeader('CR10', 'RESULTADO IgG PARA RUBEOLA');
  setHeader('CS10', 'RESULTADO IgG E IgM PARA TOXOPLASMA/IGA Y AVIDEZ (INICIAL)');
  setHeader('CW10', 'UROCULTIVO');
  setHeader('CX10', 'HEMOPARASITOS (GOTA GRUESA) EN ZONA ENDEMICA');
  setHeader('CY10', 'RESULTADO DE CHAGAS (RESIDENCIA O PROCEDENCIA DE GESTANTE)');
  
  setHeader('CZ10', 'FECHA DE ECOGRAFIA 1 TRIMESTRE');
  setHeader('DA10', 'INTERPRETACION DE LA ECOGRAFIA');
  
  setHeader('DB10', 'MICRONUTRIENTES', 'DE10'); // Combinado
  
  // SEGUNDO CONTROL PRENATAL (DF-DS)
  setHeader('DF10', 'FECHA CPN');
  setHeader('DG10', 'ESPECIALIDAD QUE ATIENDE EL CONTROL PRENATAL');
  setHeader('DH10', 'EDAD GESTACIONAL');
  setHeader('DI10', 'TENSION ARTERIAL');
  setHeader('DJ10', 'CLASIFICACION DEL RIESGO OBSTETRICO (AL INGRESO DEL CPN)');
  setHeader('DK10', 'DIAGNOSTICO ESCRITO DE ARO');
  setHeader('DL10', 'TALLA (CM)');
  setHeader('DM10', 'PESO ACTUAL (kg)');
  setHeader('DN10', 'IMC GESTACIONAL');
  setHeader('DO10', 'CLASIFICACION DEL RIESGO NUTRICIONAL');
  setHeader('DP10', 'MICRONUTRIENTES', 'DS10'); // Combinado
  setHeader('DT10', 'RESULTADO TOXOPLASMA IGM DE CONTROL MENSUAL');
  
  // TERCER CONTROL PRENATAL (DU-EI)
  setHeader('DU10', 'FECHA DE EDUCACION INDIVIDUAL POR ENFERMERIA');
  setHeader('DV10', 'FECHA CPN (MEDICO/GINECOOBSTETRA)');
  setHeader('DW10', 'ESPECIALIDAD QUE ATIENDE EL CONTROL PRENATAL');
  setHeader('DX10', 'EDAD GESTACIONAL');
  setHeader('DY10', 'TENSION ARTERIAL');
  setHeader('DZ10', 'CLASIFICACION DEL RIESGO OBSTETRICO (AL INGRESO DEL CPN)');
  setHeader('EA10', 'DIAGNOSTICO ESCRITO DE ARO');
  setHeader('EB10', 'TALLA (CM)');
  setHeader('EC10', 'PESO ACTUAL (kg)');
  setHeader('ED10', 'IMC GESTACIONAL');
  setHeader('EE10', 'CLASIFICACION DEL RIESGO NUTRICIONAL');
  setHeader('EF10', 'MICRONUTRIENTES', 'EI10'); // Combinado
  setHeader('EJ10', 'RESULTADO TOXOPLASMA IGM DE CONTROL MENSUAL');

  // CUARTO CONTROL PRENATAL (EK-EX)
  setHeader('EK10', 'FECHA CPN (MEDICO/GINECOOBSTETRA)');
  setHeader('EL10', 'ESPECIALIDAD QUE ATIENDE EL CONTROL PRENATAL');
  setHeader('EM10', 'EDAD GESTACIONAL');
  setHeader('EN10', 'TENSION ARTERIAL');
  setHeader('EO10', 'CLASIFICACION DEL RIESGO OBSTETRICO (AL INGRESO DEL CPN)');
  setHeader('EP10', 'DIAGNOSTICO ESCRITO DE ARO');
  setHeader('EQ10', 'TALLA (CM)');
  setHeader('ER10', 'PESO ACTUAL (kg)');
  setHeader('ES10', 'IMC GESTACIONAL');
  setHeader('ET10', 'CLASIFICACION DEL RIESGO NUTRICIONAL');
  setHeader('EU10', 'MICRONUTRIENTES', 'EX10'); // Combinado
  setHeader('EY10', 'RESULTADO TOXOPLASMA IGM DE CONTROL MENSUAL');

  // QUINTO CONTROL PRENATAL (EZ-FN)
  setHeader('EZ10', 'FECHA DE EDUCACION INDIVIDUAL POR ENFERMERIA');
  setHeader('FA10', 'FECHA CPN (MEDICO/GINECOOBSTETRA)');
  setHeader('FB10', 'ESPECIALIDAD QUE ATIENDE EL CONTROL PRENATAL');
  setHeader('FC10', 'EDAD GESTACIONAL');
  setHeader('FD10', 'TENSION ARTERIAL');
  setHeader('FE10', 'CLASIFICACION DEL RIESGO OBSTETRICO (AL INGRESO DEL CPN)');
  setHeader('FF10', 'DIAGNOSTICO ESCRITO DE ARO');
  setHeader('FG10', 'TALLA (CM)');
  setHeader('FH10', 'PESO ACTUAL (kg)');
  setHeader('FI10', 'IMC GESTACIONAL');
  setHeader('FJ10', 'CLASIFICACION DEL RIESGO NUTRICIONAL');
  setHeader('FK10', 'MICRONUTRIENTES', 'FN10'); // Combinado
  setHeader('FO10', 'RESULTADO TOXOPLASMA IGM DE CONTROL MENSUAL');

  // PARACLINICOS SEGUNDO TRIMESTRE
  setHeader('FQ10', 'HEMOGRAMA', 'FS10'); // Combinado
  setHeader('FT10', 'RESULTADO PRUEBA DE TOLERANCIA A LA GLUCOSA(PTOG)CON 75 GR DE GLUCOSA');
  setHeader('FU10', 'TAMIZACION Y RESULTADO DE PRUEBA RAPIDA DE VIH');
  setHeader('FV10', 'FECHA DE PRUEBA RAPIDA DE VIH');
  setHeader('FW10', 'TAMIZAJE Y RESULTADO DE SIFILIS');
  setHeader('FX10', 'FECHA DE RESULTADO DE SIFILIS');
  setHeader('FY10', 'RESULTADO TOXOPLASMA IGM DE CONTROL MENSUAL');
  setHeader('FZ10', 'HEMOPARASITOS (GOTA GRUESA) EN ZONA ENDEMICA (MENSUAL)');
  setHeader('GA10', 'FECHA DE LA ECOGRAFIA SEMANA DE DETALLE (18 Y 23 + 6 SEMANAS)');
  setHeader('GB10', 'INTERPRETACION DE LA ECOGRAFIAS');
  setHeader('GC10', 'RESULTADO TAMIZAJE PARA LESIONES PREMALIGNAS DE CERVIX (CCU)');

  // TAMIZAJE DE SIFILIS
  setHeader('GD10', 'DIAGNOSTICO DE SIFILIS');
  setHeader('GE10', 'EDAD GESTACIONAL DE INICIO DE TRATAMIENTO PARA SIFILIS');
  setHeader('GF10', 'TRATAMIENTO');
  setHeader('GG10', 'COMPLETO TRATAMIENTO OPORTUNO EN LA GESTANTE');
  setHeader('GH10', 'NUMERO CONTACTOS SEXUALES TRATADOS OPORTUNAMENTE');

  // SEXTO CONTROL PRENATAL
  setHeader('GI10', 'FECHA CPN (MEDICO/GINECOOBSTETRA)');
  setHeader('GJ10', 'ESPECIALIDAD QUE ATIENDE EL CONTROL PRENATAL');
  setHeader('GK10', 'EDAD GESTACIONAL EN SEMANAS');
  setHeader('GL10', 'TENSION ARTERIAL');
  setHeader('GM10', 'CLASIFICACION DEL RIESGO OBSTETRICO (AL INGRESO DEL CPN)');
  setHeader('GN10', 'CLASIFICACION DEL RIESGO OBSTETRICO (AL INGRESO DEL CPN)');
  setHeader('GO10', 'DIAGNOSTICO ESCRITO DE ARO');
  setHeader('GP10', 'TALLA (CM)');
  setHeader('GQ10', 'PESO ACTUAL (kg)');
  setHeader('GR10', 'IMC GESTACIONAL');
  setHeader('GS10', 'CLASIFICACION DEL RIESGO NUTRICIONAL');
  setHeader('GT10', 'MICRONUTRIENTES', 'GW10'); // Combinado
  setHeader('GX10', 'RESULTADO TOXOPLASMA IGM MENSUAL');

  // SEPTIMO CONTROL PRENATAL
  setHeader('GY10', 'FECHA DE EDUCACION INDIVIDUAL POR ENFERMERIA');
  setHeader('GZ10', '7 CPN (MEDICO/GINECOOBSTETRA)');
  setHeader('HA10', 'ESPECIALIDAD QUE ATIENDE EL CONTROL PRENATAL');
  setHeader('HB10', 'EDAD GESTACIONAL EN SEMANAS');
  setHeader('HC10', 'TENSION ARTERIAL');
  setHeader('HD10', 'CLASIFICACION DEL RIESGO OBSTETRICO (AL INGRESO DEL CPN)');
  setHeader('HE10', 'DIAGNOSTICO ESCRITO DE ARO');
  setHeader('HF10', 'TALLA (CM)');
  setHeader('HG10', 'PESO ACTUAL (kg)');
  setHeader('HH10', 'IMC GESTACIONAL');
  setHeader('HI10', 'CLASIFICACION DEL RIESGO NUTRICIONAL');
  setHeader('HJ10', 'MICRONUTRIENTES', 'HM10'); // Combinado
  setHeader('HN10', 'RESULTADO TOXOPLASMA IGM MENSUAL');

  // OCTAVO CONTROL PRENATAL
  setHeader('HO10', 'FECHA CPN (MEDICO/GINECOOBSTETRA)');
  setHeader('HP10', 'ESPECIALIDAD QUE ATIENDE EL CONTROL PRENATAL');
  setHeader('HQ10', 'EDAD GESTACIONAL EN SEMANAS');
  setHeader('HR10', 'TENSION ARTERIAL');
  setHeader('HS10', 'CLASIFICACION DEL RIESGO OBSTETRICO (AL INGRESO DEL CPN)');
  setHeader('HT10', 'DIAGNOSTICO ESCRITO DE ARO');
  setHeader('HU10', 'TALLA (CM)');
  setHeader('HV10', 'PESO ACTUAL (kg)');
  setHeader('HW10', 'IMC GESTACIONAL');
  setHeader('HX10', 'CLASIFICACION DEL RIESGO NUTRICIONAL');
  setHeader('HY10', 'MICRONUTRIENTES', 'IB10'); // Combinado
  setHeader('IC10', 'RESULTADO TOXOPLASMA IGM MENSUAL');

  // NOVENO CONTROL PRENATAL
  setHeader('ID10', 'FECHA DE EDUCACION INDIVIDUAL POR ENFERMERIA');
  setHeader('IE10', 'FECHA CPN (MEDICO/GINECOOBSTETRA)');
  setHeader('IF10', 'ESPECIALIDAD QUE ATIENDE EL CONTROL PRENATAL');
  setHeader('IG10', 'EDAD GESTACIONAL');
  setHeader('IH10', 'TENSION ARTERIAL');
  setHeader('II10', 'CLASIFICACION DEL RIESGO OBSTETRICO (AL INGRESO DEL CPN)');
  setHeader('IJ10', 'DIAGNOSTICO ESCRITO DE ARO');
  setHeader('IK10', 'TALLA (CM)');
  setHeader('IL10', 'PESO ACTUAL (kg)');
  setHeader('IM10', 'IMC GESTACIONAL');
  setHeader('IN10', 'CLASIFICACION DEL RIESGO NUTRICIONAL');
  setHeader('IO10', 'RESULTADO TOXOPLASMA IGM MENSUAL');
  setHeader('IP10', 'CLASIFICACION DEL RIESGO TROMBOEMBOLICO SEMANA 28');
  setHeader('IQ10', 'CLASIFICACION DEL RIESGO PSICOSOCIAL DURANTE EL TERCER TRIMESTRE');
  setHeader('IR10', 'MICRONUTRIENTES', 'IU10'); // Combinado

  // DECIMO CONTROL PRENATAL
  setHeader('IV10', '10 CPN (MEDICO/GINECOOBSTETRA)');
  setHeader('IW10', 'ESPECIALIDAD QUE ATIENDE EL CONTROL PRENATAL');
  setHeader('IX10', 'EDAD GESTACIONAL EN SEMANAS');
  setHeader('IY10', 'TENSION ARTERIAL');
  setHeader('IZ10', 'CLASIFICACION DEL RIESGO OBSTETRICO (AL INGRESO DEL CPN)');
  setHeader('JA10', 'DIAGNOSTICO ESCRITO DE ARO');
  setHeader('JB10', 'TALLA (CM)');
  setHeader('JC10', 'PESO ACTUAL (kg)');
  setHeader('JD10', 'IMC GESTACIONAL');
  setHeader('JE10', 'CLASIFICACION DEL RIESGO NUTRICIONAL');
  setHeader('JF10', 'MICRONUTRIENTES', 'JI10'); // Combinado
  setHeader('JJ10', 'RESULTADO TOXOPLASMA IGM MENSUAL');

  // ONCEAVO CONTROL PRENATAL
  setHeader('JK10', '11 CPN (MEDICO/GINECOOBSTETRA)');
  setHeader('JL10', 'ESPECIALIDAD QUE ATIENDE EL CONTROL PRENATAL');
  setHeader('JM10', 'EDAD GESTACIONAL EN SEMANAS');
  setHeader('JN10', 'TENSION ARTERIAL');
  setHeader('JO10', 'CLASIFICACION DEL RIESGO OBSTETRICO (AL INGRESO DEL CPN)');
  setHeader('JP10', 'DIAGNOSTICO ESCRITO DE ARO');
  setHeader('JQ10', 'TALLA (CM)');
  setHeader('JR10', 'PESO ACTUAL (kg)');
  setHeader('JS10', 'IMC GESTACIONAL');
  setHeader('JT10', 'CLASIFICACION DEL RIESGO NUTRICIONAL');
  setHeader('JU10', 'MICRONUTRIENTES', 'JX10'); // Combinado
  setHeader('JY10', 'RESULTADO TOXOPLASMA IGM MENSUAL');

  // PARACLINICOS TERCER TRIMESTRE
  setHeader('KC10', 'HEMOGRAMA SEMANA 28', 'KE10'); // Combinado
  setHeader('KF10', 'HEMOPARASITOS (GOTA GRUESA) EN ZONA ENDEMICA');
  setHeader('KG10', 'TAMIZACION Y RESULTADO DE PRUEBA RAPIDA DE VIH');
  setHeader('KH10', 'FECHA DE RESULTADO VIH');
  setHeader('KI10', 'TAMIZACION Y RESULTADO DE SIFILIS');
  setHeader('KJ10', 'FECHA DE RESULTADO SIFILIS');
  setHeader('KK10', 'TAMIZAJE ESTREPTOCOCO DEL GRUPO B');

  // ASESORIA IVE
  setHeader('KM10', 'VALORACIÓN INTEGRAL ORIENTACIÓN Y ASESORÍA FRENTE A IVE');

  // CURSOS PREPARACION PARA LA MATERNIDAD Y LA PATERNIDAD
  setHeader('KT10', 'FECHA PRIMER ENCUENTRO ANTES DE SEMANA 14');
  setHeader('KU10', 'FECHA SEGUNDO ENCUENTRO Y PREPARACION');
  setHeader('KV10', 'FECHA TERCER ENCUENTRO Y PREPARACION');
  setHeader('KW10', 'FECHA CUARTO ENCUENTRO Y PREPARACION');
  setHeader('KX10', 'FECHA QUINTO ENCUENTRO Y PREPARACION');
  setHeader('KY10', 'FECHA SEXTO ENCUENTRO Y PREPARACION');
  setHeader('KZ10', 'FECHA SEPTIMO ENCUENTRO Y PREPARACION');

  // CONSULTAS
  setHeader('LA10', 'NUTRICION', 'LC10'); // Combinado
  setHeader('LD10', 'ODONTOLOGIA', 'LE10'); // Combinado
  setHeader('LF10', 'PSICOLOGIA', 'LH10'); // Combinado
  setHeader('LI10', 'TRABAJO SOCIAL', 'LJ10'); // Combinado

  // EVENTOS DE NOTIFICACION Y SEGUIMIENTO
  setHeader('LM10', 'PRESENTO MORBILDAD MATERNA EXTREMA');
  setHeader('LN10', 'DX CIE 10 DE MME');
  setHeader('LO10', 'INFECCION POR ZIKA DURANTE LA GESTACION');

  // INFORMACION POSPARTO-RN
  setHeader('LP10', 'INSTITUCION DEL PARTO');
  setHeader('LQ10', 'EVENTO OBSTERICO');
  setHeader('LR10', 'FECHA DEL EVENTO OBSTETRICO');
  setHeader('LS10', 'PARTO HUMANIZADO');
  setHeader('LT10', 'CONSEJERÌA POSTPARTO SOBRE LACTANCIA MATERNA EXCLUSIVA');
  setHeader('LU10', 'EDAD GESTACIONAL AL MOMENTO DEL PARTO');
  setHeader('LV10', 'RECIEN NACIDO');
  setHeader('LW10', 'MEDIDAS ANTROPOMETRICAS DEL RECIEN NACIDO', 'LY10'); // Combinado
  setHeader('LZ10', 'FECHA DE TSH');
  setHeader('MA10', 'RESULTADO DE TSH');
  setHeader('MB10', 'TAMIZAJE AUDITIVO DEL RECIEN NACIDO');
  setHeader('MC10', 'FECHA DE ALTA HOSPITALARIA RECIEN NACIDO (24 HORAS POSTERIOR A PARTO)');
  setHeader('MD10', 'FECHA DE CONSULTA DEL RECIEN NACIDO POSTERIOR A 5 DIAS DEL ALTA HOSPITALARIA');
  setHeader('ME10', 'FECHA DE ALTA HOSPITALARIA A LA PUERPERA ( PARTO VAGINAL 24 HORAS Y CESAREA 48 HORAS MINIMO)');
  setHeader('MF10', 'FECHA DE CONSULTA DE CONTROL DE LA PUERPERA MENOR A 5 DIAS POST EGRESO');

  // PLANIFICACION POST EVENTO
  setHeader('MG10', 'MUJER POST PARTO O POSTABORTO CON PROVISIÒN MÈTODO ANTICONCEPTIVO ANTES DEL ALTA HOSPITALARIA');
  setHeader('MH10', 'METODO ANTICONCEPTIVO ELEGIDO');
  setHeader('MI10', 'Entrega efectiva de medicamentos antes del egreso hospitalario segun requerimeinto');
  setHeader('MJ10', 'MOTIVO DE CIERRE DE CASO');

  // ─── PARTE 3 DEL MAPA (Fila 11) ───
  setHeader('AW11', 'GESTACIONES');
  setHeader('AX11', 'PARTOS VAGINALES');
  setHeader('AY11', 'CESAREA');
  setHeader('AZ11', 'VIVOS');
  setHeader('BA11', 'MORTINATO');
  setHeader('BB11', 'OBITO');
  setHeader('BC11', 'ABORTO');
  setHeader('BD11', 'MALFORMACION');
  setHeader('BE11', 'ECTOPICOS');
  setHeader('BF11', 'OTROS EVENTOS');
  
  setHeader('BG11', 'HIPERTENSION');
  setHeader('BH11', 'DIABETES MELLITUS');
  setHeader('BI11', 'LUPUS ERITEMATOSO');
  setHeader('BJ11', 'PREECLAMPSIA');
  setHeader('BK11', 'ECLAMPSIA');
  setHeader('BL11', 'DIABETES GESTACIONAL');
  setHeader('BM11', 'OTROS');
  
  setHeader('BO11', 'PESO PREGESTACIONAL (kg)');
  setHeader('BP11', 'TALLA (CM)');
  setHeader('BQ11', 'PESO ACTUAL (kg)');
  setHeader('BR11', 'IMC GESTACIONAL');
  setHeader('BS11', 'CLASIFICACION DEL RIESGO NUTRICIONAL');
  
  setHeader('CI11', 'ENTREGA DE MICRONUTRIENTES');
  setHeader('CJ11', 'HIERRO');
  setHeader('CK11', 'ACIDO FOLICO');
  setHeader('CL11', 'CALCIO');
  
  setHeader('CN11', 'HB');
  setHeader('CO11', 'HCTO');
  setHeader('CP11', 'PLAQUETAS');
  
  setHeader('CR11', 'IGG');
  setHeader('CS11', 'IGG'); 
  setHeader('CT11', 'IGM');
  setHeader('CU11', 'PRUEBA DE AVIDEZ (MENOR DE 16 SEM)');
  setHeader('CV11', 'IgA (MAYOR DE 16 SEM)');
  
  setHeader('CZ11', 'ECOGRAFIA SEMANA 10+ 6 DIAS Y 13 SEMANAS+ 6 DIAS(TAMIZAJE DE TRISOMIA 13, 18 Y 21)');
  
  setHeader('DB11', 'ENTREGA DE MICRONUTRIENTES');
  setHeader('DC11', 'HIERRO');
  setHeader('DD11', 'ACIDO FOLICO');
  setHeader('DE11', 'CALCIO');
  
  setHeader('DP11', 'ENTREGA DE MICRONUTRIENTES');
  setHeader('DQ11', 'HIERRO');
  setHeader('DR11', 'ACIDO FOLICO');
  setHeader('DS11', 'CALCIO');
  
  setHeader('EF11', 'ENTREGA DE MICRONUTRIENTES');
  setHeader('EG11', 'HIERRO');
  setHeader('EH11', 'ACIDO FOLICO');
  setHeader('EI11', 'CALCIO');
  
  setHeader('EU11', 'ENTREGA DE MICRONUTRIENTES');
  setHeader('EV11', 'HIERRO');
  setHeader('EW11', 'ACIDO FOLICO');
  setHeader('EX11', 'CALCIO');
  
  setHeader('FK11', 'ENTREGA DE MICRONUTRIENTES');
  setHeader('FL11', 'HIERRO');
  setHeader('FM11', 'ACIDO FOLICO');
  setHeader('FN11', 'CALCIO');
  
  setHeader('FQ11', 'HB');
  setHeader('FR11', 'HTO');
  setHeader('FS11', 'PLAQUETAS');
  
  setHeader('GT11', 'ENTREGA DE MICRONUTRIENTES');
  setHeader('GU11', 'HIERRO');
  setHeader('GV11', 'ACIDO FOLICO');
  setHeader('GW11', 'CALCIO');
  
  setHeader('HJ11', 'ENTREGA DE MICRONUTRIENTES');
  setHeader('HK11', 'HIERRO');
  setHeader('HL11', 'ACIDO FOLICO');
  setHeader('HM11', 'CALCIO');
  
  setHeader('HY11', 'ENTREGA DE MICRONUTRIENTES');
  setHeader('HZ11', 'HIERRO');
  setHeader('IA11', 'ACIDO FOLICO');
  setHeader('IB11', 'CALCIO');
  
  setHeader('IR11', 'ENTREGA DE MICRONUTRIENTES');
  setHeader('IS11', 'HIERRO');
  setHeader('IT11', 'ACIDO FOLICO');
  setHeader('IU11', 'CALCIO');
  
  setHeader('JF11', 'ENTREGA DE MICRONUTRIENTES');
  setHeader('JG11', 'HIERRO');
  setHeader('JH11', 'ACIDO FOLICO');
  setHeader('JI11', 'CALCIO');
  
  setHeader('KC11', 'HB');
  setHeader('KD11', 'HTO');
  setHeader('KE11', 'PLAQUETAS');
  
  setHeader('KK11', 'CULTIVO RECTO-VAGINAL');
  
  setHeader('KO11', 'FECHA TOXOIDE TETANICO');
  setHeader('KP11', 'FECHA TÈTANOS, DIFTERIA Y TOSFERINA ACELULAR');
  setHeader('KQ11', 'FECHA INFLUENZA ESTACIONAL');
  setHeader('KR11', 'FECHA COVID-19 PRIMERA DOSIS');
  setHeader('KS11', 'FECHA COVID-19 SEGUNDA DOSIS');
  
  setHeader('LA11', 'PRIMER CONTROL (1ER Y 2DO TRIMESTRE)');
  setHeader('LB11', 'SEGUNDO CONTROL (3ER TRIMESTRE)');
  setHeader('LC11', 'TERCER CONTROL');
  
  setHeader('LD11', 'PRIMER CONTROL (1 TRIMESTRE)');
  setHeader('LE11', 'SEGUNDO CONTROL (2 TRIMESTRE)');
  
  setHeader('LF11', 'PRIMER CONTROL (1ER Y 2DO TRIMESTRE)');
  setHeader('LG11', 'SEGUNDO CONTROL (3ER TRIMESTRE)');
  setHeader('LH11', 'TERCER CONTROL');
  
  setHeader('LI11', 'PRIMER CONTROL');
  setHeader('LJ11', 'SEGUNDO CONTROL');
  
  setHeader('LW11', 'PESO');
  setHeader('LX11', 'TALLA');
  setHeader('LY11', 'SEXO');
  
  setHeader('MK11', 'FECHA');
  setHeader('ML11', 'OBSERVACIÓN');
  setHeader('MM11', 'FECHA');
  setHeader('MN11', 'OBSERVACIÓN');
  setHeader('MO11', 'FECHA');
  setHeader('MP11', 'OBSERVACIÓN');
  setHeader('MQ11', 'FECHA');
  setHeader('MR11', 'OBSERVACIÓN');
  setHeader('MS11', 'FECHA');
  setHeader('MT11', 'OBSERVACIÓN');
  setHeader('MU11', 'FECHA');
  setHeader('MV11', 'OBSERVACIÓN');
  setHeader('MW11', 'FECHA');
  setHeader('MX11', 'OBSERVACIÓN');
  setHeader('MY11', 'FECHA');
  setHeader('MZ11', 'OBSERVACIÓN'); // Corregida la errata de M 11 a MZ11
  setHeader('NA11', 'FECHA');
  setHeader('NB11', 'OBSERVACIÓN');
  setHeader('NC11', 'FECHA');
  setHeader('ND11', 'OBSERVACIÓN');
  setHeader('NE11', 'FECHA');
  setHeader('NF11', 'OBSERVACIÓN');

  // Asegurarnos de que TODAS las celdas del bloque de encabezados (Filas 8 a 11) tengan el color de fondo y borde, incluso si quedaron en blanco
  for (let r = 8; r <= 11; r++) {
    const row = sheet.getRow(r);
    for (let c = 1; c <= colToNum('NF'); c++) {
      const cell = row.getCell(c);
      // Aplicar el estilo si la celda no lo tiene
      if (!cell.value && (!cell.style || !cell.style.fill)) {
        cell.style = headerStyle;
      }
    }
  }

  // ─── AJUSTE DE ANCHO DE COLUMNAS ───
  // Darle un ancho base de 16 a todas las columnas para que el texto envuelto no quede tan apretado
  for (let c = 1; c <= colToNum('NF'); c++) {
    sheet.getColumn(c).width = 18; 
  }

  // Ajustar columnas específicas que requieren más o menos espacio
  sheet.getColumn(colToNum('A')).width = 12; // Consecutivo
  sheet.getColumn(colToNum('G')).width = 25; // Nombres
  sheet.getColumn(colToNum('H')).width = 25; // Apellidos
  sheet.getColumn(colToNum('J')).width = 18; // Documento
  sheet.getColumn(colToNum('P')).width = 30; // Dirección
  sheet.getColumn(colToNum('AW')).width = 35; // Antecedentes

  // Datos empiezan en la fila 12 según el mapa
  maternas.forEach((materna, index) => {
    const flat = flattenMaterna(materna, index);
    const rowValues = [];
    for (let i = 1; i <= colToNum('NF'); i++) {
        rowValues[i] = flat[i] || '';
    }
    const dataRow = sheet.getRow(12 + index);
    dataRow.values = rowValues;
    dataRow.height = 25; // Dar un poco de altura para el texto envuelto

    // Aplicar bordes y ajuste de texto a cada celda de datos
    dataRow.eachCell({ includeEmpty: true }, (cell) => {
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFBFBFBF' } },
        left: { style: 'thin', color: { argb: 'FFBFBFBF' } },
        bottom: { style: 'thin', color: { argb: 'FFBFBFBF' } },
        right: { style: 'thin', color: { argb: 'FFBFBFBF' } }
      };
      cell.alignment = { vertical: 'middle', wrapText: true };
    });
  });

  return await workbook.xlsx.writeBuffer();
}

module.exports = { generateFomagExcel };
