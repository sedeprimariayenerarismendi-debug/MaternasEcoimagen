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

  const calculatePregnancyInfo = (pregnancyDate) => {
    const start = new Date(pregnancyDate);
    const now = new Date();
    const diffTime = Math.abs(now - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Total days in pregnancy (approx 40 weeks)
    const totalDays = 280;
    const progress = Math.min(Math.round((diffDays / totalDays) * 100), 100);
    const weeks = Math.floor(diffDays / 7);
    const days = diffDays % 7;
    
    const edd = new Date(start);
    edd.setDate(edd.getDate() + 280);
    
    return { progress, weeks, days, edd };
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
      case 'ALTA': return '#ef4444';
      case 'MEDIANA': return '#f59e0b';
      case 'BAJA': return '#10b981';
      default: return '#6b7280';
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div>
          <h2 style={{ fontSize: '2rem', fontWeight: '800' }}>Seguimiento de Maternas</h2>
          <p style={{ color: 'var(--text-muted)' }}>Censo y control de pacientes gestantes.</p>
        </div>
        <button 
          onClick={(e) => handleOpenModal(e)}
          style={{ 
            background: 'var(--primary-color)', 
            color: 'white', 
            padding: '12px 24px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px',
            fontWeight: '600'
          }}
        >
          <Plus size={20} />
          Registrar Materna
        </button>
      </div>

      <div style={{ 
        background: 'var(--card-bg)', 
        borderRadius: '24px', 
        boxShadow: 'var(--shadow)',
        overflow: 'hidden'
      }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: '15px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={20} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="Buscar por nombre o documento..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '45px', background: 'var(--bg-color)', border: 'none' }}
            />
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'var(--bg-color)', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '700' }}>
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
                  style={{ borderBottom: '1px solid var(--border-color)', cursor: 'pointer', transition: 'background 0.2s' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-color)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '1.2rem 1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ 
                        width: '40px', height: '40px', borderRadius: '12px', background: 'var(--bg-color)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-color)'
                      }}>
                        <Baby size={20} />
                      </div>
                      <div>
                        <p style={{ fontWeight: '600' }}>{m.nombre}</p>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          Registrada por: {m.creadaPor?.nombre}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '1.2rem 1.5rem' }}>
                    <p style={{ fontSize: '0.9rem', fontWeight: '500' }}>{m.tipoDocumento} {m.documento}</p>
                  </td>
                  <td style={{ padding: '1.2rem 1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem' }}>
                      <Calendar size={16} color="var(--text-muted)" />
                      {new Date(m.fechaEmbarazo).toLocaleDateString()}
                    </div>
                  </td>
                  <td style={{ padding: '1.2rem 1.5rem' }}>
                    <div style={{ 
                      display: 'inline-flex', alignItems: 'center', gap: '6px', 
                      padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '800',
                      background: `${getRiskColor(m.tipoRiesgo)}15`,
                      color: getRiskColor(m.tipoRiesgo)
                    }}>
                      <AlertTriangle size={14} />
                      {m.tipoRiesgo}
                    </div>
                  </td>
                  <td style={{ padding: '1.2rem 1.5rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                      <button onClick={(e) => handleOpenModal(e, m)} style={{ background: 'var(--bg-color)', padding: '8px', color: 'var(--text-muted)' }}>
                        <Edit2 size={18} />
                      </button>
                      <button onClick={(e) => handleDelete(e, m.id)} style={{ background: 'var(--bg-color)', padding: '8px', color: '#ef4444' }}>
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredMaternas.length === 0 && (
            <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <ClipboardList size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
              <p>No se encontraron pacientes maternas.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal Registro/Edición */}
      <AnimatePresence>
        {isModalOpen && (
          <div style={{ 
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', 
            background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
            padding: '20px'
          }}>
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              style={{ 
                background: 'var(--card-bg)', width: '100%', maxWidth: '600px', borderRadius: '24px', padding: '2.5rem',
                boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)', maxHeight: '90vh', overflowY: 'auto'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: '800' }}>
                  {currentMaterna ? 'Editar Registro' : 'Registrar Paciente Materna'}
                </h3>
                <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', color: 'var(--text-muted)' }}>
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem' }}>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px', display: 'block' }}>Nombre Completo</label>
                  <input 
                    type="text" 
                    value={formData.nombre}
                    onChange={e => setFormData({...formData, nombre: e.target.value})}
                    required
                  />
                </div>
                
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px', display: 'block' }}>Tipo Documento</label>
                  <select 
                    value={formData.tipoDocumento}
                    onChange={e => setFormData({...formData, tipoDocumento: e.target.value})}
                  >
                    <option value="CC">Cédula de Ciudadanía</option>
                    <option value="CE">Cédula de Extranjería</option>
                    <option value="TI">Tarjeta de Identidad</option>
                    <option value="RC">Registro Civil</option>
                    <option value="PA">Pasaporte</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px', display: 'block' }}>Documento</label>
                  <input 
                    type="text" 
                    value={formData.documento}
                    onChange={e => setFormData({...formData, documento: e.target.value})}
                    required
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px', display: 'block' }}>Fecha de Nacimiento</label>
                  <input 
                    type="date" 
                    value={formData.fechaNacimiento}
                    onChange={e => setFormData({...formData, fechaNacimiento: e.target.value})}
                    required
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px', display: 'block' }}>Fecha de Embarazo</label>
                  <input 
                    type="date" 
                    value={formData.fechaEmbarazo}
                    onChange={e => setFormData({...formData, fechaEmbarazo: e.target.value})}
                    required
                  />
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px', display: 'block' }}>Tipo de Riesgo</label>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    {['BAJA', 'MEDIANA', 'ALTA'].map(risk => (
                      <button
                        key={risk}
                        type="button"
                        onClick={() => setFormData({...formData, tipoRiesgo: risk})}
                        style={{
                          flex: 1,
                          padding: '10px',
                          borderRadius: '12px',
                          border: '2px solid',
                          borderColor: formData.tipoRiesgo === risk ? getRiskColor(risk) : 'var(--border-color)',
                          background: formData.tipoRiesgo === risk ? `${getRiskColor(risk)}10` : 'transparent',
                          color: formData.tipoRiesgo === risk ? getRiskColor(risk) : 'var(--text-muted)',
                          fontWeight: '700',
                          fontSize: '0.8rem'
                        }}
                      >
                        {risk}
                      </button>
                    ))}
                  </div>
                </div>
                
                <button 
                  type="submit" 
                  style={{ 
                    gridColumn: 'span 2', 
                    background: 'var(--primary-color)', 
                    color: 'white', 
                    padding: '14px', 
                    fontWeight: '700', 
                    marginTop: '1rem',
                    boxShadow: '0 10px 15px -3px rgba(233, 30, 140, 0.3)'
                  }}
                >
                  {currentMaterna ? 'Guardar Cambios' : 'Registrar Paciente'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Maternas;
