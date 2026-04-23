import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';
import { Users, UserPlus, Calendar, Activity, ArrowUpRight } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

const StatCard = ({ title, value, icon: Icon, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay }}
    className="organic-card stat-card"
    style={{
      padding: 'clamp(1rem, 3vw, 1.8rem)',
      display: 'flex',
      alignItems: 'center',
      gap: 'clamp(12px, 3vw, 24px)',
      flex: '1 1 220px',
      position: 'relative',
      overflow: 'hidden'
    }}
  >
    <div style={{ 
      background: `${color}15`, 
      color: color, 
      padding: 'clamp(10px, 2.5vw, 18px)', 
      borderRadius: 'clamp(14px, 3vw, 22px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0
    }}>
      <Icon size={22} />
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <p className="stat-label" style={{ color: 'var(--text-muted)', fontSize: 'clamp(0.62rem, 1.8vw, 0.85rem)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>{title}</p>
      <h3 className="stat-value" style={{ fontSize: 'clamp(1.6rem, 5vw, 2.2rem)', fontWeight: '950', margin: '2px 0', color: 'var(--text-main)', letterSpacing: '-1px' }}>{value}</h3>
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: 'clamp(0.72rem, 2vw, 0.85rem)', color: 'var(--success-color)' }}>
        <div style={{ display: 'flex', alignItems: 'center', background: 'var(--success-color)15', padding: '1px 6px', borderRadius: '6px' }}>
          <ArrowUpRight size={12} />
          <span style={{ fontWeight: '800' }}>12%</span>
        </div>
        <span style={{ color: 'var(--text-muted)', fontWeight: '600' }}>v.s ayer</span>
      </div>
    </div>
  </motion.div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const { config } = useTheme();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ maternas: [], alarmas: [], stats: {} });

  const fetchDashboardData = async () => {
    try {
      const res = await api.get('/maternas');
      const maternas = res.data;
      
      const alarmas = [];
      let citasHoy = 0;
      let enSeguimiento = 0;
      const hoy = new Date();
      hoy.setHours(0,0,0,0);

      maternas.forEach(m => {
        if (m.eventos && m.eventos.length > 0) {
          enSeguimiento++;
          m.eventos.forEach(e => {
            const fechaE = new Date(e.fechaProgramada);
            fechaE.setHours(0,0,0,0);
            
            // Citas para hoy
            if (e.estado === 'PENDIENTE' && fechaE.getTime() === hoy.getTime()) {
              citasHoy++;
            }

            // Lógica de Alarmas de Agendamiento
            if (e.estado === 'PENDIENTE' && !e.estaAgendado) {
              const diffTime = fechaE - hoy;
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

              let urgencia = null;
              let msg = '';

              if (diffDays === 1) { urgencia = 'URGENTE'; msg = 'Agendar para mañana'; }
              else if (diffDays <= 5 && diffDays > 0) { urgencia = 'MEDIA'; msg = `Agendar en ${diffDays} días`; }
              else if (diffDays <= 15 && diffDays > 0) { urgencia = 'BAJA'; msg = `Agendar en ${diffDays} días`; }
              else if (diffDays <= 0) { urgencia = 'VENCIDA'; msg = 'Agendamiento vencido'; }

              if (urgencia) {
                alarmas.push({
                  id: e.id,
                  materna: m.nombre,
                  maternaId: m.id,
                  descripcion: e.descripcion,
                  urgencia,
                  msg,
                  diffDays
                });
              }
            }
          });
        }
      });

      // Ordenar alarmas por urgencia (días restantes)
      alarmas.sort((a, b) => a.diffDays - b.diffDays);

      setData({
        maternas,
        alarmas: alarmas.slice(0, 5), // Mostrar top 5
        totalAlarmas: alarmas.length,
        stats: {
          total: maternas.length,
          hoy: citasHoy,
          seguimiento: enSeguimiento
        }
      });
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) return <LoadingSpinner />;

  const getUrgenciaColor = (u) => {
    switch(u) {
      case 'URGENTE':
      case 'VENCIDA': return 'var(--error-color)';
      case 'MEDIA': return 'var(--warning-color)';
      case 'BAJA': return 'var(--secondary-color)';
      default: return 'var(--text-muted)';
    }
  };

  return (
    <div className="fade-in" style={{ position: 'relative' }}>
      {/* Decorative Blobs */}
      <div className="blob" style={{ 
        width: '400px', height: '400px', background: 'var(--primary-color)', 
        top: '-100px', right: '-100px', filter: 'blur(100px)', opacity: 0.1 
      }} />
      <div className="blob" style={{ 
        width: '300px', height: '300px', background: 'var(--secondary-color)', 
        bottom: '0', left: '-50px', filter: 'blur(80px)', opacity: 0.1 
      }} />

      <div style={{ marginBottom: '1rem', position: 'relative', zIndex: 1 }}>
        <motion.h2 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          style={{ fontSize: 'clamp(1.2rem, 4vw, 2rem)', fontWeight: '900', letterSpacing: '-0.8px' }}
        >
          Hola, {user?.nombre?.split(' ')[0]} 👋
        </motion.h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 'clamp(0.8rem, 2vw, 1rem)', marginTop: '2px' }}>
          Gestión clínica de <span style={{ color: 'var(--primary-color)', fontWeight: '700' }}>{config.clinicName}</span>.
        </p>
      </div>

      <div className="stats-grid" style={{ marginBottom: '1.2rem', position: 'relative', zIndex: 1 }}>
        <StatCard title="Pacientes Maternas" value={data.stats.total} icon={Users} color="var(--primary-color)" delay={0.1} />
        <StatCard title="Gestionadas Hoy" value={data.stats.hoy} icon={Calendar} color="var(--secondary-color)" delay={0.2} />
        <StatCard title="En Seguimiento" value={data.stats.seguimiento} icon={Activity} color="#8b5cf6" delay={0.3} />
        <StatCard title="Pendientes Cita" value={data.totalAlarmas} icon={Activity} color="var(--error-color)" delay={0.4} />
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
        gap: '15px',
        position: 'relative',
        zIndex: 1
      }}>
        {/* Quick Actions / Activity */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="organic-card"
          style={{
            padding: '1.5rem',
            minHeight: '200px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
            backgroundSize: '20px 20px',
            backgroundImage: 'radial-gradient(var(--border-color) 0.5px, transparent 0.5px)',
          }}
        >
          <div style={{ 
            width: '60px', 
            height: '60px', 
            borderRadius: '18px', 
            background: 'var(--bg-color)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            marginBottom: '1rem',
            color: 'var(--text-muted)',
            border: '1px solid var(--border-color)',
          }}>
            <Activity size={30} />
          </div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '900', marginBottom: '0.5rem', color: 'var(--text-main)' }}>Salud del Programa</h3>
          <p style={{ color: 'var(--text-muted)', maxWidth: '300px', lineHeight: '1.5', fontSize: '0.85rem' }}>
            {data.totalAlarmas > 0 
                ? `Tienes ${data.totalAlarmas} actividades que requieren agendamiento proactivo para asegurar el cumplimiento.`
                : 'Todas las pacientes tienen sus citas agendadas correctamente. ¡Buen trabajo!'}
          </p>
        </motion.div>

        {/* Dynamic Scheduling Alarms */}
        <motion.div
           initial={{ opacity: 0, x: 20 }}
           animate={{ opacity: 1, x: 0 }}
           transition={{ duration: 0.5, delay: 0.6 }}
           className="organic-card"
           style={{
             padding: '1.2rem',
             display: 'flex',
             flexDirection: 'column',
             gap: '10px',
           }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '900', color: 'var(--text-main)' }}>Alertas de Agendamiento</h3>
            <span style={{ fontSize: '0.7rem', color: 'var(--error-color)', fontWeight: '900', background: 'var(--error-color)15', padding: '4px 10px', borderRadius: '10px' }}>
                {data.totalAlarmas} PENDIENTES
            </span>
          </div>
          
          {data.alarmas.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  Sin alarmas pendientes.
              </div>
          ) : (
              data.alarmas.map(a => (
                <motion.div 
                  key={a.id} 
                  whileHover={{ x: 5 }}
                  style={{ 
                    padding: '12px', 
                    borderRadius: '16px', 
                    background: 'var(--bg-color)',
                    display: 'flex',
                    gap: '12px',
                    alignItems: 'center',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  <div style={{ 
                    width: '10px', 
                    height: '10px', 
                    borderRadius: '50%', 
                    background: getUrgenciaColor(a.urgencia),
                    boxShadow: `${getUrgenciaColor(a.urgencia)}00 0 0 4px`,
                  }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '0.85rem', fontWeight: '900', color: 'var(--text-main)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {a.materna}
                    </p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '1px' }}>{a.descripcion}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.65rem', fontWeight: '900', color: getUrgenciaColor(a.urgencia), background: `${getUrgenciaColor(a.urgencia)}15`, padding: '2px 8px', borderRadius: '6px', textTransform: 'uppercase' }}>
                        {a.msg}
                    </span>
                  </div>
                </motion.div>
              ))
          )}

          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => window.location.href = '/maternas'}
            style={{ 
              marginTop: 'auto', 
              padding: '16px', 
              background: 'var(--bg-color)', 
              color: 'var(--text-main)', 
              fontWeight: '800', 
              fontSize: '0.9rem',
              border: '1px solid var(--border-color)',
              borderRadius: '18px',
              cursor: 'pointer'
            }}
          >
            Gestionar Agendamientos
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
