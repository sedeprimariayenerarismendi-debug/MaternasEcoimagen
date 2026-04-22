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
    className="organic-card"
    style={{
      padding: '1.8rem',
      display: 'flex',
      alignItems: 'center',
      gap: '24px',
      flex: '1 1 280px',
      position: 'relative',
      overflow: 'hidden'
    }}
  >
    <div style={{ 
      background: `${color}15`, 
      color: color, 
      padding: '18px', 
      borderRadius: '22px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: `0 8px 16px ${color}10`
    }}>
      <Icon size={28} />
    </div>
    <div style={{ flex: 1 }}>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>{title}</p>
      <h3 style={{ fontSize: '2.2rem', fontWeight: '950', margin: '4px 0', color: 'var(--text-main)', letterSpacing: '-1px' }}>{value}</h3>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--success-color)' }}>
        <div style={{ display: 'flex', alignItems: 'center', background: 'var(--success-color)15', padding: '2px 8px', borderRadius: '8px' }}>
          <ArrowUpRight size={14} />
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
    // Simulate data loading
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

      <div style={{ marginBottom: '2.5rem', position: 'relative', zIndex: 1 }}>
        <motion.h2 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          style={{ fontSize: 'clamp(1.8rem, 5vw, 2.5rem)', fontWeight: '900', letterSpacing: '-1px' }}
        >
          Hola, {user?.nombre?.split(' ')[0]} 👋
        </motion.h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', marginTop: '6px' }}>
          Bienvenido al centro de control de <span style={{ color: 'var(--primary-color)', fontWeight: '700' }}>{config.clinicName}</span>.
        </p>
      </div>

      <div style={{ 
        display: 'flex', 
        gap: '25px', 
        flexWrap: 'wrap', 
        marginBottom: '3rem',
        position: 'relative',
        zIndex: 1
      }}>
        <StatCard title="Pacientes Maternas" value="124" icon={Users} color="var(--primary-color)" delay={0.1} />
        <StatCard title="Nuevos Registros" value="18" icon={UserPlus} color="var(--secondary-color)" delay={0.2} />
        <StatCard title="Citas Hoy" value="42" icon={Calendar} color="#8b5cf6" delay={0.3} />
        <StatCard title="En Seguimiento" value="86" icon={Activity} color="var(--success-color)" delay={0.4} />
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', 
        gap: '30px',
        position: 'relative',
        zIndex: 1
      }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="organic-card"
          style={{
            padding: '3rem',
            minHeight: '420px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
            backgroundSize: '24px 24px',
            backgroundImage: 'radial-gradient(var(--border-color) 1px, transparent 1px)',
          }}
        >
          <div style={{ 
            width: '90px', 
            height: '90px', 
            borderRadius: '28px', 
            background: 'var(--bg-color)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            marginBottom: '2rem',
            color: 'var(--text-muted)',
            border: '2px solid var(--border-color)',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <Activity size={40} />
          </div>
          <h3 style={{ fontSize: '1.6rem', fontWeight: '900', marginBottom: '1rem', color: 'var(--text-main)', letterSpacing: '-0.5px' }}>Resumen de Actividad</h3>
          <p style={{ color: 'var(--text-muted)', maxWidth: '400px', lineHeight: '1.7', fontSize: '1.1rem' }}>
            Aquí se mostrarán los datos demográficos y clínicos una vez que se integre el módulo de pacientes.
          </p>
        </motion.div>

        <motion.div
           initial={{ opacity: 0, x: 20 }}
           animate={{ opacity: 1, x: 0 }}
           transition={{ duration: 0.5, delay: 0.6 }}
           className="organic-card"
           style={{
             padding: '2.5rem',
             display: 'flex',
             flexDirection: 'column',
             gap: '24px',
           }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <h3 style={{ fontSize: '1.4rem', fontWeight: '900', color: 'var(--text-main)', letterSpacing: '-0.5px' }}>Alertas Recientes</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--error-color)', fontWeight: '900', background: 'var(--error-color)15', padding: '6px 14px', borderRadius: '12px', letterSpacing: '0.5px' }}>3 PENDIENTES</span>
          </div>
          {[1,2,3].map(i => (
            <motion.div 
              key={i} 
              whileHover={{ x: 10, backgroundColor: 'var(--card-bg-hover)' }}
              style={{ 
                padding: '20px', 
                borderRadius: '24px', 
                background: 'var(--bg-color)',
                display: 'flex',
                gap: '18px',
                alignItems: 'center',
                border: '1px solid var(--border-color)',
                cursor: 'pointer'
              }}
            >
              <div style={{ 
                width: '14px', 
                height: '14px', 
                borderRadius: '50%', 
                background: 'var(--error-color)',
                boxShadow: '0 0 15px var(--error-color)60'
              }} />
              <div>
                <p style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--text-main)' }}>Pendiente de Control</p>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>Paciente #102{i} requiere seguimiento hoy.</p>
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
