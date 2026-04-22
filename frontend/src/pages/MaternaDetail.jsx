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

      <div className="detail-grid" style={{ position: 'relative', zIndex: 1 }}>
        {/* Column 1: Profile & Progress */}
        <div style={{ display: 'grid', gap: '2rem' }}>
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

          {/* Pregnancy Tracker */}
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
        </div>

        {/* Column 2: Medical & Contact */}
        <div style={{ display: 'grid', gap: '2rem' }}>
             <motion.div variants={itemVariants} className="organic-card" style={{ padding: '1.2rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '950', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-main)' }}>
                  <div style={{ padding: '6px', background: 'var(--secondary-color)15', borderRadius: '10px' }}>
                    <Stethoscope size={18} color="var(--secondary-color)" />
                  </div>
                  Data Médica
                </h3>
                <div style={{ display: 'grid', gap: '0.8rem' }}>
                   {[
                     { label: 'Sangre', val: 'O+' },
                     { label: 'Alergias', val: 'Ninguna' },
                     { label: 'Control', val: 'Hace 5d', color: 'var(--success-color)' }
                   ].map((item, i) => (
                     <div key={i} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '6px', borderBottom: i < 2 ? '1px solid var(--border-color)' : 'none' }}>
                        <span style={{ color: 'var(--text-muted)', fontWeight: '700', fontSize: '0.85rem' }}>{item.label}</span>
                        <span style={{ fontWeight: '900', color: item.color || 'var(--text-main)', fontSize: '0.85rem' }}>{item.val}</span>
                     </div>
                   ))}
                </div>
             </motion.div>

             <motion.div variants={itemVariants} className="organic-card" style={{ padding: '1.2rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '950', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-main)' }}>
                  <div style={{ padding: '6px', background: 'var(--primary-color)15', borderRadius: '10px' }}>
                    <MapPin size={18} color="var(--primary-color)" />
                  </div>
                  Contacto
                </h3>
                <div style={{ display: 'grid', gap: '0.6rem' }}>
                   {[
                     { icon: <Phone size={14} />, text: '+57 321 456 7890' },
                     { icon: <User size={14} />, text: 'Pareja: Juan Perez' },
                     { icon: <MapPin size={14} />, text: 'Cúcuta, Calle 10 #5-20' }
                   ].map((item, i) => (
                     <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ padding: '8px', background: 'var(--bg-color)', borderRadius: '10px', color: 'var(--text-muted)', border: '1px solid var(--border-color)' }}>
                          {item.icon}
                        </div>
                        <span style={{ fontWeight: '800', color: 'var(--text-main)', fontSize: '0.85rem' }}>{item.text}</span>
                     </div>
                   ))}
                </div>
             </motion.div>
        </div>

        {/* Column 3: Actions & System */}
        <div style={{ display: 'grid', gap: '2rem' }}>
          <motion.div variants={itemVariants} className="organic-card" style={{ 
            background: 'linear-gradient(135deg, var(--secondary-color) 0%, #1d4ed8 100%)', 
            padding: '2rem', 
            color: 'white', 
            boxShadow: 'var(--secondary-color)40 0 20px' 
          }}>
            <h3 style={{ fontWeight: '950', fontSize: '1.5rem', marginBottom: '1.5rem', letterSpacing: '-0.5px' }}>Acciones</h3>
            <div style={{ display: 'grid', gap: '12px' }}>
              <motion.button 
                whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.3)' }}
                whileTap={{ scale: 0.95 }}
                style={{ width: '100%', padding: '14px', background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', fontWeight: '900', borderRadius: '18px', cursor: 'pointer', fontSize: '1rem' }}
              >
                Nuevo Control
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.15)' }}
                whileTap={{ scale: 0.95 }}
                style={{ width: '100%', padding: '14px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.3)', color: 'white', fontWeight: '900', borderRadius: '18px', cursor: 'pointer', fontSize: '1rem' }}
              >
                Cita
              </motion.button>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="organic-card" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: '950', marginBottom: '1.5rem', color: 'var(--text-main)', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Registro</h3>
            <div style={{ display: 'grid', gap: '1.5rem' }}>
               {[
                 { label: 'REGISTRO', val: new Date(materna.fechaRegistro || Date.now()).toLocaleDateString() },
                 { label: 'AUTORIZADO POR', val: materna.creadaPor?.nombre || 'Administrador' }
               ].map((item, i) => (
                 <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ width: '4px', height: '30px', background: 'var(--primary-color)', borderRadius: '2px' }} />
                    <div>
                        <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '900', letterSpacing: '0.5px' }}>{item.label}</p>
                        <p style={{ fontWeight: '800', fontSize: '1rem', color: 'var(--text-main)' }}>{item.val}</p>
                    </div>
                 </div>
               ))}
            </div>
          </motion.div>
        </div>
      </div>

      <style>{`
        .detail-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1rem;
          align-items: start;
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
