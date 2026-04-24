const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Sincroniza los eventos de una materna con las plantillas de su paquete asignado.
 * Versión simplificada: 1 registro por cada plantilla definida.
 */
async function syncMaternaWithPackage(maternaId, tx = prisma) {
  try {
    // 1. Obtener la materna con sus eventos y el paquete asignado
    // Nota: Aunque hayamos quitado paqueteId de Materna en el schema manual del usuario, 
    // su código de paquetes.js usa paqueteId en EventoMedico. 
    // Buscaremos el paquete a través del primer evento que tenga paqueteId.
    
    const someEvent = await tx.eventoMedico.findFirst({
        where: { maternaId, NOT: { paqueteId: null } },
        select: { paqueteId: true }
    });

    if (!someEvent) return null;

    const materna = await tx.materna.findUnique({
      where: { id: maternaId },
      include: { eventos: true }
    });

    const paquete = await tx.paqueteEventos.findUnique({
      where: { id: someEvent.paqueteId },
      include: { plantillas: true }
    });

    if (!materna || !paquete) return null;

    const plantillas = paquete.plantillas;
    const eventosActuales = materna.eventos;
    const startDate = new Date(materna.fechaEmbarazo);
    startDate.setHours(0, 0, 0, 0);

    const ops = [];

    for (const p of plantillas) {
      const evVinculado = eventosActuales.find(e => e.plantillaId === p.id);
      
      const fechaProgramada = new Date(startDate);
      fechaProgramada.setDate(fechaProgramada.getDate() + (p.semanasRelativas * 7));

      if (!evVinculado) {
        // Crear evento faltante
        ops.push({
          action: 'create',
          data: {
            tipo: p.tipo,
            descripcion: p.descripcion,
            fechaProgramada,
            esObligatorio: p.esObligatorio,
            esControl: p.esControl,
            codigoCUPS: p.codigoCUPS,
            cantidad: p.cantidad,
            trimestre: p.trimestre || paquete.trimestre,
            paqueteId: paquete.id,
            plantillaId: p.id,
            maternaId: materna.id,
            estado: 'PENDIENTE'
          }
        });
      } else if (evVinculado.estado === 'PENDIENTE') {
        const evDate = new Date(evVinculado.fechaProgramada);
        evDate.setHours(0, 0, 0, 0);

        const configCambio = 
          evVinculado.tipo !== p.tipo ||
          evVinculado.descripcion !== p.descripcion ||
          evDate.getTime() !== fechaProgramada.getTime();

        if (configCambio) {
          ops.push({
            action: 'update',
            id: evVinculado.id,
            data: {
              tipo: p.tipo,
              descripcion: p.descripcion,
              fechaProgramada
            }
          });
        }
      }
    }

    if (ops.length > 0) {
      for (const op of ops) {
        if (op.action === 'create') await tx.eventoMedico.create({ data: op.data });
        else if (op.action === 'update') await tx.eventoMedico.update({ where: { id: op.id }, data: op.data });
      }
      return true;
    }

    return false;
  } catch (error) {
    console.error(`Error sincronizando materna ${maternaId}:`, error);
    throw error;
  }
}

module.exports = {
  syncMaternaWithPackage
};
