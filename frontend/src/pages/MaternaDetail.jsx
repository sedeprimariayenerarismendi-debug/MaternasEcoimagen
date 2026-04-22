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
          gap: '10px', 
          color: 'var(--text-main)',
          marginBottom: '2rem',
          padding: '12px 20px',
          borderRadius: '16px',
          fontWeight: '800',
          fontSize: '0.85rem',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          boxShadow: 'var(--shadow-sm)',
          cursor: 'pointer',
          position: 'relative',
          zIndex: 1
        }}
      >
        <ArrowLeft size={18} />
        Volver al listado
      </motion.button>

      <div className="detail-grid" style={{ position: 'relative', zIndex: 1 }}>
        {/* Column 1: Profile & Progress */}
        <div style={{ display: 'grid', gap: '2rem' }}>
          {/* Header Card */}
          <motion.div variants={itemVariants} className="organic-card" style={{ 
            padding: '2rem', 
            display: 'flex',
            alignItems: 'center',
            gap: '2rem',
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div style={{ 
              width: '100px', height: '100px', borderRadius: '28px', 
              background: 'var(--bg-color)', display: 'flex', alignItems: 'center', 
              justifyContent: 'center', color: 'var(--primary-color)',
              border: '2px solid var(--border-color)',
              flexShrink: 0,
              boxShadow: 'var(--shadow-sm)'
            }}>
              <Baby size={50} />
            </div>
            
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '8px', flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: '2.2rem', fontWeight: '950', margin: 0, letterSpacing: '-1.5px', color: 'var(--text-main)' }}>
                  {materna.nombre}
                </h1>
                <div style={{ 
                  padding: '6px 16px', borderRadius: '25px', fontWeight: '900', fontSize: '0.75rem',
                  textTransform: 'uppercase', letterSpacing: '1px',
                  background: `${getRiskColor(materna.tipoRiesgo)}15`, color: getRiskColor(materna.tipoRiesgo),
                  border: `1px solid ${getRiskColor(materna.tipoRiesgo)}30`
                }}>
                  {materna.tipoRiesgo}
                </div>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', fontWeight: '600' }}>
                <span style={{ color: 'var(--text-main)', fontWeight: '800' }}>{materna.tipoDocumento} {materna.documento}</span> • {new Date().getFullYear() - new Date(materna.fechaNacimiento).getFullYear()} años
              </p>
            </div>
          </motion.div>

          {/* Pregnancy Tracker */}
          <motion.div variants={itemVariants} className="organic-card" style={{ 
            padding: '2.5rem', 
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '15px' }}>
               <div>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-main)', letterSpacing: '-0.5px' }}>
                    <Heart color="var(--primary-color)" fill="var(--primary-color)" size={22} />
                    Gestación
                  </h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: '600', marginTop: '2px' }}>Seguimiento en tiempo real</p>
               </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '2.5rem', fontWeight: '950', color: 'var(--primary-color)', letterSpacing: '-2px' }}>{info.progress}%</span>
                <p style={{ fontSize: '0.7rem', fontWeight: '900', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Completado</p>
              </div>
            </div>

            <div style={{ width: '100%', height: '24px', background: 'var(--bg-color)', borderRadius: '15px', overflow: 'hidden', marginBottom: '2.5rem', padding: '5px', border: '1px solid var(--border-color)' }}>
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${info.progress}%` }}
                transition={{ duration: 1.5, ease: "circOut" }}
                style={{ 
                  height: '100%', 
                  background: `linear-gradient(90deg, var(--primary-color), var(--accent-color))`, 
                  borderRadius: '10px',
                  boxShadow: 'var(--primary-glow) 0 4px 12px'
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1.2rem' }}>
              {[
                { label: 'PARTO ESTIMADO', val: info.edd.toLocaleDateString(), icon: <Calendar size={18} />, color: 'var(--secondary-color)' },
                { label: 'TIEMPO ACTUAL', val: `${info.weeks}s, ${info.days}d`, icon: <Clock size={18} />, color: 'var(--primary-color)' }
              ].map((stat, i) => (
                <div key={i} style={{ padding: '1.2rem', borderRadius: '24px', background: 'var(--bg-color)', textAlign: 'center', border: '1px solid var(--border-color)' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '12px', background: 'var(--card-bg)', margin: '0 auto 10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: stat.color, border: '1px solid var(--border-color)' }}>
                    {stat.icon}
                  </div>
                  <p style={{ fontSize: '0.65rem', fontWeight: '900', color: 'var(--text-muted)', letterSpacing: '1px', marginBottom: '4px' }}>{stat.label}</p>
                  <p style={{ fontSize: '1.1rem', fontWeight: '900', color: 'var(--text-main)', letterSpacing: '-0.5px' }}>{stat.val}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Column 2: Medical & Contact */}
        <div style={{ display: 'grid', gap: '2rem' }}>
             <motion.div variants={itemVariants} className="organic-card" style={{ padding: '2rem' }}>
                <h3 style={{ fontSize: '1.3rem', fontWeight: '950', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-main)', letterSpacing: '-0.5px' }}>
                  <div style={{ padding: '8px', background: 'var(--secondary-color)15', borderRadius: '14px' }}>
                    <Stethoscope size={20} color="var(--secondary-color)" />
                  </div>
                  Data Médica
                </h3>
                <div style={{ display: 'grid', gap: '1.2rem' }}>
                   {[
                     { label: 'Tipo de Sangre', val: 'O+' },
                     { label: 'Alergias', val: 'Ninguna' },
                     { label: 'Último Control', val: 'Hace 5 días', color: 'var(--success-color)' }
                   ].map((item, i) => (
                     <div key={i} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: i < 2 ? '1px solid var(--border-color)' : 'none' }}>
                        <span style={{ color: 'var(--text-muted)', fontWeight: '700', fontSize: '1rem' }}>{item.label}</span>
                        <span style={{ fontWeight: '900', color: item.color || 'var(--text-main)', fontSize: '1rem' }}>{item.val}</span>
                     </div>
                   ))}
                </div>
             </motion.div>

             <motion.div variants={itemVariants} className="organic-card" style={{ padding: '2rem' }}>
                <h3 style={{ fontSize: '1.3rem', fontWeight: '950', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-main)', letterSpacing: '-0.5px' }}>
                  <div style={{ padding: '8px', background: 'var(--primary-color)15', borderRadius: '14px' }}>
                    <MapPin size={20} color="var(--primary-color)" />
                  </div>
                  Contacto
                </h3>
                <div style={{ display: 'grid', gap: '1rem' }}>
                   {[
                     { icon: <Phone size={16} />, text: '+57 321 456 7890' },
                     { icon: <User size={16} />, text: 'Juan Perez (Pareja)' },
                     { icon: <MapPin size={16} />, text: 'Cúcuta, Calle 10 #5-20' }
                   ].map((item, i) => (
                     <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div style={{ padding: '10px', background: 'var(--bg-color)', borderRadius: '14px', color: 'var(--text-muted)', border: '1px solid var(--border-color)' }}>
                          {item.icon}
                        </div>
                        <span style={{ fontWeight: '800', color: 'var(--text-main)', fontSize: '1rem' }}>{item.text}</span>
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
          gap: 2rem;
          align-items: start;
        }

        @media (min-width: 1024px) {
          .detail-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (min-width: 1440px) {
          .detail-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }
      `}</style>
    </motion.div>
  );
};

export default MaternaDetail;
