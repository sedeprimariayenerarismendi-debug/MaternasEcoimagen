import React, { useState, useEffect } from 'react';
import api from '../api';
import { 
  Plus, 
  Trash2, 
  Edit2,
  Package, 
  ChevronRight, 
  X, 
  Info,
  Calendar,
  Layers,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotification } from '../context/NotificationContext';
import LoadingSpinner from '../components/LoadingSpinner';

const Paquetes = () => {
  const [paquetes, setPaquetes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPackage, setCurrentPackage] = useState(null);
  const { notify, confirm } = useNotification();
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    trimestre: '',
    plantillas: []
  });

  const fetchPaquetes = async () => {
    try {
      const res = await api.get('/paquetes');
      setPaquetes(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaquetes();
  }, []);

  const handleOpenModal = (paquete = null) => {
    if (paquete) {
      setCurrentPackage(paquete);
      setFormData({
        nombre: paquete.nombre,
        descripcion: paquete.descripcion || '',
        plantillas: paquete.plantillas.map(p => ({
          tipo: p.tipo,
          descripcion: p.descripcion,
          semanasRelativas: p.semanasRelativas,
          esObligatorio: p.esObligatorio,
          esControl: p.esControl || false,
          codigoCUPS: p.codigoCUPS || '',
          cantidad: p.cantidad || 1,
          trimestre: p.trimestre || ''
        })),
        trimestre: paquete.trimestre || ''
      });
    } else {
      setCurrentPackage(null);
      setFormData({
        nombre: '',
        descripcion: '',
        trimestre: '',
        plantillas: []
      });
    }
    setIsModalOpen(true);
  };

  const handleAddTemplate = () => {
    setFormData({
      ...formData,
      plantillas: [
        ...formData.plantillas,
        { tipo: 'ESTUDIO', descripcion: '', semanasRelativas: 0, esObligatorio: false, esControl: false, cantidad: 1, trimestre: '' }
      ]
    });
  };

  const handleRemoveTemplate = (index) => {
    const newTemplates = [...formData.plantillas];
    newTemplates.splice(index, 1);
    setFormData({ ...formData, plantillas: newTemplates });
  };

  const handleUpdateTemplate = (index, field, value) => {
    const newTemplates = [...formData.plantillas];
    newTemplates[index][field] = value;
    setFormData({ ...formData, plantillas: newTemplates });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentPackage) {
        await api.put(`/paquetes/${currentPackage.id}`, formData);
      } else {
        await api.post('/paquetes', formData);
      }
      setIsModalOpen(false);
      notify(currentPackage ? 'Paquete actualizado' : 'Paquete creado con éxito');
      fetchPaquetes();
    } catch (err) {
      notify(currentPackage ? 'Error al actualizar paquete' : 'Error al crear paquete', 'error');
    }
  };

  const handleDelete = async (id) => {
    const ok = await confirm({
        title: '¿Eliminar Paquete?',
        message: 'Esto no afectará a las pacientes que ya lo tengan aplicado, pero no podrá usarse en nuevos registros.',
        confirmText: 'Eliminar Paquete',
        type: 'danger'
    });

    if (ok) {
      try {
        await api.delete(`/paquetes/${id}`);
        notify('Paquete eliminado');
        fetchPaquetes();
      } catch (err) {
        notify('Error al eliminar', 'error');
      }
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="fade-in">
      {/* Decorative Blobs */}
      <div className="blob" style={{ 
        width: '400px', height: '400px', background: 'var(--accent-color)', 
        top: '-100px', right: '-100px', filter: 'blur(100px)', opacity: 0.05 
      }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ fontSize: '2rem', fontWeight: '950', letterSpacing: '-1px', color: 'var(--text-main)' }}>Paquetes Médicos</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Configura sets predefinidos de citas y estudios.</p>
        </div>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleOpenModal()}
          style={{ 
            background: 'var(--primary-color)', color: 'white', border: 'none', 
            padding: '12px 24px', borderRadius: '16px', fontWeight: '800', 
            display: 'flex', alignItems: 'center', gap: '10px', boxShadow: 'var(--primary-glow) 0 10px 20px'
          }}
        >
          <Plus size={20} /> Nuevo Paquete
        </motion.button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
        {paquetes.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', padding: '4rem', textAlign: 'center', background: 'var(--card-bg)', borderRadius: '24px', border: '2px dashed var(--border-color)' }}>
              <Package size={60} style={{ opacity: 0.1, margin: '0 auto 1.5rem' }} />
              <h3 style={{ color: 'var(--text-main)', fontWeight: '900' }}>No hay paquetes creados</h3>
              <p style={{ color: 'var(--text-muted)' }}>Crea paquetes para estandarizar el seguimiento de tus pacientes.</p>
          </div>
        ) : paquetes.map(p => (
          <motion.div 
            key={p.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="organic-card"
            style={{ 
                padding: '1.5rem', 
                display: 'flex', 
                flexDirection: 'column',
                minWidth: 0 // Importante para que el overflow: ellipsis funcione en los hijos
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div style={{ padding: '10px', background: 'var(--primary-color)10', borderRadius: '14px', color: 'var(--primary-color)', flexShrink: 0 }}>
                    <Layers size={24} />
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <motion.button 
                        whileHover={{ scale: 1.1 }}
                        onClick={() => handleOpenModal(p)} 
                        style={{ background: 'var(--bg-color)', border: '1px solid var(--border-color)', color: 'var(--text-muted)', padding: '8px', borderRadius: '10px', cursor: 'pointer' }}
                    >
                        <Edit2 size={16} />
                    </motion.button>
                    <button onClick={() => handleDelete(p.id)} style={{ background: 'var(--error-color)10', border: '1px solid var(--error-color)20', color: 'var(--error-color)', padding: '8px', borderRadius: '10px', cursor: 'pointer' }}>
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>
            <h3 style={{ 
                fontWeight: '900', 
                fontSize: '1.2rem', 
                margin: '0 0 5px', 
                color: 'var(--text-main)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
            }}>{p.nombre}</h3>
            <p style={{ 
                fontSize: '0.85rem', 
                color: 'var(--text-muted)', 
                marginBottom: '1.5rem',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                lineHeight: '1.4'
            }}>{p.descripcion}</p>
            
            <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '0.75rem', fontWeight: '900', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.8rem' }}>Plantillas ({p.plantillas.length})</p>
                <div style={{ display: 'grid', gap: '6px' }}>
                    {p.plantillas.slice(0, 5).map((tmpl, i) => (
                        <div key={i} style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '8px', 
                            fontSize: '0.8rem', 
                            color: 'var(--text-main)', 
                            background: 'var(--bg-color)', 
                            padding: '6px 10px', 
                            borderRadius: '8px',
                            minWidth: 0
                        }}>
                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: tmpl.tipo === 'LABORATORIO' ? 'var(--primary-color)' : tmpl.tipo === 'ESTUDIO' ? 'var(--accent-color)' : tmpl.tipo === 'VACUNA' ? 'var(--accent-color)' : 'var(--secondary-color)', flexShrink: 0 }} />
                            <span style={{ fontWeight: '700', whiteSpace: 'nowrap', flexShrink: 0 }}>Sem {tmpl.semanasRelativas}:</span>
                            <span style={{ 
                                opacity: 0.8, 
                                overflow: 'hidden', 
                                textOverflow: 'ellipsis', 
                                whiteSpace: 'nowrap',
                                flex: 1
                            }}>{tmpl.descripcion}</span>
                        </div>
                    ))}
                    {p.plantillas.length > 5 && (
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '4px' }}>+ {p.plantillas.length - 5} más...</p>
                    )}
                </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Modal Crear */}
      <AnimatePresence>
        {isModalOpen && (
          <div style={{ 
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', 
            background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000,
            padding: '20px'
          }}>
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="organic-card"
              style={{ 
                width: '100%', maxWidth: '800px',
                maxHeight: '90vh', overflowY: 'auto',
                padding: '2.5rem',
                boxShadow: 'var(--shadow-xl)',
                position: 'relative'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h3 style={{ fontSize: '1.6rem', fontWeight: '950', color: 'var(--text-main)', margin: 0 }}>Nuevo Paquete</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Define los eventos base para este set.</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} style={{ background: 'var(--bg-color)', border: '1px solid var(--border-color)', padding: '10px', borderRadius: '50%', color: 'var(--text-muted)', cursor: 'pointer' }}>
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
                    <div>
                        <label style={{ fontSize: '0.8rem', fontWeight: '900', color: 'var(--text-main)', marginBottom: '8px', display: 'block' }}>NOMBRE DEL PAQUETE</label>
                        <input 
                            type="text" 
                            required
                            value={formData.nombre}
                            onChange={e => setFormData({...formData, nombre: e.target.value})}
                            placeholder="Ej. Control Prenatal Estándar"
                            style={{ width: '100%', padding: '14px', borderRadius: '14px', border: '1px solid var(--border-color)', background: 'var(--bg-color)' }}
                        />
                    </div>
                    <div>
                        <label style={{ fontSize: '0.8rem', fontWeight: '900', color: 'var(--text-main)', marginBottom: '8px', display: 'block' }}>DESCRIPCIÓN</label>
                        <input 
                            type="text" 
                            value={formData.descripcion}
                            onChange={e => setFormData({...formData, descripcion: e.target.value})}
                            placeholder="Breve explicación del objetivo"
                            style={{ width: '100%', padding: '14px', borderRadius: '14px', border: '1px solid var(--border-color)', background: 'var(--bg-color)' }}
                        />
                    </div>
                </div>

                <div style={{ background: 'var(--primary-color)05', padding: '1.5rem', borderRadius: '20px', border: '1px solid var(--primary-color)10' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: '900', color: 'var(--primary-color)', marginBottom: '12px', display: 'block', textTransform: 'uppercase' }}>Configuración del Seguimiento</label>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button 
                            type="button" 
                            onClick={() => setFormData({...formData, trimestre: ''})}
                            style={{ 
                                flex: 1, padding: '12px', borderRadius: '12px', border: '2px solid', 
                                borderColor: formData.trimestre === '' ? 'var(--primary-color)' : 'var(--border-color)',
                                background: formData.trimestre === '' ? 'white' : 'transparent',
                                color: formData.trimestre === '' ? 'var(--primary-color)' : 'var(--text-muted)',
                                fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s'
                            }}
                        >
                            Paquete de Consultas
                        </button>
                        <select 
                            value={formData.trimestre || ''}
                            onChange={(e) => setFormData({...formData, trimestre: e.target.value})}
                            style={{ 
                                flex: 1, padding: '12px', borderRadius: '12px', border: '2px solid', 
                                borderColor: formData.trimestre !== '' ? 'var(--accent-color)' : 'var(--border-color)',
                                background: formData.trimestre !== '' ? 'white' : 'transparent',
                                color: formData.trimestre !== '' ? 'var(--accent-color)' : 'var(--text-muted)',
                                fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer'
                            }}
                        >
                            <option value="">- O Elegir Trimestre -</option>
                            <option value="1er Trimestre">Para 1er Trimestre</option>
                            <option value="2do Trimestre">Para 2do Trimestre</option>
                            <option value="3er Trimestre">Para 3er Trimestre</option>
                        </select>
                    </div>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '8px', paddingLeft: '4px' }}>
                        {formData.trimestre === '' 
                            ? "Los eventos de este paquete permitirán definir cantidades personalizadas (ej. Consultas)." 
                            : `Todos los estudios y laboratorios se marcarán automáticamente para el ${formData.trimestre}.`}
                    </p>
                </div>

                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: '900', color: 'var(--text-main)', display: 'block' }}>EVENTOS EN EL PAQUETE</label>
                        <button 
                            type="button" 
                            onClick={handleAddTemplate}
                            style={{ 
                                background: 'var(--secondary-color)10', color: 'var(--secondary-color)', 
                                border: '1px solid var(--secondary-color)30', padding: '6px 12px', 
                                borderRadius: '10px', fontWeight: '800', fontSize: '0.75rem', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', gap: '6px'
                            }}
                        >
                            <Plus size={14} /> Añadir Evento
                        </button>
                    </div>

                    <div style={{ display: 'grid', gap: '1rem' }}>
                        {formData.plantillas.length === 0 && (
                            <div style={{ padding: '2rem', textAlign: 'center', background: 'var(--bg-color)', borderRadius: '16px', border: '1px dashed var(--border-color)', color: 'var(--text-muted)' }}>
                                No has añadido eventos todavía.
                            </div>
                        )}
                        {formData.plantillas.map((tmpl, index) => (
                            <div key={index} style={{ 
                              display: 'grid', 
                              gridTemplateColumns: '120px 1fr 100px 100px 50px 40px', 
                              gap: '10px', 
                              alignItems: 'center', 
                              padding: '12px', 
                              background: 'var(--bg-color)', 
                              borderRadius: '14px', 
                              border: '1px solid var(--border-color)' 
                            }}>
                                <select 
                                    value={tmpl.tipo}
                                    onChange={e => handleUpdateTemplate(index, 'tipo', e.target.value)}
                                    style={{ 
                                      background: 'var(--card-bg)', border: '1px solid var(--border-color)', 
                                      borderRadius: '10px', padding: '8px', fontWeight: '800', fontSize: '0.75rem', color: 'var(--text-main)' 
                                    }}
                                >
                                    <option value="ESTUDIO">ESTUDIO</option>
                                    <option value="CONTROL">CONTROL</option>
                                    <option value="LABORATORIO">LABORATORIO</option>
                                    <option value="VACUNA">VACUNA</option>
                                    <option value="CONSULTA">CONSULTA</option>
                                </select>
                                <input 
                                    type="text"
                                    required
                                    value={tmpl.descripcion}
                                    onChange={e => handleUpdateTemplate(index, 'descripcion', e.target.value)}
                                    placeholder="Descripción del evento"
                                    style={{ flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.8rem' }}
                                />
                                <input 
                                    type="text"
                                    value={tmpl.codigoCUPS || ''}
                                    onChange={e => handleUpdateTemplate(index, 'codigoCUPS', e.target.value)}
                                    placeholder="CUPS"
                                    style={{ padding: '8px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.8rem' }}
                                />
                                <div>
                                    {tmpl.tipo === 'CONSULTA' ? (
                                      <>
                                        <p style={{ fontSize: '0.65rem', fontWeight: '950', color: 'var(--text-muted)', marginBottom: '2px', whiteSpace: 'nowrap' }}>
                                            CANTIDAD
                                        </p>
                                        <input 
                                            type="number"
                                            min="1"
                                            max="99"
                                            required
                                            value={tmpl.cantidad || 1}
                                            onChange={e => handleUpdateTemplate(index, 'cantidad', parseInt(e.target.value) || 1)}
                                            style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.8rem', textAlign: 'center' }}
                                        />
                                      </>
                                    ) : (
                                      <>
                                        <p style={{ fontSize: '0.65rem', fontWeight: '950', color: 'var(--text-muted)', marginBottom: '2px', whiteSpace: 'nowrap' }}>
                                            ETAPA / TRIM.
                                        </p>
                                        {formData.trimestre ? (
                                            <div style={{ 
                                                padding: '8px', borderRadius: '8px', background: 'var(--accent-color)10', 
                                                fontSize: '0.75rem', fontWeight: '800', textAlign: 'center',
                                                border: '1px solid var(--accent-color)20', color: 'var(--accent-color)'
                                            }}>
                                                {formData.trimestre.split(' ')[0]}
                                            </div>
                                        ) : (
                                            <select 
                                                value={tmpl.trimestre || ''}
                                                onChange={e => handleUpdateTemplate(index, 'trimestre', e.target.value)}
                                                style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.8rem' }}
                                            >
                                                <option value="">- Gral -</option>
                                                <option value="1er Trimestre">1ro</option>
                                                <option value="2do Trimestre">2do</option>
                                                <option value="3er Trimestre">3ro</option>
                                            </select>
                                        )}
                                      </>
                                    )}
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <p style={{ fontSize: '0.65rem', fontWeight: '900', color: 'var(--text-muted)', marginBottom: '2px' }}>OBLIG.</p>
                                    <input 
                                        type="checkbox"
                                        checked={tmpl.esObligatorio}
                                        onChange={e => handleUpdateTemplate(index, 'esObligatorio', e.target.checked)}
                                        style={{ width: '16px', height: '16px' }}
                                    />
                                </div>
                                <button type="button" onClick={() => handleRemoveTemplate(index)} style={{ background: 'transparent', border: 'none', color: 'var(--error-color)', cursor: 'pointer' }}>
                                    <X size={18} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                    <button type="button" onClick={() => setIsModalOpen(false)} style={{ flex: 1, padding: '16px', borderRadius: '16px', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontWeight: '800', cursor: 'pointer' }}>
                        Cancelar
                    </button>
                    <button type="submit" style={{ flex: 2, padding: '16px', borderRadius: '16px', border: 'none', background: 'var(--primary-color)', color: 'white', fontWeight: '900', cursor: 'pointer', boxShadow: 'var(--primary-glow) 0 8px 15px' }}>
                        Guardar Paquete
                    </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Paquetes;
