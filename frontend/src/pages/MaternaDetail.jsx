import React, { useState, useEffect } from 'react';
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
  Stethoscope,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingSpinner from '../components/LoadingSpinner';
import MedicalEvents from '../components/MedicalEvents';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" }
  }
};

const MaternaDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [materna, setMaterna] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMaterna = async () => {
      try {
        const res = await api.get('/maternas');
        const found = res.data.find(m => m.id === parseInt(id));
        setMaterna(found);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchMaterna();
  }, [id]);

  const calculatePregnancyInfo = (pregnancyDate) => {
    const start = new Date(pregnancyDate);
    const now = new Date();
    const diffTime = Math.abs(now - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
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
      <button onClick={() => navigate('/maternas')} style={{ marginTop: '1rem', background: 'var(--primary-color)', color: 'white', padding: '10px 20px', borderRadius: '12px', border: 'none', fontWeight: 'bold' }}>
        Volver
      </button>
    </div>
  );

  const info = calculatePregnancyInfo(materna.fechaEmbarazo);

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      style={{ maxWidth: '1600px', margin: '0 auto', padding: '0 20px', position: 'relative' }}
    >
      {/* Decorative Blobs */}
      <div className="blob" style={{ 
        width: '400px', height: '400px', background: 'var(--primary-color)', 
        top: '-100px', right: '-100px', filter: 'blur(100px)', opacity: 0.1 
      }} />
      <div className="blob" style={{ 
        width: '300px', height: '300px', background: 'var(--secondary-color)', 
        bottom: '100px', left: '-50px', filter: 'blur(80px)', opacity: 0.08 
      }} />

      <motion.button 
        variants={itemVariants}
        onClick={() => navigate('/maternas')}
        whileHover={{ scale: 1.05, x: -5 }}
        whileTap={{ scale: 0.95 }}
        style={{ 
          background: 'var(--card-bg)', 
          border: '1px solid var(--border-color)',
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px', 
          color: 'var(--text-main)',
          marginBottom: '1rem',
          padding: '8px 16px',
          borderRadius: '12px',
          fontWeight: '800',
          fontSize: '0.75rem',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          boxShadow: 'var(--shadow-sm)',
          cursor: 'pointer',
          position: 'relative',
          zIndex: 1
        }}
      >
        <ArrowLeft size={16} />
        Volver
      </motion.button>

      <div className="detail-grid-container" style={{ position: 'relative', zIndex: 1 }}>
        {/* Column 1: Profile Header & Alerts */}
        <div style={{ display: 'grid', gap: '1rem' }}>
          {/* Header Card */}
          <motion.div variants={itemVariants} className="organic-card" style={{ 
            padding: '1.2rem', 
            display: 'flex',
            alignItems: 'center',
            gap: '1.2rem',
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div style={{ 
              width: 'clamp(60px, 15vw, 100px)', height: 'clamp(60px, 15vw, 100px)', borderRadius: '20px', 
              background: 'var(--bg-color)', display: 'flex', alignItems: 'center', 
              justifyContent: 'center', color: 'var(--primary-color)',
              border: '1px solid var(--border-color)',
              flexShrink: 0,
            }}>
              <Baby size={32} />
            </div>
            
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px', flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: 'clamp(1.4rem, 4vw, 2.2rem)', fontWeight: '950', margin: 0, letterSpacing: '-1px', color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {materna.nombre}
                </h1>
                <div style={{ 
                  padding: '4px 12px', borderRadius: '20px', fontWeight: '900', fontSize: '0.65rem',
                  textTransform: 'uppercase', letterSpacing: '0.5px',
                  background: `${getRiskColor(materna.tipoRiesgo)}15`, color: getRiskColor(materna.tipoRiesgo),
                  border: `1px solid ${getRiskColor(materna.tipoRiesgo)}30`
                }}>
                  {materna.tipoRiesgo}
                </div>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: '600' }}>
                <span style={{ color: 'var(--text-main)', fontWeight: '800' }}>{materna.documento}</span> • {new Date().getFullYear() - new Date(materna.fechaNacimiento).getFullYear()} años
              </p>
            </div>
          </motion.div>
          
          {materna.alertas && (
            <motion.div variants={itemVariants} className="organic-card" style={{ 
              padding: '1.2rem', 
              background: 'var(--error-color)10', 
              border: '2px solid var(--error-color)30',
              display: 'flex',
              gap: '12px',
              alignItems: 'flex-start'
            }}>
              <AlertTriangle size={24} color="var(--error-color)" style={{ flexShrink: 0, marginTop: '4px' }} />
              <div>
                <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: '950', color: 'var(--error-color)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Alerta Clínica</h4>
                <p style={{ margin: '4px 0 0', fontSize: '1rem', fontWeight: '800', color: 'var(--text-main)' }}>{materna.alertas}</p>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Main Clinical Section (TOP) */}
      <motion.div variants={itemVariants} className="organic-card" style={{ marginTop: '1.5rem', padding: '1.2rem' }}>
        <MedicalEvents maternaId={id} />
      </motion.div>

      {/* Info Grid (BOTTOM) */}
      <div className="detail-grid" style={{ position: 'relative', zIndex: 1, marginTop: '2rem' }}>
        {/* Column 1: Pregnancy Tracker */}
        <motion.div variants={itemVariants} className="organic-card" style={{ 
          padding: '1.5rem', 
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '10px' }}>
             <div>
                <h2 style={{ fontSize: '1.1rem', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-main)' }}>
                  <Heart color="var(--primary-color)" fill="var(--primary-color)" size={18} />
                  Gestación
                </h2>
             </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '1.8rem', fontWeight: '950', color: 'var(--primary-color)', letterSpacing: '-1px' }}>{info.progress}%</span>
            </div>
          </div>

          <div style={{ width: '100%', height: '18px', background: 'var(--bg-color)', borderRadius: '10px', overflow: 'hidden', marginBottom: '1.5rem', padding: '3px', border: '1px solid var(--border-color)' }}>
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${info.progress}%` }}
              transition={{ duration: 1.5, ease: "circOut" }}
              style={{ 
                height: '100%', 
                background: `linear-gradient(90deg, var(--primary-color), var(--accent-color))`, 
                borderRadius: '6px',
                boxShadow: 'var(--primary-glow) 0 2px 8px'
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.8rem' }}>
            {[
              { label: 'EDD', val: info.edd.toLocaleDateString(), icon: <Calendar size={16} />, color: 'var(--secondary-color)' },
              { label: 'SEMANAS', val: `${info.weeks}s, ${info.days}d`, icon: <Clock size={16} />, color: 'var(--primary-color)' }
            ].map((stat, i) => (
              <div key={i} style={{ padding: '0.8rem', borderRadius: '16px', background: 'var(--bg-color)', textAlign: 'center', border: '1px solid var(--border-color)' }}>
                <div style={{ width: '30px', height: '30px', borderRadius: '10px', background: 'var(--card-bg)', margin: '0 auto 6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: stat.color, border: '1px solid var(--border-color)' }}>
                  {stat.icon}
                </div>
                <p style={{ fontSize: '0.6rem', fontWeight: '900', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>{stat.label}</p>
                <p style={{ fontSize: '0.9rem', fontWeight: '900', color: 'var(--text-main)' }}>{stat.val}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Column 2: Contact Info */}
        <motion.div variants={itemVariants} className="organic-card" style={{ padding: '1.2rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '950', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-main)' }}>
            <div style={{ padding: '6px', background: 'var(--primary-color)15', borderRadius: '10px' }}>
              <MapPin size={18} color="var(--primary-color)" />
            </div>
            Contacto
          </h3>
          <div style={{ display: 'grid', gap: '0.8rem' }}>
            {[
              { icon: <Phone size={16} />, label: 'Teléfono', val: materna.telefono || 'No registrado' },
              { icon: <MapPin size={16} />, label: 'Dirección', val: materna.direccion || 'No registrada' },
              { icon: <User size={16} />, label: 'Contacto/Pareja', val: materna.contactoEmergencia || 'No registrado' }
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ color: 'var(--primary-color)' }}>{item.icon}</div>
                <div>
                  <p style={{ fontSize: '0.65rem', fontWeight: '900', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '2px' }}>{item.label}</p>
                  <p style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-main)' }}>{item.val}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <style>{`
        .detail-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.5rem;
          align-items: start;
          margin-bottom: 2rem;
        }

        @media (min-width: 1024px) {
          .detail-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 2rem;
          }
        }
      `}</style>
    </motion.div>
  );
};

export default MaternaDetail;
