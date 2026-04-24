import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { 
  ArrowLeft, 
  Baby, 
  Calendar, 
  AlertTriangle, 
  User, 
  MapPin, 
  Phone, 
  Heart,
  Clock,
  RefreshCw,
  Package
} from 'lucide-react';
import { motion } from 'framer-motion';
import LoadingSpinner from '../components/LoadingSpinner';
import MedicalEvents from '../components/MedicalEvents';
import { useNotification } from '../context/NotificationContext';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } }
};

const MaternaDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { notify } = useNotification();
  const [materna, setMaterna] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paquetesAplicados, setPaquetesAplicados] = useState([]);
  const [syncingId, setSyncingId] = useState(null); // id del paquete que se está sincronizando
  const [eventosKey, setEventosKey] = useState(0); // fuerza recarga de MedicalEvents

  useEffect(() => {
    const fetchMaterna = async () => {
      try {
        const res = await api.get(`/maternas/${id}`);
        setMaterna(res.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchMaterna();
  }, [id]);

  // Detectar qué paquetes tiene aplicados esta materna (desde sus eventos)
  useEffect(() => {
    const fetchPaquetesAplicados = async () => {
      try {
        const res = await api.get(`/eventos/materna/${id}`);
        const eventos = res.data;
        // Agrupar por paqueteId (solo los que tienen uno)
        const mapPaquetes = {};
        eventos.forEach(ev => {
          if (ev.paqueteId && !mapPaquetes[ev.paqueteId]) {
            mapPaquetes[ev.paqueteId] = { id: ev.paqueteId, nombre: ev.paquete?.nombre || `Paquete #${ev.paqueteId}` };
          }
        });
        // Obtener nombres reales desde la API de paquetes
        const paqRes = await api.get('/paquetes');
        const paquetesDB = paqRes.data;
        const aplicados = Object.values(mapPaquetes).map(p => {
          const found = paquetesDB.find(pq => pq.id === p.id);
          return found ? { id: found.id, nombre: found.nombre } : p;
        });
        setPaquetesAplicados(aplicados);
      } catch (err) {
        console.error('Error al obtener paquetes aplicados:', err);
      }
    };
    fetchPaquetesAplicados();
  }, [id, eventosKey]);

  const handleSincronizar = async (paqueteId, paqueteNombre) => {
    setSyncingId(paqueteId);
    try {
      await api.post(`/paquetes/${paqueteId}/sincronizar-materna/${id}`);
      notify(`✅ "${paqueteNombre}" sincronizado correctamente`, 'success');
      setEventosKey(k => k + 1); // recarga la tabla de eventos
    } catch (err) {
      notify(`Error al sincronizar "${paqueteNombre}"`, 'error');
    } finally {
      setSyncingId(null);
    }
  };

  const calculatePregnancyInfo = (pregnancyDate) => {
    const start = new Date(pregnancyDate);
    const now = new Date();
    const diffDays = Math.ceil(Math.abs(now - start) / (1000 * 60 * 60 * 24));
    const totalDays = 280;
    const progress = Math.min(Math.round((diffDays / totalDays) * 100), 100);
    const weeks = Math.floor(diffDays / 7);
    const days = diffDays % 7;
    const edd = new Date(start);
    edd.setDate(edd.getDate() + 280);
    return { progress, weeks, days, edd };
  };

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'ALTA': return 'var(--error-color)';
      case 'MEDIANA': return 'var(--warning-color)';
      case 'BAJA': return 'var(--success-color)';
      default: return 'var(--text-muted)';
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!materna) return (
    <div style={{ padding: '4rem', textAlign: 'center' }}>
      <AlertTriangle size={48} style={{ color: 'var(--error-color)', marginBottom: '1rem' }} />
      <h3 style={{ color: 'var(--text-main)' }}>Paciente no encontrada</h3>
      <button onClick={() => navigate('/maternas')} style={{ marginTop: '1rem', background: 'var(--primary-color)', color: 'white', padding: '10px 20px', borderRadius: '12px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>
        Volver
      </button>
    </div>
  );

  const info = calculatePregnancyInfo(materna.fechaEmbarazo);
  const edad = new Date().getFullYear() - new Date(materna.fechaNacimiento).getFullYear();

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      style={{ maxWidth: '1600px', width: '98%', margin: '0 auto', padding: '0 10px 40px', position: 'relative' }}
    >
      {/* Decorative Blobs */}
      <div className="blob" style={{ width: '400px', height: '400px', background: 'var(--primary-color)', top: '-100px', right: '-100px', filter: 'blur(100px)', opacity: 0.05 }} />

      {/* Back button */}
      <motion.button
        variants={itemVariants}
        onClick={() => navigate('/maternas')}
        whileHover={{ x: -3 }}
        whileTap={{ scale: 0.97 }}
        style={{
          background: 'var(--card-bg)',
          border: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          color: 'var(--text-muted)',
          marginBottom: '1rem',
          padding: '8px 16px',
          borderRadius: '12px',
          fontWeight: '800',
          fontSize: '0.75rem',
          textTransform: 'uppercase',
          letterSpacing: '0.8px',
          cursor: 'pointer',
          position: 'relative',
          zIndex: 1
        }}
      >
        <ArrowLeft size={14} /> Volver al Listado
      </motion.button>

      {/* ─── Main Grid Layout ─── */}
      <div className="detail-grid-layout" style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr', 
          gap: '1.2rem',
          position: 'relative',
          zIndex: 1
      }}>
          {/* Sidebar / Top Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              {/* ─── Header Card ─── */}
              <motion.div
                variants={itemVariants}
                className="organic-card"
                style={{ padding: '1.2rem', position: 'relative', overflow: 'hidden' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  {/* Avatar */}
                  <div style={{
                    width: '60px', height: '60px', minWidth: '60px',
                    borderRadius: '18px',
                    background: 'var(--primary-color)15',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--primary-color)',
                    border: '1px solid var(--primary-color)30',
                  }}>
                    <Baby size={30} />
                  </div>

                  {/* Name + meta */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '3px' }}>
                      <h1 style={{
                        fontSize: 'clamp(1.1rem, 5vw, 1.6rem)',
                        fontWeight: '950',
                        margin: 0,
                        letterSpacing: '-0.5px',
                        color: 'var(--text-main)',
                        lineHeight: 1
                      }}>
                        {materna.nombre}
                      </h1>
                      <span style={{
                        padding: '3px 10px', borderRadius: '20px', fontWeight: '900', fontSize: '0.6rem',
                        textTransform: 'uppercase', letterSpacing: '0.5px',
                        background: `${getRiskColor(materna.tipoRiesgo)}15`,
                        color: getRiskColor(materna.tipoRiesgo),
                        border: `1px solid ${getRiskColor(materna.tipoRiesgo)}30`
                      }}>
                        {materna.tipoRiesgo}
                      </span>
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: '600', margin: 0 }}>
                      <span style={{ color: 'var(--text-main)', fontWeight: '900' }}>{materna.documento}</span>
                      <span style={{ margin: '0 6px', opacity: 0.4 }}>•</span>
                      {edad} años
                    </p>
                  </div>
                </div>

                {/* Pregnancy bar inside header */}
                <div style={{ marginTop: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontSize: '0.65rem', fontWeight: '950', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Heart size={11} color="var(--primary-color)" fill="var(--primary-color)" /> Gestación
                    </span>
                    <span style={{ fontSize: '0.65rem', fontWeight: '950', color: 'var(--primary-color)' }}>
                      {info.weeks}s {info.days}d · {info.progress}%
                    </span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: 'var(--bg-color)', borderRadius: '10px', overflow: 'hidden', border: '1px solid var(--border-color)', padding: '1.5px' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${info.progress}%` }}
                      transition={{ duration: 1.5, ease: 'easeOut' }}
                      style={{
                        height: '100%',
                        background: 'linear-gradient(90deg, var(--primary-color), var(--accent-color))',
                        borderRadius: '8px',
                        boxShadow: '0 0 8px var(--primary-color)20'
                      }}
                    />
                  </div>
                </div>
              </motion.div>

              {/* ─── Clinical Alert ─── */}
              {materna.alertas && (
                <motion.div
                  variants={itemVariants}
                  className="organic-card"
                  style={{
                    padding: '0.8rem 1rem',
                    background: 'var(--error-color)08',
                    border: '1.5px solid var(--error-color)25',
                    display: 'flex', gap: '10px', alignItems: 'flex-start',
                  }}
                >
                  <AlertTriangle size={18} color="var(--error-color)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <p style={{ margin: 0, fontSize: '0.65rem', fontWeight: '950', color: 'var(--error-color)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Alerta Clínica</p>
                    <p style={{ margin: '2px 0 0', fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-main)' }}>{materna.alertas}</p>
                  </div>
                </motion.div>
              )}

              {/* ─── Info Row: EDD + Contact ─── */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                {[
                  { icon: <Calendar size={15} />, label: 'Fecha Probable Parto', val: info.edd.toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' }), color: 'var(--secondary-color)' },
                  { icon: <Phone size={15} />, label: 'Teléfono', val: materna.telefono || 'No registrado', color: 'var(--primary-color)' },
                  { icon: <MapPin size={15} />, label: 'Dirección', val: materna.direccion || 'No registrada', color: 'var(--accent-color)' },
                  { icon: <User size={15} />, label: 'Contacto/Pareja', val: materna.contactoEmergencia || 'No registrado', color: 'var(--secondary-color)' },
                ].map((item, i) => (
                  <motion.div key={i} variants={itemVariants} className="organic-card" style={{ padding: '0.9rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '36px', height: '36px', minWidth: '36px',
                      borderRadius: '11px',
                      background: `${item.color}15`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: item.color
                    }}>
                      {item.icon}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: '0.6rem', fontWeight: '900', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{item.label}</p>
                      <p style={{ margin: '2px 0 0', fontSize: '0.85rem', fontWeight: '850', color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.val}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* ─── Card: Paquetes Aplicados ─── */}
              {paquetesAplicados.length > 0 && (
                <motion.div variants={itemVariants} className="organic-card" style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.8rem' }}>
                    <Package size={14} color="var(--primary-color)" />
                    <p style={{ margin: 0, fontSize: '0.65rem', fontWeight: '950', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Paquetes Aplicados</p>
                  </div>
                  <div style={{ display: 'grid', gap: '8px' }}>
                    {paquetesAplicados.map(pq => (
                      <div key={pq.id} style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px',
                        padding: '8px 10px', borderRadius: '10px',
                        background: 'var(--bg-color)', border: '1px solid var(--border-color)'
                      }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                          {pq.nombre}
                        </span>
                        <motion.button
                          whileHover={{ scale: 1.08 }}
                          whileTap={{ scale: 0.93 }}
                          onClick={() => handleSincronizar(pq.id, pq.nombre)}
                          disabled={syncingId === pq.id}
                          title="Sincronizar este paquete con la materna"
                          style={{
                            display: 'flex', alignItems: 'center', gap: '5px',
                            padding: '6px 10px', borderRadius: '8px', border: 'none',
                            background: syncingId === pq.id ? 'var(--border-color)' : 'var(--primary-color)15',
                            color: syncingId === pq.id ? 'var(--text-muted)' : 'var(--primary-color)',
                            fontSize: '0.7rem', fontWeight: '900', cursor: syncingId === pq.id ? 'not-allowed' : 'pointer',
                            flexShrink: 0, whiteSpace: 'nowrap'
                          }}
                        >
                          <motion.span
                            animate={syncingId === pq.id ? { rotate: 360 } : { rotate: 0 }}
                            transition={syncingId === pq.id ? { duration: 0.8, repeat: Infinity, ease: 'linear' } : {}}
                            style={{ display: 'flex' }}
                          >
                            <RefreshCw size={12} />
                          </motion.span>
                          {syncingId === pq.id ? 'Sincronizando...' : 'Sincronizar'}
                        </motion.button>
                      </div>
                    ))}
                  </div>
                  <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', margin: '8px 0 0', lineHeight: 1.4 }}>
                    Reemplaza los eventos PENDIENTES del paquete con la versión actual.
                  </p>
                </motion.div>
              )}

          </div>

          {/* Main Column: Medical Events */}
          <motion.div
            variants={itemVariants}
            className="organic-card"
            style={{ padding: '0', overflow: 'hidden', height: '100%' }}
          >
              <div style={{ padding: '1.5rem', width: '100%' }}>
                <MedicalEvents key={eventosKey} maternaId={id} />
              </div>
          </motion.div>
      </div>

      {/* Global CSS for the responsive layout */}
      <style>{`
        @media (min-width: 1024px) {
            .detail-grid-layout {
                grid-template-columns: 320px 1fr !important;
                align-items: start;
            }
            .detail-grid-layout > div:first-child {
                position: sticky;
                top: 20px;
            }
        }
      `}</style>
    </motion.div>
  );
};

export default MaternaDetail;
