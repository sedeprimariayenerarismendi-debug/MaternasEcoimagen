import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';
import { Users, UserPlus, Calendar, Activity, ArrowUpRight } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay }}
    style={{
      background: 'var(--card-bg)',
      padding: '1.5rem',
      borderRadius: '20px',
      boxShadow: 'var(--shadow)',
      display: 'flex',
      alignItems: 'center',
      gap: '20px',
      flex: 1,
      minWidth: '250px'
    }}
  >
    <div style={{ 
      background: `${color}15`, 
      color: color, 
      padding: '15px', 
      borderRadius: '16px' 
    }}>
      <Icon size={28} />
    </div>
    <div style={{ flex: 1 }}>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: '500' }}>{title}</p>
      <h3 style={{ fontSize: '1.8rem', fontWeight: '800', margin: '4px 0' }}>{value}</h3>
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: '#10b981' }}>
        <ArrowUpRight size={14} />
        <span style={{ fontWeight: '600' }}>+12%</span>
        <span style={{ color: 'var(--text-muted)' }}>esta semana</span>
      </div>
    </div>
  </motion.div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const { config } = useTheme();

  return (
    <div>
      <div style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: '800' }}>
          Hola, {user?.nombre?.split(' ')[0]} 👋
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
          Bienvenido al centro de control de {config.clinicName}.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '25px', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
        <StatCard title="Pacientes Maternas" value="124" icon={Users} color="var(--primary-color)" delay={0.1} />
        <StatCard title="Nuevos Registros" value="18" icon={UserPlus} color="var(--secondary-color)" delay={0.2} />
        <StatCard title="Citas Hoy" value="42" icon={Calendar} color="#8b5cf6" delay={0.3} />
        <StatCard title="En Seguimiento" value="86" icon={Activity} color="#10b981" delay={0.4} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '25px' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          style={{
            background: 'var(--card-bg)',
            padding: '2.5rem',
            borderRadius: '24px',
            boxShadow: 'var(--shadow)',
            minHeight: '400px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
            border: '2px dashed var(--border-color)'
          }}
        >
          <div style={{ 
            width: '80px', 
            height: '80px', 
            borderRadius: '50%', 
            background: 'var(--bg-color)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            marginBottom: '1rem',
            color: 'var(--text-muted)'
          }}>
            <Activity size={32} />
          </div>
          <h3 style={{ fontSize: '1.4rem', fontWeight: '700', marginBottom: '0.5rem' }}>Resumen de Actividad</h3>
          <p style={{ color: 'var(--text-muted)', maxWidth: '400px' }}>
            Aquí se mostrarán los datos demográficos y clínicos una vez que se integre el módulo de pacientes.
          </p>
        </motion.div>

        <motion.div
           initial={{ opacity: 0, x: 20 }}
           animate={{ opacity: 1, x: 0 }}
           transition={{ duration: 0.5, delay: 0.6 }}
           style={{
             background: 'var(--card-bg)',
             padding: '2rem',
             borderRadius: '24px',
             boxShadow: 'var(--shadow)',
             display: 'flex',
             flexDirection: 'column',
             gap: '20px'
           }}
        >
          <h3 style={{ fontSize: '1.2rem', fontWeight: '700' }}>Alertas Recientes</h3>
          {[1,2,3].map(i => (
            <div key={i} style={{ 
              padding: '15px', 
              borderRadius: '16px', 
              background: 'var(--bg-color)',
              display: 'flex',
              gap: '12px'
            }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444', marginTop: '6px' }} />
              <div>
                <p style={{ fontSize: '0.9rem', fontWeight: '600' }}>Pendiente de Control</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Paciente #1029 requiere seguimiento hoy.</p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
