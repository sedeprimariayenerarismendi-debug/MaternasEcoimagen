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

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <LoadingSpinner />;

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
          Centro de control de <span style={{ color: 'var(--primary-color)', fontWeight: '700' }}>{config.clinicName}</span>.
        </p>
      </div>

      <div className="stats-grid" style={{ marginBottom: '1.2rem', position: 'relative', zIndex: 1 }}>
        <StatCard title="Pacientes Maternas" value="124" icon={Users} color="var(--primary-color)" delay={0.1} />
        <StatCard title="Nuevos Registros" value="18" icon={UserPlus} color="var(--secondary-color)" delay={0.2} />
        <StatCard title="Citas Hoy" value="42" icon={Calendar} color="#8b5cf6" delay={0.3} />
        <StatCard title="En Seguimiento" value="86" icon={Activity} color="var(--success-color)" delay={0.4} />
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
        gap: '15px',
        position: 'relative',
        zIndex: 1
      }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="organic-card"
          style={{
            padding: '1.5rem',
            minHeight: 'clamp(180px, 30vw, 300px)',
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
          <h3 style={{ fontSize: '1.2rem', fontWeight: '900', marginBottom: '0.5rem', color: 'var(--text-main)' }}>Resumen Diario</h3>
          <p style={{ color: 'var(--text-muted)', maxWidth: '300px', lineHeight: '1.5', fontSize: '0.85rem' }}>
            Estadísticas demográficas y clínicas listas para seguimiento.
          </p>
        </motion.div>

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
            <h3 style={{ fontSize: '1.1rem', fontWeight: '900', color: 'var(--text-main)' }}>Alertas</h3>
            <span style={{ fontSize: '0.7rem', color: 'var(--error-color)', fontWeight: '900', background: 'var(--error-color)15', padding: '4px 10px', borderRadius: '10px' }}>3 PENDIENTES</span>
          </div>
          {[1,2,3].map(i => (
            <motion.div 
              key={i} 
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
                background: 'var(--error-color)',
              }} />
              <div>
                <p style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--text-main)' }}>Pendiente de Control</p>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>Paciente #102{i} hoy.</p>
              </div>
            </motion.div>
          ))}
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{ 
              marginTop: 'auto', 
              padding: '16px', 
              background: 'var(--bg-color)', 
              color: 'var(--text-main)', 
              fontWeight: '800', 
              fontSize: '0.9rem',
              border: '1px solid var(--border-color)',
              borderRadius: '18px'
            }}
          >
            Ver todas las alertas
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
