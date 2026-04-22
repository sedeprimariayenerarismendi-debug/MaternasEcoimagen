import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { 
  ArrowLeft, 
  Baby, 
  Calendar, 
  CreditCard, 
  AlertTriangle, 
  User, 
  MapPin, 
  Phone, 
  Heart,
  Stethoscope,
  ChevronRight,
  Clock
} from 'lucide-react';
import { motion } from 'framer-motion';

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
      case 'ALTA': return '#ef4444';
      case 'MEDIANA': return '#f59e0b';
      case 'BAJA': return '#10b981';
      default: return '#6b7280';
    }
  };

  if (loading) return <div style={{ padding: '2rem' }}>Cargando...</div>;
  if (!materna) return <div style={{ padding: '2rem' }}>Paciente no encontrada.</div>;

  const info = calculatePregnancyInfo(materna.fechaEmbarazo);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      style={{ maxWidth: '1200px', margin: '0 auto' }}
    >
      <button 
        onClick={() => navigate('/maternas')}
        style={{ 
          background: 'none', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px', 
          color: 'var(--text-muted)',
          marginBottom: '2rem',
          fontWeight: '600'
        }}
      >
        <ArrowLeft size={20} />
        Volver al listado
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem', alignItems: 'start' }}>
        {/* Main Content */}
        <div style={{ display: 'grid', gap: '2rem' }}>
          
          {/* Header Card */}
          <div style={{ 
            background: 'var(--card-bg)', 
            padding: '2.5rem', 
            borderRadius: '30px', 
            boxShadow: 'var(--shadow)',
            display: 'flex',
            alignItems: 'center',
            gap: '2.5rem',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{ 
              width: '120px', height: '120px', borderRadius: '35px', 
              background: 'var(--bg-color)', display: 'flex', alignItems: 'center', 
              justifyContent: 'center', color: 'var(--primary-color)'
            }}>
              <Baby size={60} />
            </div>
            
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '8px' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: '900', margin: 0 }}>{materna.nombre}</h1>
                <div style={{ 
                  padding: '6px 16px', borderRadius: '30px', fontWeight: '800', fontSize: '0.9rem',
                  background: `${getRiskColor(materna.tipoRiesgo)}20`, color: getRiskColor(materna.tipoRiesgo)
                }}>
                  Riesgo {materna.tipoRiesgo}
                </div>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
                ID: {materna.tipoDocumento} {materna.documento} • {new Date().getFullYear() - new Date(materna.fechaNacimiento).getFullYear()} años
              </p>
            </div>

            <div style={{ 
              position: 'absolute', right: '-20px', top: '-20px', 
              width: '150px', height: '150px', 
              background: `linear-gradient(135deg, ${getRiskColor(materna.tipoRiesgo)}10 0%, transparent 100%)`,
              borderRadius: '50%'
            }} />
          </div>

          {/* Pregnancy Tracker Card */}
          <div style={{ 
            background: 'white', 
            padding: '2.5rem', 
            borderRadius: '30px', 
            boxShadow: 'var(--shadow)',
            border: '1px solid var(--border-color)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Heart color="var(--primary-color)" />
                Estado del Embarazo
              </h2>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--primary-color)' }}>{info.progress}%</span>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>COMPLETADO</p>
              </div>
            </div>

            <div style={{ width: '100%', height: '24px', background: 'var(--bg-color)', borderRadius: '12px', overflow: 'hidden', marginBottom: '2.5rem', padding: '4px' }}>
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${info.progress}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                style={{ 
                  height: '100%', 
                  background: `linear-gradient(90deg, var(--primary-color), var(--accent-color))`, 
                  borderRadius: '8px',
                  boxShadow: '0 4px 10px rgba(233, 30, 140, 0.2)'
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
              <div style={{ padding: '1.5rem', borderRadius: '20px', background: 'var(--bg-color)', textAlign: 'center' }}>
                <Calendar style={{ marginBottom: '10px', color: 'var(--text-muted)' }} size={24} />
                <p style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)' }}>FECHA PARTO</p>
                <p style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--secondary-color)' }}>{info.edd.toLocaleDateString()}</p>
              </div>
              <div style={{ padding: '1.5rem', borderRadius: '20px', background: 'var(--bg-color)', textAlign: 'center' }}>
                <Clock style={{ marginBottom: '10px', color: 'var(--text-muted)' }} size={24} />
                <p style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)' }}>TIEMPO ACTUAL</p>
                <p style={{ fontSize: '1.1rem', fontWeight: '800' }}>{info.weeks} sem, {info.days} d</p>
              </div>
              <div style={{ padding: '1.5rem', borderRadius: '20px', background: 'var(--bg-color)', textAlign: 'center' }}>
                <Heart style={{ marginBottom: '10px', color: 'var(--text-muted)' }} size={24} />
                <p style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)' }}>MES ACTUAL</p>
                <p style={{ fontSize: '1.1rem', fontWeight: '800' }}>Mes {Math.floor(info.weeks / 4) + 1}</p>
              </div>
            </div>
          </div>

          {/* Placeholder for future info mapping user request for "much info" */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
             <div style={{ background: 'var(--card-bg)', padding: '2rem', borderRadius: '25px', boxShadow: 'var(--shadow)' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Stethoscope size={20} color="var(--secondary-color)" />
                  Información Médica
                </h3>
                <div style={{ display: 'grid', gap: '1rem' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-color)' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Tipo de Sangre</span>
                      <span style={{ fontWeight: '700' }}>O+</span>
                   </div>
                   <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-color)' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Alergias</span>
                      <span style={{ fontWeight: '700' }}>Ninguna</span>
                   </div>
                   <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Último Control</span>
                      <span style={{ fontWeight: '700' }}>Hace 5 días</span>
                   </div>
                </div>
             </div>
             <div style={{ background: 'var(--card-bg)', padding: '2rem', borderRadius: '25px', boxShadow: 'var(--shadow)' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <MapPin size={20} color="var(--primary-color)" />
                  Contacto & Ubicación
                </h3>
                <div style={{ display: 'grid', gap: '1rem' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <Phone size={16} color="var(--text-muted)" />
                      <span style={{ fontWeight: '600' }}>+57 321 456 7890</span>
                   </div>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <User size={16} color="var(--text-muted)" />
                      <span style={{ fontWeight: '600' }}>Contacto Emergencia: Juan Perez</span>
                   </div>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <MapPin size={16} color="var(--text-muted)" />
                      <span style={{ fontWeight: '600' }}>Cúcuta, Calle 10 #5-20</span>
                   </div>
                </div>
             </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div style={{ display: 'grid', gap: '2rem' }}>
          <div style={{ background: 'var(--secondary-color)', padding: '2rem', borderRadius: '25px', color: 'white', boxShadow: '0 10px 20px rgba(59, 130, 246, 0.2)' }}>
            <h3 style={{ fontWeight: '800', marginBottom: '1rem' }}>Acciones Clínicas</h3>
            <div style={{ display: 'grid', gap: '12px' }}>
              <button style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', fontWeight: '700', borderRadius: '15px' }}>
                Registrar Control
              </button>
              <button style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', fontWeight: '700', borderRadius: '15px' }}>
                Agendar Cita
              </button>
            </div>
          </div>

          <div style={{ background: 'var(--card-bg)', padding: '2rem', borderRadius: '25px', boxShadow: 'var(--shadow)' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '1.5rem' }}>Registro Administrativo</h3>
            <div style={{ display: 'grid', gap: '15px' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ padding: '8px', background: 'var(--bg-color)', borderRadius: '10px' }}>
                    <Calendar size={18} color="var(--primary-color)" />
                  </div>
                  <div>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '700' }}>FECHA REGISTRO</p>
                    <p style={{ fontWeight: '600', fontSize: '0.9rem' }}>{new Date(materna.fechaRegistro).toLocaleDateString()}</p>
                  </div>
               </div>
               <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ padding: '8px', background: 'var(--bg-color)', borderRadius: '10px' }}>
                    <User size={18} color="var(--primary-color)" />
                  </div>
                  <div>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '700' }}>CREADO POR</p>
                    <p style={{ fontWeight: '600', fontSize: '0.9rem' }}>{materna.creadaPor?.nombre}</p>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default MaternaDetail;
