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
  Clock
} from 'lucide-react';
import { motion } from 'framer-motion';
import LoadingSpinner from '../components/LoadingSpinner';
import MedicalEvents from '../components/MedicalEvents';

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
  const [materna, setMaterna] = useState(null);
  const [loading, setLoading] = useState(true);

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
      style={{ maxWidth: '900px', margin: '0 auto', padding: '0 12px 40px', position: 'relative' }}
    >
      {/* Decorative Blobs */}
      <div className="blob" style={{ width: '300px', height: '300px', background: 'var(--primary-color)', top: '-80px', right: '-60px', filter: 'blur(90px)', opacity: 0.08 }} />

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
          padding: '7px 14px',
          borderRadius: '10px',
          fontWeight: '800',
          fontSize: '0.72rem',
          textTransform: 'uppercase',
          letterSpacing: '0.8px',
          cursor: 'pointer',
          position: 'relative',
          zIndex: 1
        }}
      >
        <ArrowLeft size={14} /> Volver
      </motion.button>

      {/* ─── Header Card ─── */}
      <motion.div
        variants={itemVariants}
        className="organic-card"
        style={{ padding: '1rem', marginBottom: '0.8rem', position: 'relative', zIndex: 1, overflow: 'hidden' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
          {/* Avatar */}
          <div style={{
            width: '52px', height: '52px', minWidth: '52px',
            borderRadius: '16px',
            background: 'var(--primary-color)15',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--primary-color)',
            border: '1px solid var(--primary-color)30',
          }}>
            <Baby size={26} />
          </div>

          {/* Name + meta */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '3px' }}>
              <h1 style={{
                fontSize: 'clamp(1rem, 5vw, 1.6rem)',
                fontWeight: '950',
                margin: 0,
                letterSpacing: '-0.5px',
                color: 'var(--text-main)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: '100%'
              }}>
                {materna.nombre}
              </h1>
              <span style={{
                padding: '3px 10px', borderRadius: '20px', fontWeight: '900', fontSize: '0.6rem',
                textTransform: 'uppercase', letterSpacing: '0.5px', flexShrink: 0,
                background: `${getRiskColor(materna.tipoRiesgo)}15`,
                color: getRiskColor(materna.tipoRiesgo),
                border: `1px solid ${getRiskColor(materna.tipoRiesgo)}30`
              }}>
                {materna.tipoRiesgo}
              </span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', fontWeight: '600', margin: 0 }}>
              <span style={{ color: 'var(--text-main)', fontWeight: '800' }}>{materna.documento}</span>
              <span style={{ margin: '0 6px', opacity: 0.4 }}>•</span>
              {edad} años
            </p>
          </div>
        </div>

        {/* Pregnancy bar inside header */}
        <div style={{ marginTop: '0.9rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.65rem', fontWeight: '900', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Heart size={11} color="var(--primary-color)" fill="var(--primary-color)" /> Gestación
            </span>
            <span style={{ fontSize: '0.65rem', fontWeight: '900', color: 'var(--primary-color)' }}>
              {info.weeks}s {info.days}d · {info.progress}%
            </span>
          </div>
          <div style={{ width: '100%', height: '8px', background: 'var(--bg-color)', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${info.progress}%` }}
              transition={{ duration: 1.2, ease: 'circOut' }}
              style={{
                height: '100%',
                background: 'linear-gradient(90deg, var(--primary-color), var(--accent-color))',
                borderRadius: '8px',
                boxShadow: 'var(--primary-glow) 0 2px 6px'
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
            padding: '0.9rem 1rem',
            marginBottom: '0.8rem',
            background: 'var(--error-color)08',
            border: '1.5px solid var(--error-color)25',
            display: 'flex', gap: '10px', alignItems: 'flex-start',
            position: 'relative', zIndex: 1
          }}
        >
          <AlertTriangle size={18} color="var(--error-color)" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <p style={{ margin: 0, fontSize: '0.65rem', fontWeight: '950', color: 'var(--error-color)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Alerta Clínica</p>
            <p style={{ margin: '3px 0 0', fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-main)' }}>{materna.alertas}</p>
          </div>
        </motion.div>
      )}

      {/* ─── Info Row: EDD + Contact ─── */}
      <motion.div
        variants={itemVariants}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '0.6rem',
          marginBottom: '0.8rem',
          position: 'relative', zIndex: 1
        }}
      >
        {[
          { icon: <Calendar size={14} />, label: 'Fecha Probable Parto', val: info.edd.toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' }), color: 'var(--secondary-color)' },
          { icon: <Phone size={14} />, label: 'Teléfono', val: materna.telefono || 'No registrado', color: 'var(--primary-color)' },
          { icon: <MapPin size={14} />, label: 'Dirección', val: materna.direccion || 'No registrada', color: 'var(--accent-color)' },
          { icon: <User size={14} />, label: 'Contacto/Pareja', val: materna.contactoEmergencia || 'No registrado', color: 'var(--secondary-color)' },
        ].map((item, i) => (
          <div key={i} className="organic-card" style={{ padding: '0.75rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px', height: '32px', minWidth: '32px',
              borderRadius: '10px',
              background: `${item.color}15`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: item.color
            }}>
              {item.icon}
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: '0.6rem', fontWeight: '900', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{item.label}</p>
              <p style={{ margin: '2px 0 0', fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.val}</p>
            </div>
          </div>
        ))}
      </motion.div>

      {/* ─── Medical Events ─── */}
      <motion.div
        variants={itemVariants}
        className="organic-card"
        style={{ padding: '1rem', position: 'relative', zIndex: 1 }}
      >
        <MedicalEvents maternaId={id} />
      </motion.div>
    </motion.div>
  );
};

export default MaternaDetail;
