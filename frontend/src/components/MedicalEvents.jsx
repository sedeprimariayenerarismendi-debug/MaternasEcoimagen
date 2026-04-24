import React, { useState, useEffect } from 'react';
import api from '../api';
import { 
  Calendar, 
  CheckCircle, 
  Clock, 
  Plus, 
  Trash2, 
  AlertCircle,
  AlertTriangle,
  FileText,
  Stethoscope,
  ChevronRight,
  X,
  Zap,
  CheckSquare,
  Package,
  User,
  Syringe,
  ChevronDown,
  Bell
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotification } from '../context/NotificationContext';

const MedicalEvents = ({ maternaId }) => {
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPackageModalOpen, setIsPackageModalOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('pendientes');
  const [metas, setMetas] = useState([]);
  const [paquetes, setPaquetesDisponibles] = useState([]);
  const [prestadoresList, setPrestadoresList] = useState([]);
  const [newPrestadorName, setNewPrestadorName] = useState('');
  const [currentTrimester, setCurrentTrimester] = useState(null);
  const [showAllTrimesters, setShowAllTrimesters] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [scheduleSearch, setScheduleSearch] = useState('');
  const [historySearch, setHistorySearch] = useState('');
  const [visibleLimit, setVisibleLimit] = useState(6);
  const [historyVisibleLimit, setHistoryVisibleLimit] = useState(10);
  
  // States for Completion Modal
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [completingEvent, setCompletingEvent] = useState(null);
  const [completeData, setCompleteData] = useState({
      fechaRealizada: new Date().toISOString().split('T')[0],
      resultado: ''
  });
  
  const [formData, setFormData] = useState({
    tipo: 'ESTUDIO',
    descripcion: '',
    fechaProgramada: '',
    esObligatorio: false,
    esControl: false,
    notas: '',
    codigoCUPS: '',
    cantidad: 1,
    trimestre: '',
    prestadoresIds: []
  });

  const { notify, confirm } = useNotification();

  const fetchEventos = async () => {
    try {
      const res = await api.get(`/eventos/materna/${maternaId}`);
      setEventos(res.data);
      calculateMetas(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventos();
    const fetchExtras = async () => {
        try {
            const [pRes, prRes, mRes] = await Promise.all([
                api.get('/paquetes'),
                api.get('/prestadores'),
                api.get('/maternas')
            ]);
            setPaquetesDisponibles(pRes.data);
            setPrestadoresList(prRes.data);
            
            const materna = mRes.data.find(m => m.id === parseInt(maternaId));
            if (materna) {
                const trimester = calculateTrimesterStatus(materna.fechaEmbarazo);
                setCurrentTrimester(trimester);
            }
        } catch (err) { console.error(err); }
    };
    fetchExtras();
  }, [maternaId]);

  const calculateTrimesterStatus = (date) => {
    const start = new Date(date);
    const now = new Date();
    const diffDays = Math.ceil(Math.abs(now - start) / (1000 * 60 * 60 * 24));
    const weeks = Math.floor(diffDays / 7);
    if (weeks <= 13) return "1er Trimestre";
    if (weeks <= 26) return "2do Trimestre";
    return "3er Trimestre";
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      const dataToSend = { 
        ...formData, 
        maternaId,
        esControl: formData.tipo === 'CONSULTA'
      };
      await api.post('/eventos', dataToSend);
      setIsModalOpen(false);
      fetchEventos();
      setFormData({ tipo: 'ESTUDIO', descripcion: '', fechaProgramada: '', esObligatorio: false, esControl: false, notas: '', codigoCUPS: '', cantidad: 1, trimestre: '', prestadoresIds: [] });
    } catch (err) {
      notify('Error al crear evento', 'error');
    }
  };

  const handleAddQuickPrestador = async () => {
    if (!newPrestadorName.trim()) return;
    try {
      const res = await api.post('/prestadores', { nombre: newPrestadorName });
      setPrestadoresList([...prestadoresList, res.data]);
      setFormData({ ...formData, prestadoresIds: [...formData.prestadoresIds, res.data.id] });
      setNewPrestadorName('');
    } catch (err) {
      notify('Prestador ya existe o hubo un error', 'error');
    }
  };

  const togglePrestador = (id) => {
    const ids = [...formData.prestadoresIds];
    const index = ids.indexOf(id);
    if (index > -1) ids.splice(index, 1);
    else ids.push(id);
    setFormData({ ...formData, prestadoresIds: ids });
  };

  const handleToggleEstado = async (id, currentEstado) => {
    const evento = eventos.find(e => e.id === id);
    if (!evento) return;
    if (currentEstado === 'PENDIENTE') {
        // Mostrar siempre el modal para registrar la fecha de asistencia
        setCompletingEvent(evento);
        setCompleteData({
            fechaRealizada: new Date().toISOString().split('T')[0],
            resultado: evento.resultado || ''
        });
        setIsCompleteModalOpen(true);
        return;
    }

    try {
      const nuevoEstado = currentEstado === 'PENDIENTE' ? 'REALIZADO' : 'PENDIENTE';
      await api.patch(`/eventos/${id}`, { estado: nuevoEstado });
      fetchEventos();
    } catch (err) {
      notify('Error al actualizar estado', 'error');
    }
  };

  const handleToggleAgendado = async (evento) => {
    const nowAgendado = !evento.estaAgendado;
    try {
      await api.patch(`/eventos/${evento.id}`, {
        estaAgendado: nowAgendado,
        // Al desagendar, limpiar la fecha de agendamiento
        fechaAgendamiento: nowAgendado ? (evento.fechaAgendamiento || null) : null,
      });
      fetchEventos();
      notify(nowAgendado ? 'Cita marcada como agendada' : 'Cita marcada como por agendar');
    } catch (err) {
      notify('Error al actualizar agendamiento', 'error');
    }
  };

  const handleFechaAgendamiento = async (evento, fecha) => {
    try {
      await api.patch(`/eventos/${evento.id}`, { fechaAgendamiento: fecha || null });
      fetchEventos();
    } catch (err) {
      notify('Error al guardar fecha de agendamiento', 'error');
    }
  };

  const handleFinishCompletion = async (e) => {
    e.preventDefault();
    if (!completingEvent) return;
    try {
        await api.patch(`/eventos/${completingEvent.id}`, {
            estado: 'REALIZADO',
            fechaRealizada: completeData.fechaRealizada,
            resultado: completeData.resultado
        });

        notify(completingEvent.tipo === 'LABORATORIO' ? 'Resultado registrado' : 'Actividad completada');

        // Crear automáticamente el siguiente control si es necesario (SOLO PARA CONSULTAS)
        if (completingEvent.tipo === 'CONSULTA' && completingEvent.esControl && completeData.fechaRealizada) {
            let nextDesc = completingEvent.descripcion.replace(/primera vez/i, 'Control');
            if (!nextDesc.toLowerCase().includes('control')) {
                nextDesc = `Control ${nextDesc}`;
            }

            await api.post('/eventos', {
                tipo: 'CONSULTA',
                descripcion: nextDesc,
                fechaProgramada: completeData.fechaRealizada,
                esObligatorio: true,
                esControl: true,
                maternaId,
                cantidad: completingEvent.cantidad,
                prestadoresIds: completingEvent.prestadores?.map(p => p.id) || []
            });
            notify(`Siguiente cita programada: ${nextDesc}`);
        }

        setIsCompleteModalOpen(false);
        fetchEventos();
    } catch (err) {
        notify('Error al completar evento', 'error');
    }
  };

  const calculateMetas = (allEvents) => {
    try {
      if (!allEvents || !Array.isArray(allEvents)) return;
      const goals = [];
      
      // Group Consultas by description (normalized)
      const consultas = allEvents.filter(e => e && e.tipo === 'CONSULTA');
      const groupedConsultas = {};
      consultas.forEach(c => {
        // Normalizar descripción: Quitar "Control" o "Primera vez" al inicio
        let desc = (c.descripcion || 'Sin descripción')
          .replace(/^Control\s+/i, '')
          .replace(/^Primera vez\s+/i, '')
          .trim();
          
        if (!groupedConsultas[desc]) {
          groupedConsultas[desc] = {
            count: 0,
            target: parseInt(c.cantidad) || 1
          };
        } else {
          // Si ya existe, nos quedamos con la meta más alta encontrada
          const currentTarget = parseInt(c.cantidad) || 1;
          if (currentTarget > groupedConsultas[desc].target) {
            groupedConsultas[desc].target = currentTarget;
          }
        }
        if (c.estado === 'REALIZADO') groupedConsultas[desc].count++;
      });

      Object.keys(groupedConsultas).forEach(desc => {
        goals.push({
          nombre: desc,
          tipo: 'CONSULTA',
          actual: groupedConsultas[desc].count,
          objetivo: groupedConsultas[desc].target
        });
      });

      // Aggregate Vacunas
      const vacunas = allEvents.filter(e => e && e.tipo === 'VACUNA');
      if (vacunas.length > 0) {
        goals.push({
          nombre: 'Esquema de Vacunación',
          tipo: 'VACUNA',
          actual: vacunas.filter(v => v.estado === 'REALIZADO').length,
          objetivo: vacunas.length
        });
      }

      // Aggregate Laboratorios
      const laboratorios = allEvents.filter(e => e && e.tipo === 'LABORATORIO');
      if (laboratorios.length > 0) {
        goals.push({
          nombre: 'Pruebas de Laboratorio',
          tipo: 'LABORATORIO',
          actual: laboratorios.filter(l => l.estado === 'REALIZADO').length,
          objetivo: laboratorios.length
        });
      }

      setMetas(goals);
    } catch (err) {
      console.error("Error calculating metas:", err);
      // Fallback to avoid white screen
      setMetas([]);
    }
  };

  const handleDelete = async (id) => {
    const ok = await confirm({
        title: '¿Eliminar Evento?',
        message: 'Esta acción eliminará el evento médico de forma permanente.',
        confirmText: 'Eliminar',
        type: 'danger'
    });
    if (ok) {
      try {
        await api.delete(`/eventos/${id}`);
        notify('Evento eliminado');
        fetchEventos();
      } catch (err) {
        notify('Error al eliminar', 'error');
      }
    }
  };

  const handleBulkDelete = async () => {
    const ok = await confirm({
        title: '¿Eliminar Seleccionados?',
        message: `Se eliminarán ${selectedIds.length} eventos de forma permanente.`,
        confirmText: 'Eliminar todos',
        type: 'danger'
    });
    if (ok) {
        try {
            await api.post('/eventos/bulk-delete', { ids: selectedIds });
            notify(`${selectedIds.length} eventos eliminados`);
            setSelectedIds([]);
            fetchEventos();
        } catch (err) {
            notify('Error al eliminar eventos en bloque', 'error');
        }
    }
  };

  const handleToggleSelection = (id) => {
      setSelectedIds(prev => 
          prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
      );
  };

  const handleSelectAll = (filteredIds) => {
      if (selectedIds.length === filteredIds.length) setSelectedIds([]);
      else setSelectedIds(filteredIds);
  };

  const handleToggleControl = async (evento) => {
    try {
        await api.patch(`/eventos/${evento.id}`, { esControl: !evento.esControl });
        fetchEventos();
    } catch (err) {
        notify('Error al actualizar propiedad de control', 'error');
    }
  };

  const handleAplicarPaquete = async (paqueteId) => {
    setGenerating(true);
    try {
      if (paqueteId === 'basico') {
          await api.post(`/eventos/materna/${maternaId}/generar-basicos`);
      } else {
          await api.post(`/paquetes/aplicar/${paqueteId}/materna/${maternaId}`);
      }
      setIsPackageModalOpen(false);
      notify('Paquete aplicado correctamente');
      fetchEventos();
    } catch (err) {
      notify('Error al aplicar paquete', 'error');
    } finally {
      setGenerating(false);
    }
  };

  const getEventIcon = (tipo) => {
    switch (tipo) {
      case 'CITA': return <Calendar size={18} />;
      case 'ESTUDIO': return <FileText size={18} />;
      case 'CONTROL': return <Clock size={16} />;
      case 'VACUNA': return <Syringe size={16} />;
      case 'CONSULTA': return <User size={16} />;
      default: return <Stethoscope size={16} />;
    }
  };

  const getEventColor = (tipo) => {
    switch (tipo) {
      case 'CITA': return 'var(--secondary-color)';
      case 'ESTUDIO': return 'var(--accent-color)';
      case 'CONTROL': return 'var(--primary-color)';
      case 'VACUNA': return 'var(--accent-color)';
      case 'CONSULTA': return 'var(--primary-color)';
      default: return 'var(--secondary-color)';
    }
  };

  const pendientes = eventos.filter(e => e.estado === 'PENDIENTE');
  const realizados = eventos.filter(e => e.estado === 'REALIZADO');

  const getFilteredEvents = () => {
    let baseEvents = activeTab === 'pendientes' ? pendientes : realizados;
    let filtered = baseEvents;
    
    if (activeTab === 'pendientes') {
        if (!showAllTrimesters && currentTrimester) {
            filtered = filtered.filter(e => !e.trimestre || e.trimestre === currentTrimester);
        }
        if (scheduleSearch) {
            filtered = filtered.filter(e => 
                e.descripcion.toLowerCase().includes(scheduleSearch.toLowerCase()) ||
                e.tipo.toLowerCase().includes(scheduleSearch.toLowerCase())
            );
        }
    } else if (activeTab === 'historia') {
        if (historySearch) {
            filtered = filtered.filter(e => 
                e.descripcion.toLowerCase().includes(historySearch.toLowerCase()) ||
                e.tipo.toLowerCase().includes(historySearch.toLowerCase())
            );
        }
    }
    return filtered;
  };

  const filteredPendientes = activeTab === 'pendientes' ? getFilteredEvents() : [];
  const visiblePendientes = filteredPendientes.slice(0, visibleLimit);
  
  const filteredHistory = activeTab === 'historia' ? getFilteredEvents() : [];
  const visibleHistory = filteredHistory.slice(0, historyVisibleLimit);

  const hiddenCount = pendientes.length - filteredPendientes.length;
  const hasMore = filteredPendientes.length > visibleLimit;
  const hasMoreHistory = filteredHistory.length > historyVisibleLimit;

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Cargando eventos...</div>;

  return (
    <div style={{ display: 'grid', gap: '1.5rem' }}>
      {/* Header & Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: '950', color: 'var(--text-main)', margin: 0 }}>Gestión Clínica</h3>
        <div style={{ display: 'flex', gap: '10px' }}>
            {eventos.length === 0 && (
                <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsPackageModalOpen(true)}
                    disabled={generating}
                    style={{ 
                        background: 'var(--primary-color)15', 
                        color: 'var(--primary-color)', 
                        border: '1px solid var(--primary-color)30',
                        padding: '8px 16px', borderRadius: '12px', fontWeight: '800', fontSize: '0.8rem',
                        display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer'
                    }}
                >
                    <Zap size={14} fill={generating ? 'none' : 'currentColor'} />
                    {generating ? 'Generando...' : 'Aplicar Paquete'}
                </motion.button>
            )}
            <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsModalOpen(true)}
                style={{ 
                    background: 'var(--text-main)', 
                    color: 'var(--bg-color)', 
                    border: 'none',
                    padding: '8px 16px', borderRadius: '12px', fontWeight: '800', fontSize: '0.8rem',
                    display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer'
                }}
            >
                <Plus size={16} />
                Nuevo
            </motion.button>
        </div>
      </div>

      {/* Trimester Filter Info */}
      {currentTrimester && (
          <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              padding: '12px 16px', 
              background: 'var(--primary-color)05', 
              borderRadius: '16px', 
              border: '1px solid var(--primary-color)15' 
          }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ padding: '8px', background: 'var(--primary-color)15', borderRadius: '10px', color: 'var(--primary-color)' }}>
                      <Clock size={16} />
                  </div>
                  <div>
                      <p style={{ margin: 0, fontSize: '0.65rem', fontWeight: '950', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Etapa Actual</p>
                      <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: '900', color: 'var(--text-main)' }}>{currentTrimester}</p>
                  </div>
              </div>
              <button 
                onClick={() => setShowAllTrimesters(!showAllTrimesters)}
                style={{ 
                    background: showAllTrimesters ? 'var(--primary-color)' : 'transparent', 
                    color: showAllTrimesters ? 'white' : 'var(--primary-color)',
                    border: '1px solid var(--primary-color)',
                    padding: '6px 14px',
                    borderRadius: '10px',
                    fontSize: '0.72rem',
                    fontWeight: '800',
                    cursor: 'pointer',
                    transition: 'all 0.3s'
                }}
              >
                  {showAllTrimesters ? 'Ver Enfocado' : 'Ver Todo'}
              </button>
          </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '10px', background: 'var(--bg-color)', padding: '6px', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
         {['pendientes', 'historia', 'laboratorios', 'metas'].map(tab => (
           <button 
             key={tab}
             onClick={() => {
                 setActiveTab(tab);
                 setSelectedIds([]); // Limpiar selección al cambiar de pestaña
             }}
             style={{
               flex: 1,
               background: activeTab === tab ? 'var(--primary-color)' : 'transparent',
               border: 'none', padding: '10px', borderRadius: '10px', cursor: 'pointer',
               fontSize: '0.75rem', fontWeight: '900',
               color: activeTab === tab ? 'white' : 'var(--text-muted)',
               transition: 'all 0.3s ease',
               textTransform: 'uppercase'
             }}
           >
             {tab === 'pendientes' ? 'Cronograma' : tab === 'historia' ? 'Historial' : tab === 'laboratorios' ? 'Laboratorios' : 'Metas'}
           </button>
         ))}
       </div>

      {/* View Content */}
      <div style={{ position: 'relative', minHeight: '300px' }}>
        <AnimatePresence mode="wait">
          {activeTab === 'pendientes' && (
            <motion.div 
              key="pendientes"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              style={{ display: 'grid', gap: '1rem' }}
            >
              {filteredPendientes.length === 0 ? (
                  <div style={{ padding: '3rem 2rem', textAlign: 'center', background: 'var(--bg-color)', borderRadius: '20px', border: '1px dashed var(--border-color)', color: 'var(--text-muted)' }}>
                      <Clock size={40} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                      <p style={{ margin: 0, fontWeight: '700' }}>No se encontraron actividades</p>
                      {!showAllTrimesters && hiddenCount > 0 && (
                          <button 
                            onClick={() => setShowAllTrimesters(true)}
                            style={{ background: 'none', border: 'none', color: 'var(--primary-color)', fontWeight: '800', fontSize: '0.8rem', marginTop: '10px', cursor: 'pointer', textDecoration: 'underline' }}
                          >
                            Ver otras etapas gestacionales
                          </button>
                      )}
                  </div>
              ) : (
                  <div style={{ display: 'grid', gap: '1rem' }}>
                    {/* Toolbar for table */}
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
                            <input 
                                type="text" 
                                placeholder="Buscar en el cronograma..." 
                                value={scheduleSearch}
                                onChange={(e) => setScheduleSearch(e.target.value)}
                                style={{ 
                                    padding: '10px 15px', borderRadius: '12px', border: '1px solid var(--border-color)', 
                                    width: '100%', fontSize: '0.85rem', background: 'white' 
                                }}
                            />
                        </div>
                        {selectedIds.length > 0 && (
                            <motion.button 
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                onClick={handleBulkDelete}
                                style={{ 
                                    background: 'var(--error-color)15', color: 'var(--error-color)',
                                    padding: '10px 15px', borderRadius: '12px', border: '1px solid var(--error-color)30',
                                    fontWeight: '800', fontSize: '0.8rem', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', gap: '8px'
                                }}
                            >
                                <Trash2 size={14} />
                                Eliminar ({selectedIds.length})
                            </motion.button>
                        )}
                    </div>

                    <div className="organic-card" style={{ padding: '0', overflowX: 'auto', border: '1px solid var(--border-color)' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
                            <thead>
                                <tr style={{ background: 'var(--bg-color)', borderBottom: '1px solid var(--border-color)' }}>
                                    <th style={{ padding: '12px 15px', width: '40px' }}>
                                        <input 
                                            type="checkbox" 
                                            checked={selectedIds.length === filteredPendientes.length && filteredPendientes.length > 0}
                                            onChange={() => handleSelectAll(filteredPendientes.map(e => e.id))}
                                            style={{ cursor: 'pointer' }}
                                        />
                                    </th>
                                    <th style={{ padding: '12px 15px', fontSize: '0.7rem', fontWeight: '900', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Evento</th>
                                    <th style={{ padding: '12px 15px', fontSize: '0.7rem', fontWeight: '900', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Trimestre</th>
                                    <th style={{ padding: '12px 15px', fontSize: '0.7rem', fontWeight: '900', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Fecha</th>
                                    <th style={{ padding: '12px 15px', fontSize: '0.7rem', fontWeight: '900', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Estado / Gestión</th>
                                    <th style={{ padding: '12px 15px', fontSize: '0.7rem', fontWeight: '900', color: 'var(--text-muted)', textTransform: 'uppercase', textAlign: 'right' }}>ACCIONES</th>
                                </tr>
                            </thead>
                            <tbody>
                                {visiblePendientes.map(evento => {
                                    const isCurrentTrimester = evento.trimestre === currentTrimester;
                                    return (
                                        <tr 
                                            key={evento.id} 
                                            style={{ 
                                                borderBottom: '1px solid var(--border-color)',
                                                background: isCurrentTrimester ? 'var(--primary-color)02' : 'transparent',
                                                transition: 'all 0.2s'
                                            }}
                                            className="table-row-hover"
                                        >
                                            <td style={{ padding: '12px 15px' }}>
                                                <input 
                                                    type="checkbox" 
                                                    checked={selectedIds.includes(evento.id)}
                                                    onChange={() => handleToggleSelection(evento.id)}
                                                    style={{ cursor: 'pointer' }}
                                                />
                                            </td>
                                            <td style={{ padding: '12px 15px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <div style={{ padding: '6px', borderRadius: '8px', background: `${getEventColor(evento.tipo)}15`, color: getEventColor(evento.tipo) }}>
                                                        {getEventIcon(evento.tipo)}
                                                    </div>
                                                    <div>
                                                        <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                            {evento.descripcion}
                                                            {evento.esObligatorio && <AlertTriangle size={12} style={{ color: 'var(--error-color)' }} />}
                                                        </p>
                                                        {evento.codigoCUPS && <p style={{ margin: 0, fontSize: '0.65rem', color: 'var(--text-muted)' }}>CUPS: {evento.codigoCUPS}</p>}
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ padding: '12px 15px' }}>
                                                {evento.trimestre ? (
                                                    <span style={{ 
                                                        fontSize: '0.65rem', fontWeight: '900', 
                                                        background: isCurrentTrimester ? 'var(--primary-color)' : 'var(--bg-color)', 
                                                        color: isCurrentTrimester ? 'white' : 'var(--text-muted)', 
                                                        padding: '2px 8px', borderRadius: '6px', textTransform: 'uppercase',
                                                        border: isCurrentTrimester ? 'none' : '1px solid var(--border-color)'
                                                    }}>
                                                        {evento.trimestre.replace(' Trimestre', '')}
                                                    </span>
                                                ) : <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>-</span>}
                                            </td>
                                            <td style={{ padding: '12px 15px' }}>
                                                <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-main)' }}>{new Date(evento.fechaProgramada).toLocaleDateString()}</p>
                                            </td>
                                            <td style={{ padding: '12px 15px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                                    <button
                                                        onClick={() => handleToggleAgendado(evento)}
                                                        style={{ 
                                                            fontSize: '0.6rem', fontWeight: '900', 
                                                            background: evento.estaAgendado ? 'var(--success-color)' : 'var(--bg-color)', 
                                                            color: evento.estaAgendado ? 'white' : 'var(--text-muted)', 
                                                            padding: '2px 8px', borderRadius: '6px', cursor: 'pointer',
                                                            border: '1px solid var(--border-color)',
                                                            display: 'flex', alignItems: 'center', gap: '4px'
                                                        }}
                                                    >
                                                        <Bell size={10} />
                                                        {evento.estaAgendado ? 'AGENDADO' : 'AGENDAR'}
                                                    </button>
                                                    
                                                    {evento.tipo === 'CONSULTA' && (
                                                        <button
                                                            onClick={() => handleToggleControl(evento)}
                                                            style={{ 
                                                                fontSize: '0.6rem', fontWeight: '900', 
                                                                background: evento.esControl ? 'var(--secondary-color)' : 'var(--bg-color)', 
                                                                color: evento.esControl ? 'white' : 'var(--text-muted)', 
                                                                padding: '2px 8px', borderRadius: '6px', cursor: 'pointer',
                                                                border: '1px solid var(--border-color)'
                                                            }}
                                                        >
                                                            {evento.esControl ? 'CONTROL' : 'MARCAR'}
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                            <td style={{ padding: '12px 15px', textAlign: 'right' }}>
                                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                                                    <button onClick={() => handleDelete(evento.id)} style={{ p: '6px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', opacity: 0.6 }} title="Eliminar"><Trash2 size={16} /></button>
                                                    <button onClick={() => handleToggleEstado(evento.id, 'PENDIENTE')} style={{ padding: '6px', borderRadius: '8px', background: 'var(--success-color)10', color: 'var(--success-color)', border: 'none', cursor: 'pointer' }} title="Marcar Realizado"><CheckCircle size={18} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {hasMore && (
                        <div style={{ textAlign: 'center', marginTop: '5px' }}>
                            <button 
                                onClick={() => setVisibleLimit(prev => prev + 10)}
                                style={{ 
                                    background: 'var(--bg-color)', border: '1px solid var(--border-color)', 
                                    padding: '8px 20px', borderRadius: '12px', fontSize: '0.8rem', 
                                    fontWeight: '800', color: 'var(--primary-color)', cursor: 'pointer' 
                                }}
                            >
                                Ver más actividades
                            </button>
                        </div>
                    )}
                  </div>
              )}
            </motion.div>
          )}

          {activeTab === 'historia' && (
            <motion.div 
              key="historia"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              style={{ display: 'grid', gap: '1rem' }}
            >
                {realizados.length === 0 ? (
                    <div style={{ padding: '3rem', textAlign: 'center', background: 'var(--bg-color)', borderRadius: '20px', border: '1px dashed var(--border-color)', color: 'var(--text-muted)' }}>Historial vacío</div>
                ) : (
                    <>
                       {/* Toolbar for history table */}
                       <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
                            <input 
                                type="text" 
                                placeholder="Buscar en el historial..." 
                                value={historySearch}
                                onChange={(e) => setHistorySearch(e.target.value)}
                                style={{ 
                                    padding: '10px 15px', borderRadius: '12px', border: '1px solid var(--border-color)', 
                                    width: '100%', fontSize: '0.85rem', background: 'white' 
                                }}
                            />
                        </div>
                        {selectedIds.length > 0 && (
                            <motion.button 
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                onClick={handleBulkDelete}
                                style={{ 
                                    background: 'var(--error-color)15', color: 'var(--error-color)',
                                    padding: '10px 15px', borderRadius: '12px', border: '1px solid var(--error-color)30',
                                    fontWeight: '800', fontSize: '0.8rem', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', gap: '8px'
                                }}
                            >
                                <Trash2 size={14} />
                                Eliminar ({selectedIds.length})
                            </motion.button>
                        )}
                    </div>

                    <div className="organic-card" style={{ padding: '0', overflowX: 'auto', border: '1px solid var(--border-color)' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
                            <thead>
                                <tr style={{ background: 'var(--bg-color)', borderBottom: '1px solid var(--border-color)' }}>
                                    <th style={{ padding: '12px 15px', width: '40px' }}>
                                        <input 
                                            type="checkbox" 
                                            checked={selectedIds.length === filteredHistory.length && filteredHistory.length > 0}
                                            onChange={() => handleSelectAll(filteredHistory.map(e => e.id))}
                                            style={{ cursor: 'pointer' }}
                                        />
                                    </th>
                                    <th style={{ padding: '12px 15px', fontSize: '0.7rem', fontWeight: '900', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Actividad</th>
                                    <th style={{ padding: '12px 15px', fontSize: '0.7rem', fontWeight: '900', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Trimestre</th>
                                    <th style={{ padding: '12px 15px', fontSize: '0.7rem', fontWeight: '900', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Fecha Realizada</th>
                                    <th style={{ padding: '12px 15px', fontSize: '0.7rem', fontWeight: '900', color: 'var(--text-muted)', textTransform: 'uppercase', textAlign: 'right' }}>ACCIONES</th>
                                </tr>
                            </thead>
                            <tbody>
                                {visibleHistory.map(evento => (
                                    <tr key={evento.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'all 0.2s' }} className="table-row-hover">
                                        <td style={{ padding: '12px 15px' }}>
                                            <input 
                                                type="checkbox" 
                                                checked={selectedIds.includes(evento.id)}
                                                onChange={() => handleToggleSelection(evento.id)}
                                                style={{ cursor: 'pointer' }}
                                            />
                                        </td>
                                        <td style={{ padding: '12px 15px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <div style={{ color: 'var(--success-color)', opacity: 0.8 }}><CheckCircle size={18} /></div>
                                                <div>
                                                    <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-main)', opacity: 0.7, textDecoration: 'line-through' }}>{evento.descripcion}</p>
                                                    {evento.esControl && <span style={{ fontSize: '0.6rem', color: 'var(--secondary-color)', fontWeight: '900' }}>SEGUIMIENTO PRENATAL</span>}
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '12px 15px' }}>
                                            {evento.trimestre && (
                                                <span style={{ fontSize: '0.65rem', fontWeight: '900', background: 'var(--bg-color)', color: 'var(--text-muted)', padding: '2px 8px', borderRadius: '6px', border: '1px solid var(--border-color)', textTransform: 'uppercase' }}>
                                                    {evento.trimestre.replace(' Trimestre', '')}
                                                </span>
                                            )}
                                        </td>
                                        <td style={{ padding: '12px 15px' }}>
                                            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(evento.fechaRealizada).toLocaleDateString()}</p>
                                        </td>
                                        <td style={{ padding: '12px 15px', textAlign: 'right' }}>
                                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                                <button onClick={() => handleToggleEstado(evento.id, 'REALIZADO')} style={{ padding: '6px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }} title="Reabrir">
                                                    <Clock size={16} />
                                                </button>
                                                <button onClick={() => handleDelete(evento.id)} style={{ padding: '6px', background: 'none', border: 'none', color: 'var(--error-color)', cursor: 'pointer', opacity: 0.6 }} title="Eliminar">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {hasMoreHistory && (
                        <div style={{ textAlign: 'center', marginTop: '10px' }}>
                            <button 
                                onClick={() => setHistoryVisibleLimit(prev => prev + 10)}
                                style={{ 
                                    background: 'var(--bg-color)', border: '1px solid var(--border-color)', 
                                    padding: '8px 20px', borderRadius: '12px', fontSize: '0.8rem', 
                                    fontWeight: '800', color: 'var(--primary-color)', cursor: 'pointer' 
                                }}
                            >
                                Ver más historial
                            </button>
                        </div>
                    )}
                    </>
                )}
            </motion.div>
          )}

          {activeTab === 'laboratorios' && (
            <motion.div 
              key="laboratorios"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="organic-card" style={{ padding: '0', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '400px' }}>
                      <thead>
                        <tr style={{ background: 'var(--bg-color)', borderBottom: '1px solid var(--border-color)' }}>
                          <th style={{ padding: '15px 20px', fontSize: '0.7rem', fontWeight: '900', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Estudio</th>
                          <th style={{ padding: '15px 20px', fontSize: '0.7rem', fontWeight: '900', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Trim.</th>
                          <th style={{ padding: '15px 20px', fontSize: '0.7rem', fontWeight: '900', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Fecha</th>
                          <th style={{ padding: '15px 20px', fontSize: '0.7rem', fontWeight: '900', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Resultado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {realizados.filter(e => e.tipo === 'LABORATORIO').length === 0 ? (
                          <tr><td colSpan="3" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>No se han registrado resultados de laboratorios aún.</td></tr>
                        ) : (
                          realizados.filter(e => e.tipo === 'LABORATORIO').map(e => (
                            <tr key={e.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                              <td style={{ padding: '15px 20px', fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-main)' }}>{e.descripcion}</td>
                              <td style={{ padding: '15px 20px', fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)' }}>{e.trimestre ? e.trimestre.replace(' Trimestre', '') : '-'}</td>
                              <td style={{ padding: '15px 20px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(e.fechaRealizada).toLocaleDateString()}</td>
                              <td style={{ padding: '15px 20px' }}>
                                <div style={{ 
                                    padding: '8px 14px', borderRadius: '12px', background: 'var(--primary-color)08', 
                                    color: 'var(--primary-color)', fontWeight: '800', fontSize: '0.8rem',
                                    border: '1px solid var(--primary-color)20', display: 'inline-block', maxWidth: '300px'
                                }}>
                                  {e.resultado || 'Sin detalle'}
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'metas' && (
            <motion.div 
              key="metas"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.2rem' }}
            >
              {metas.length === 0 ? (
                <div style={{ gridColumn: '1/-1', padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>No hay metas configuradas todavía</div>
              ) : (
                metas.map((meta, i) => {
                  const rawProgress = Math.round((meta.actual / (meta.objetivo || 1)) * 100);
                  const progress = isNaN(rawProgress) ? 0 : Math.min(rawProgress, 100);
                  const isLow = progress < 50;
                  const isMed = progress >= 50 && progress < 100;
                  const isFull = progress >= 100;

                  return (
                    <motion.div 
                      key={i} 
                      className="organic-card" 
                      style={{ padding: '1.5rem', border: '1px solid var(--border-color)', position: 'relative', overflow: 'hidden' }}
                    >
                        {/* Background subtle glow if full */}
                        {isFull && <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'var(--success-color)', opacity: 0.03, pointerEvents: 'none' }} />}

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.2rem' }}>
                        <div style={{ flex: 1 }}>
                          <p style={{ margin: 0, fontSize: '0.65rem', fontWeight: '950', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{meta.tipo}</p>
                          <h4 style={{ margin: '4px 0 0', fontSize: '1rem', fontWeight: '950', color: 'var(--text-main)', lineHeight: '1.2' }}>{meta.nombre}</h4>
                        </div>
                        <div style={{ fontSize: '1.5rem', filter: isFull ? 'grayscale(0)' : 'grayscale(1)', opacity: isFull ? 1 : 0.5 }}>
                          {isFull ? '😊' : (isLow ? '😟' : '😐')}
                        </div>
                      </div>

                      <div style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                        <div>
                            <span style={{ fontSize: '1.2rem', fontWeight: '950', color: 'var(--text-main)' }}>{meta.actual}</span>
                            <span style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-muted)', marginLeft: '4px' }}>/ {meta.objetivo}</span>
                        </div>
                        <span style={{ fontSize: '0.85rem', fontWeight: '950', color: isFull ? 'var(--success-color)' : (isLow ? 'var(--error-color)' : 'var(--warning-color)') }}>{progress}%</span>
                      </div>

                      <div style={{ width: '100%', height: '10px', background: 'var(--bg-color)', borderRadius: '10px', overflow: 'hidden', padding: '2px', border: '1px solid var(--border-color)' }}>
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          style={{ 
                            height: '100%', 
                            background: isFull ? 'var(--success-color)' : (isLow ? 'var(--error-color)' : 'var(--warning-color)'),
                            borderRadius: '10px',
                            boxShadow: `0 0 10px ${isFull ? 'var(--success-color)30' : (isLow ? 'var(--error-color)30' : 'var(--warning-color)30')}`
                          }}
                        />
                      </div>
                      
                      {isFull && (
                        <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--success-color)', fontSize: '0.7rem', fontWeight: '900', textTransform: 'uppercase' }}>
                            <CheckCircle size={12} /> Meta Cumplida
                        </div>
                      )}
                    </motion.div>
                  );
                })
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modales */}
      <AnimatePresence>
        {isModalOpen && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '20px' }}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="organic-card" style={{ width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto', padding: '2rem', boxShadow: 'var(--shadow-xl)', position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.4rem', fontWeight: '950', color: 'var(--text-main)', margin: 0 }}>Nuevo Evento</h3>
                <button onClick={() => setIsModalOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={20} /></button>
              </div>
              <form onSubmit={handleCreateEvent} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: '900', color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>TIPO</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {['CITA', 'ESTUDIO', 'LABORATORIO', 'VACUNA', 'CONSULTA'].map(t => (
                      <button key={t} type="button" onClick={() => setFormData({...formData, tipo: t})} style={{ flex: 1, padding: '10px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: '800', border: '2px solid', borderColor: formData.tipo === t ? getEventColor(t) : 'var(--border-color)', background: formData.tipo === t ? `${getEventColor(t)}10` : 'var(--bg-color)', color: formData.tipo === t ? getEventColor(t) : 'var(--text-muted)', cursor: 'pointer' }}>{t}</button>
                    ))}
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                    <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: '900', color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>DESCRIPCIÓN</label>
                        <input type="text" value={formData.descripcion} onChange={e => setFormData({...formData, descripcion: e.target.value})} required placeholder="Ej. Ecografía de control" style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-color)' }} />
                    </div>
                    <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: '900', color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>CUPS</label>
                        <input type="text" value={formData.codigoCUPS} onChange={e => setFormData({...formData, codigoCUPS: e.target.value})} placeholder="Opcional" style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-color)' }} />
                    </div>
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: '900', color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>MÉDICOS / PRESTADORES</label>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' }}>
                    {prestadoresList.map(p => (
                      <button key={p.id} type="button" onClick={() => togglePrestador(p.id)} style={{ padding: '6px 12px', borderRadius: '10px', fontSize: '0.7rem', fontWeight: '700', border: '1px solid', borderColor: formData.prestadoresIds.includes(p.id) ? 'var(--primary-color)' : 'var(--border-color)', background: formData.prestadoresIds.includes(p.id) ? 'var(--primary-color)20' : 'var(--bg-color)', color: formData.prestadoresIds.includes(p.id) ? 'var(--primary-color)' : 'var(--text-muted)', cursor: 'pointer' }}>{p.nombre}</button>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input type="text" placeholder="Añadir médico..." value={newPrestadorName} onChange={e => setNewPrestadorName(e.target.value)} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid var(--border-color)', fontSize: '0.8rem', background: 'var(--bg-color)' }} />
                    <button type="button" onClick={handleAddQuickPrestador} style={{ padding: '10px 15px', borderRadius: '10px', background: 'var(--text-main)', color: 'var(--bg-color)', border: 'none', fontWeight: '800' }}>+</button>
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: '900', color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>FECHA</label>
                  <input type="date" value={formData.fechaProgramada} onChange={e => setFormData({...formData, fechaProgramada: e.target.value})} required style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-color)' }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input type="checkbox" id="obligatorio" checked={formData.esObligatorio} onChange={e => setFormData({...formData, esObligatorio: e.target.checked})} style={{ width: '18px', height: '18px' }} />
                    <label htmlFor="obligatorio" style={{ fontSize: '0.85rem', fontWeight: '700' }}>Obligatorio</label>
                  </div>
                  {formData.tipo === 'CONSULTA' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                       <label style={{ fontSize: '0.8rem', fontWeight: '900', color: 'var(--text-muted)' }}>CANTIDAD MÍNIMA:</label>
                       <input 
                          type="number" 
                          min="1" 
                          value={formData.cantidad} 
                          onChange={e => setFormData({...formData, cantidad: parseInt(e.target.value) || 1})} 
                          style={{ width: '60px', padding: '8px', borderRadius: '10px', border: '1px solid var(--border-color)', textAlign: 'center', fontWeight: '800' }} 
                        />
                    </div>
                  )}
                  {['ESTUDIO', 'LABORATORIO', 'VACUNA'].includes(formData.tipo) && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                       <label style={{ fontSize: '0.8rem', fontWeight: '900', color: 'var(--text-muted)' }}>TRIMESTRE:</label>
                       <select 
                          value={formData.trimestre || ''} 
                          onChange={e => setFormData({...formData, trimestre: e.target.value})} 
                          style={{ padding: '8px', borderRadius: '10px', border: '1px solid var(--border-color)', fontWeight: '800', fontSize: '0.75rem' }} 
                        >
                            <option value="">- Seleccione -</option>
                            <option value="1er Trimestre">1er Trimestre</option>
                            <option value="2do Trimestre">2do Trimestre</option>
                            <option value="3er Trimestre">3er Trimestre</option>
                        </select>
                    </div>
                  )}
                </div>
                <motion.button type="submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} style={{ background: 'var(--primary-color)', color: 'white', padding: '14px', borderRadius: '14px', fontWeight: '900', border: 'none', marginTop: '1rem', cursor: 'pointer' }}>Crear Evento</motion.button>
              </form>
            </motion.div>
          </div>
        )}

        {isPackageModalOpen && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '20px' }}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="organic-card" style={{ width: '100%', maxWidth: '500px', padding: '2rem', boxShadow: 'var(--shadow-xl)', position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.4rem', fontWeight: '950', color: 'var(--text-main)', margin: 0 }}>Aplicar Paquete</h3>
                <button onClick={() => setIsPackageModalOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={20} /></button>
              </div>
              <div style={{ display: 'grid', gap: '1rem' }}>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => handleAplicarPaquete('basico')} style={{ padding: '1.2rem', borderRadius: '18px', border: '1px solid var(--primary-color)30', background: 'var(--primary-color)05', color: 'var(--primary-color)', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <div style={{ padding: '10px', background: 'var(--primary-color)15', borderRadius: '12px' }}><Zap size={20} /></div>
                  <div>
                    <p style={{ fontWeight: '900', margin: 0, fontSize: '1rem' }}>Protocolo Básico</p>
                    <p style={{ fontSize: '0.8rem', opacity: 0.7, margin: '2px 0 0' }}>Plan estándar de seguimiento prenatal.</p>
                  </div>
                </motion.button>
                {paquetes.map(p => (
                  <motion.button key={p.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => handleAplicarPaquete(p.id)} style={{ padding: '1.2rem', borderRadius: '18px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-main)', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ padding: '10px', background: 'var(--bg-color)', border: '1px solid var(--border-color)', borderRadius: '12px', color: 'var(--text-muted)' }}><Zap size={20} /></div>
                    <div>
                      <p style={{ fontWeight: '900', margin: 0, fontSize: '1rem' }}>{p.nombre}</p>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>{p.plantillas.length} eventos automáticos.</p>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </div>
        )}

        {isCompleteModalOpen && completingEvent && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000, padding: '20px' }}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="organic-card" style={{ width: '100%', maxWidth: '450px', padding: '2rem', boxShadow: 'var(--shadow-xl)' }}>
              <h3 style={{ fontSize: '1.4rem', fontWeight: '950', color: 'var(--text-main)', marginBottom: '1.5rem' }}>Finalizar Actividad</h3>
              
              <div style={{ marginBottom: '1.5rem', padding: '12px', background: 'var(--primary-color)05', borderRadius: '12px', border: '1px solid var(--primary-color)15' }}>
                  <p style={{ margin: 0, fontSize: '0.7rem', fontWeight: '900', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Actividad</p>
                  <p style={{ margin: '4px 0 0', fontSize: '1rem', fontWeight: '900', color: 'var(--text-main)' }}>{completingEvent.descripcion}</p>
              </div>

              <form onSubmit={handleFinishCompletion} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: '900', color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>FECHA DE ASISTENCIA</label>
                    <input type="date" required value={completeData.fechaRealizada} onChange={e => setCompleteData({...completeData, fechaRealizada: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid var(--primary-color)40', background: 'white', fontWeight: '700' }} />
                </div>
                
                {completingEvent.tipo === 'LABORATORIO' && (
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: '900', color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>RESULTADO / NOTAS</label>
                    <textarea placeholder="Ingrese los resultados..." value={completeData.resultado} onChange={e => setCompleteData({...completeData, resultado: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', minHeight: '100px', resize: 'none' }} />
                  </div>
                )}
                <div style={{ display: 'flex', gap: '10px', marginTop: '1.5rem', flexWrap: 'wrap' }}>
                    <button type="button" onClick={() => setIsCompleteModalOpen(false)} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid var(--border-color)', fontWeight: '800', cursor: 'pointer' }}>Cancelar</button>
                    {completingEvent.tipo === 'CONSULTA' && completingEvent.esControl && (
                        <button type="button" onClick={() => {
                            handleToggleControl(completingEvent); // Desmarcar como control
                            handleToggleEstado(completingEvent.id, 'PENDIENTE'); // Re-intentar sin el modal de control
                            setIsCompleteModalOpen(false);
                        }} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid var(--border-color)', color: 'var(--text-muted)', fontWeight: '700', cursor: 'pointer' }}>No es Control</button>
                    )}
                    <button type="submit" style={{ flex: 2, padding: '12px', borderRadius: '12px', border: 'none', background: 'var(--primary-color)', color: 'white', fontWeight: '900', cursor: 'pointer' }}>Confirmar y Guardar</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MedicalEvents;
