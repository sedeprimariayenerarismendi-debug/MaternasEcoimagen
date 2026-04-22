import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  X,
  Baby,
  Calendar,
  CreditCard,
  AlertTriangle,
  ClipboardList
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingSpinner from '../components/LoadingSpinner';

const Maternas = () => {
  const [maternas, setMaternas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentMaterna, setCurrentMaterna] = useState(null);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    nombre: '',
    documento: '',
    tipoDocumento: 'CC',
    fechaNacimiento: '',
    fechaEmbarazo: '',
    tipoRiesgo: 'BAJA'
  });

  const fetchMaternas = async () => {
    try {
      const res = await api.get('/maternas');
      setMaternas(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaternas();
  }, []);

  const handleOpenModal = (e, materna = null) => {
    if (e) e.stopPropagation();
    if (materna) {
      setCurrentMaterna(materna);
      setFormData({
        nombre: materna.nombre,
        documento: materna.documento,
        tipoDocumento: materna.tipoDocumento,
        fechaNacimiento: materna.fechaNacimiento.split('T')[0],
        fechaEmbarazo: materna.fechaEmbarazo.split('T')[0],
        tipoRiesgo: materna.tipoRiesgo
      });
    } else {
      setCurrentMaterna(null);
      setFormData({
        nombre: '',
        documento: '',
        tipoDocumento: 'CC',
        fechaNacimiento: '',
        fechaEmbarazo: '',
        tipoRiesgo: 'BAJA'
      });
    }
    setIsModalOpen(true);
  };

  const handleOpenDetail = (materna) => {
    navigate(`/maternas/${materna.id}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentMaterna) {
        await api.put(`/maternas/${currentMaterna.id}`, formData);
      } else {
        await api.post('/maternas', formData);
      }
      setIsModalOpen(false);
      fetchMaternas();
    } catch (err) {
      alert(err.response?.data?.error || 'Error al guardar registro');
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (window.confirm('¿Estás seguro de eliminar este registro?')) {
      try {
        await api.delete(`/maternas/${id}`);
        fetchMaternas();
      } catch (err) {
        alert('Error al eliminar registro');
      }
    }
  };

  const filteredMaternas = maternas.filter(m => 
    m.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.documento.includes(searchTerm)
  );

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'ALTA': return 'var(--error-color)';
      case 'MEDIANA': return 'var(--warning-color)';
      case 'BAJA': return 'var(--success-color)';
      default: return 'var(--text-muted)';
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="fade-in" style={{ position: 'relative' }}>
      {/* Decorative Blobs */}
      <div className="blob" style={{ 
        width: '500px', height: '500px', background: 'var(--primary-color)', 
        top: '-150px', left: '-150px', filter: 'blur(120px)', opacity: 0.08 
      }} />
      <div className="blob" style={{ 
        width: '400px', height: '400px', background: 'var(--secondary-color)', 
        bottom: '-100px', right: '-100px', filter: 'blur(100px)', opacity: 0.08 
      }} />

      <div className="maternas-header">
        <div>
          <h2 style={{ fontSize: 'clamp(1.5rem, 5vw, 2.5rem)', fontWeight: '900', letterSpacing: '-1px' }}>
            Seguimiento de Maternas
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginTop: '6px' }}>Censo y control inteligente de pacientes gestantes.</p>
        </div>
        <motion.button 
          whileHover={{ scale: 1.05, boxShadow: 'var(--primary-glow) 0 12px 24px' }}
          whileTap={{ scale: 0.95 }}
          onClick={(e) => handleOpenModal(e)}
          style={{ 
            background: 'var(--primary-color)', 
            color: 'white', 
            padding: '14px 28px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px',
            fontWeight: '800',
            borderRadius: '20px',
            boxShadow: 'var(--primary-glow) 0 8px 16px',
            fontSize: '1rem',
            whiteSpace: 'nowrap'
          }}
        >
          <Plus size={20} />
          <span className="btn-text">Registrar Materna</span>
        </motion.button>
      </div>

      <div className="organic-card" style={{ overflow: 'hidden', position: 'relative', zIndex: 1 }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ position: 'relative' }}>
            <Search size={20} style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="Buscar por nombre o documento..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ 
                paddingLeft: '50px', 
                paddingRight: '20px',
                paddingTop: '14px',
                paddingBottom: '14px',
                background: 'var(--bg-color)', 
                border: '1px solid var(--border-color)',
                fontSize: '1rem',
                borderRadius: '16px',
                width: '100%'
              }}
            />
          </div>
        </div>

        {/* Desktop: tabla */}
        <div className="maternas-table-view" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, textAlign: 'left', minWidth: '700px' }}>
            <thead>
              <tr style={{ background: 'var(--bg-color)', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
                <th style={{ padding: '1.2rem 1.5rem' }}>PACIENTE</th>
                <th style={{ padding: '1.2rem 1.5rem' }}>DOCUMENTO</th>
                <th style={{ padding: '1.2rem 1.5rem' }}>F. EMBARAZO</th>
                <th style={{ padding: '1.2rem 1.5rem' }}>RIESGO</th>
                <th style={{ padding: '1.2rem 1.5rem', textAlign: 'right' }}>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {filteredMaternas.map(m => (
                <tr 
                  key={m.id} 
                  onClick={() => handleOpenDetail(m)}
                  style={{ cursor: 'pointer', transition: 'all 0.3s' }}
                  className="table-row-hover"
                >
                  <td style={{ padding: '1.2rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{ width: '44px', height: '44px', borderRadius: '16px', background: 'var(--bg-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-color)', border: '2px solid var(--border-color)', flexShrink: 0 }}>
                        <Baby size={22} />
                      </div>
                      <div>
                        <p style={{ fontWeight: '800', fontSize: '1rem', color: 'var(--text-main)' }}>{m.nombre}</p>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>Por: {m.creadaPor?.nombre || 'Admin'}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '1.2rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
                    <p style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-main)' }}>{m.tipoDocumento} {m.documento}</p>
                  </td>
                  <td style={{ padding: '1.2rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-main)' }}>
                      <Calendar size={16} style={{ color: 'var(--text-muted)' }} />
                      {new Date(m.fechaEmbarazo).toLocaleDateString()}
                    </div>
                  </td>
                  <td style={{ padding: '1.2rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '25px', fontSize: '0.78rem', fontWeight: '900', background: `${getRiskColor(m.tipoRiesgo)}15`, color: getRiskColor(m.tipoRiesgo), border: `1px solid ${getRiskColor(m.tipoRiesgo)}30` }}>
                      <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: getRiskColor(m.tipoRiesgo) }} />
                      {m.tipoRiesgo}
                    </div>
                  </td>
                  <td style={{ padding: '1.2rem 1.5rem', textAlign: 'right', borderBottom: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                      <motion.button whileHover={{ scale: 1.1 }} onClick={(e) => handleOpenModal(e, m)} style={{ background: 'transparent', padding: '8px', color: 'var(--text-muted)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                        <Edit2 size={16} />
                      </motion.button>
                      <motion.button whileHover={{ scale: 1.1 }} onClick={(e) => handleDelete(e, m.id)} style={{ background: 'transparent', padding: '8px', color: 'var(--error-color)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                        <Trash2 size={16} />
                      </motion.button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Móvil: cards */}
        <div className="maternas-cards-view">
          {filteredMaternas.map(m => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => handleOpenDetail(m)}
              style={{
                padding: '1.2rem',
                borderBottom: '1px solid var(--border-color)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '14px', background: 'var(--bg-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-color)', border: '2px solid var(--border-color)', flexShrink: 0 }}>
                    <Baby size={20} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontWeight: '800', fontSize: '1rem', color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.nombre}</p>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{m.tipoDocumento} {m.documento}</p>
                  </div>
                </div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '5px 12px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: '900', background: `${getRiskColor(m.tipoRiesgo)}15`, color: getRiskColor(m.tipoRiesgo), border: `1px solid ${getRiskColor(m.tipoRiesgo)}30`, flexShrink: 0 }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: getRiskColor(m.tipoRiesgo) }} />
                  {m.tipoRiesgo}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: '600' }}>
                  <Calendar size={14} />
                  FUM: {new Date(m.fechaEmbarazo).toLocaleDateString()}
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <motion.button whileTap={{ scale: 0.9 }} onClick={(e) => handleOpenModal(e, m)} style={{ background: 'var(--bg-color)', padding: '8px', color: 'var(--text-muted)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                    <Edit2 size={15} />
                  </motion.button>
                  <motion.button whileTap={{ scale: 0.9 }} onClick={(e) => handleDelete(e, m.id)} style={{ background: 'var(--bg-color)', padding: '8px', color: 'var(--error-color)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                    <Trash2 size={15} />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredMaternas.length === 0 && (
          <div style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
              <ClipboardList size={70} style={{ margin: '0 auto 1.5rem', opacity: 0.1 }} />
              <h3 style={{ fontSize: '1.4rem', fontWeight: '900', color: 'var(--text-main)', marginBottom: '0.5rem' }}>No hay resultados</h3>
              <p>No se encontraron pacientes con esos criterios.</p>
            </motion.div>
          </div>
        )}
      </div>

      {/* Modal Registro/Edición */}
      <AnimatePresence>
        {isModalOpen && (
          <div style={{ 
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', 
            background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 1000,
            padding: '0'
          }}>
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="organic-card modal-sheet"
              style={{ 
                width: '100%', maxWidth: '700px',
                padding: 'clamp(1.5rem, 5vw, 3rem)',
                boxShadow: 'var(--shadow-xl)', maxHeight: '92vh', overflowY: 'auto',
                borderRadius: '32px 32px 0 0',
              }}
            >
              {/* Handle */}
              <div style={{ width: '40px', height: '4px', background: 'var(--border-color)', borderRadius: '2px', margin: '0 auto 2rem' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                  <h3 style={{ fontSize: 'clamp(1.4rem, 5vw, 2rem)', fontWeight: '950', letterSpacing: '-1px', color: 'var(--text-main)' }}>
                    {currentMaterna ? 'Editar Paciente' : 'Nueva Paciente'}
                  </h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '4px' }}>Completa el perfil clínico para el seguimiento.</p>
                </div>
                <motion.button whileHover={{ scale: 1.1 }} onClick={() => setIsModalOpen(false)} style={{ background: 'var(--bg-color)', color: 'var(--text-muted)', padding: '10px', borderRadius: '50%', border: '1px solid var(--border-color)' }}>
                  <X size={22} />
                </motion.button>
              </div>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: '800', marginBottom: '10px', display: 'block', color: 'var(--text-main)', letterSpacing: '0.5px' }}>NOMBRE COMPLETO</label>
                  <input type="text" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} required placeholder="Ej. Maria Lopez" style={{ background: 'var(--bg-color)', border: '1px solid var(--border-color)', borderRadius: '14px', padding: '14px 18px', width: '100%' }} />
                </div>
                
                <div className="form-grid-2">
                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: '800', marginBottom: '10px', display: 'block', color: 'var(--text-main)', letterSpacing: '0.5px' }}>TIPO DOCUMENTO</label>
                    <select value={formData.tipoDocumento} onChange={e => setFormData({...formData, tipoDocumento: e.target.value})} style={{ background: 'var(--bg-color)', border: '1px solid var(--border-color)', borderRadius: '14px', padding: '14px 18px', width: '100%' }}>
                      <option value="CC">Cédula de Ciudadanía</option>
                      <option value="CE">Cédula de Extranjería</option>
                      <option value="TI">Tarjeta de Identidad</option>
                      <option value="RC">Registro Civil</option>
                      <option value="PA">Pasaporte</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: '800', marginBottom: '10px', display: 'block', color: 'var(--text-main)', letterSpacing: '0.5px' }}>NÚMERO DOCUMENTO</label>
                    <input type="text" value={formData.documento} onChange={e => setFormData({...formData, documento: e.target.value})} required placeholder="12345678" style={{ background: 'var(--bg-color)', border: '1px solid var(--border-color)', borderRadius: '14px', padding: '14px 18px', width: '100%' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: '800', marginBottom: '10px', display: 'block', color: 'var(--text-main)', letterSpacing: '0.5px' }}>FECHA NACIMIENTO</label>
                    <input type="date" value={formData.fechaNacimiento} onChange={e => setFormData({...formData, fechaNacimiento: e.target.value})} required style={{ background: 'var(--bg-color)', border: '1px solid var(--border-color)', borderRadius: '14px', padding: '14px 18px', width: '100%' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: '800', marginBottom: '10px', display: 'block', color: 'var(--text-main)', letterSpacing: '0.5px' }}>FECHA EMBARAZO (F.U.M)</label>
                    <input type="date" value={formData.fechaEmbarazo} onChange={e => setFormData({...formData, fechaEmbarazo: e.target.value})} required style={{ background: 'var(--bg-color)', border: '1px solid var(--border-color)', borderRadius: '14px', padding: '14px 18px', width: '100%' }} />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: '800', marginBottom: '14px', display: 'block', color: 'var(--text-main)', letterSpacing: '0.5px' }}>NIVEL DE RIESGO CLÍNICO</label>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    {['BAJA', 'MEDIANA', 'ALTA'].map(risk => (
                      <motion.button key={risk} type="button" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setFormData({...formData, tipoRiesgo: risk})}
                        style={{ flex: 1, padding: '14px', borderRadius: '18px', border: '2px solid', borderColor: formData.tipoRiesgo === risk ? getRiskColor(risk) : 'var(--border-color)', background: formData.tipoRiesgo === risk ? `${getRiskColor(risk)}15` : 'var(--bg-color)', color: formData.tipoRiesgo === risk ? getRiskColor(risk) : 'var(--text-muted)', fontWeight: '900', fontSize: '0.85rem', cursor: 'pointer' }}
                      >
                        {risk}
                      </motion.button>
                    ))}
                  </div>
                </div>
                
                <motion.button type="submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  style={{ background: 'var(--primary-color)', color: 'white', padding: '18px', fontWeight: '900', borderRadius: '20px', fontSize: '1rem', boxShadow: 'var(--primary-glow) 0 10px 20px' }}
                >
                  {currentMaterna ? 'Guardar Cambios' : 'Finalizar Registro'}
                </motion.button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <style>{`
        .maternas-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          gap: 16px;
          position: relative;
          zIndex: 1;
        }
        .maternas-table-view { display: block; }
        .maternas-cards-view { display: none; }
        .form-grid-2 {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.2rem;
        }
        .table-row-hover:hover {
          background: var(--card-bg-hover) !important;
        }
        @media (max-width: 768px) {
          .maternas-table-view { display: none; }
          .maternas-cards-view { display: block; }
          .form-grid-2 { grid-template-columns: 1fr; }
          .btn-text { display: none; }
          .modal-sheet { border-radius: 28px 28px 0 0 !important; }
        }
      `}</style>
    </div>
  );
};

export default Maternas;
