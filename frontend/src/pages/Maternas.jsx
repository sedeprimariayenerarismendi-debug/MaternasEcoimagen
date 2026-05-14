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
  ClipboardList,
  Folder,
  Upload,
  FileSpreadsheet
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingSpinner from '../components/LoadingSpinner';
import { useNotification } from '../context/NotificationContext';

const Maternas = () => {
  const [maternas, setMaternas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentMaterna, setCurrentMaterna] = useState(null);
  const [paquetes, setPaquetes] = useState([]);
  const navigate = useNavigate();
  const { notify, confirm } = useNotification();
  const [importing, setImporting] = useState(false);
  
  const [formData, setFormData] = useState({
    nombre: '',
    documento: '',
    tipoDocumento: 'CC',
    fechaNacimiento: '',
    fechaEmbarazo: '',
    tipoRiesgo: 'BAJA',
    paquetesSeleccionados: [],
    alertas: '',
    telefono: '',
    direccion: '',
    contactoEmergencia: '',
    carpetaEntregada: false
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
    const fetchPaquetes = async () => {
        try {
            const res = await api.get('/paquetes');
            setPaquetes(res.data);
        } catch (err) { console.error(err); }
    };
    fetchPaquetes();
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
        tipoRiesgo: materna.tipoRiesgo,
        paquetesSeleccionados: materna.paquetesSeleccionados || [],
        alertas: materna.alertas || '',
        telefono: materna.telefono || '',
        direccion: materna.direccion || '',
        contactoEmergencia: materna.contactoEmergencia || '',
        contactoEmergencia: materna.contactoEmergencia || '',
        carpetaEntregada: materna.carpetaEntregada || false,
        fichaFomag: materna.fichaFomag || {
          regional: '',
          grupoEtnico: '',
          nivelEducativo: '',
          ocupacion: '',
          regimen: '',
          tipoVinculacion: ''
        }
      });
    } else {
      setCurrentMaterna(null);
      setFormData({
        nombre: '',
        documento: '',
        tipoDocumento: 'CC',
        fechaNacimiento: '',
        fechaEmbarazo: '',
        tipoRiesgo: 'BAJA',
        paquetesSeleccionados: [],
        alertas: '',
        telefono: '',
        direccion: '',
        contactoEmergencia: '',
        contactoEmergencia: '',
        carpetaEntregada: false,
        fichaFomag: {
          regional: '',
          grupoEtnico: '',
          nivelEducativo: '',
          ocupacion: '',
          regimen: '',
          tipoVinculacion: ''
        }
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
      let maternaId = currentMaterna?.id;
      if (currentMaterna) {
        await api.put(`/maternas/${currentMaterna.id}`, formData);
      } else {
        const res = await api.post('/maternas', formData);
        maternaId = res.data.id;
      }

      // Aplicar paquetes seleccionados
      if (formData.paquetesSeleccionados && formData.paquetesSeleccionados.length > 0) {
          await Promise.all(formData.paquetesSeleccionados.map(async (pid) => {
              if (pid === 'basico') {
                  await api.post(`/eventos/materna/${maternaId}/generar-basicos`);
              } else {
                  await api.post(`/paquetes/aplicar/${pid}/materna/${maternaId}`);
              }
          }));
      }

      setIsModalOpen(false);
      notify(currentMaterna ? 'Paciente actualizada correctamente' : 'Paciente registrada con éxito');
      fetchMaternas();
    } catch (err) {
      notify(err.response?.data?.error || 'Error al guardar registro', 'error');
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    const ok = await confirm({
        title: '¿Eliminar Registro?',
        message: 'Esta acción no se puede deshacer y eliminará todo el historial de la paciente.',
        confirmText: 'Eliminar Paciente',
        type: 'danger'
    });

    if (ok) {
      try {
        await api.delete(`/maternas/${id}`);
        notify('Registro eliminado con éxito');
        fetchMaternas();
      } catch (err) {
        notify('Error al eliminar registro', 'error');
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

  const handleDownloadAllFomag = async () => {
    try {
      notify('Generando reporte FOMAG...', 'info');
      const res = await api.get('/fomag/export/excel', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `FOMAG_Toda_Cohorte_${new Date().toISOString().slice(0, 10)}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      notify('Reporte descargado correctamente', 'success');
    } catch (err) {
      console.error(err);
      notify('Error al descargar el reporte', 'error');
    }
  };

  const handleImportFomag = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    setImporting(true);
    try {
      notify('Importando archivo FOMAG...', 'info');
      const form = new FormData();
      form.append('archivo', file);
      const res = await api.post('/fomag/import', form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const { creados, actualizados, errores } = res.data;
      notify(
        `✅ Importación completa: ${creados} creadas, ${actualizados} actualizadas${errores.length ? `, ${errores.length} errores` : ''}`,
        errores.length ? 'warning' : 'success',
        6000
      );
      fetchMaternas();
    } catch (err) {
      notify(err.response?.data?.error || 'Error al importar el archivo', 'error');
    } finally {
      setImporting(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <>
    <div className="maternas-page-content" style={{ position: 'relative', overflowX: 'hidden' }}>
      {/* Decorative Blobs */}
      <div className="blob" style={{ 
        width: '500px', height: '500px', background: 'var(--primary-color)', 
        top: '-150px', left: '-150px', filter: 'blur(120px)', opacity: 0.08 
      }} />
      <div className="blob" style={{ 
        width: '400px', height: '400px', background: 'var(--secondary-color)', 
        bottom: '-100px', right: '-100px', filter: 'blur(100px)', opacity: 0.08 
      }} />

      <div className="maternas-header" style={{ marginBottom: '1rem' }}>
        <div>
          <h2 style={{ fontSize: 'clamp(1.2rem, 4vw, 2.2rem)', fontWeight: '900', letterSpacing: '-0.8px' }}>
            Maternas
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '2px' }}>Gestión de pacientes gestantes.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {/* Importar FOMAG */}
          <input
            id="fomag-import-input"
            type="file"
            accept=".xlsx,.xls"
            style={{ display: 'none' }}
            onChange={handleImportFomag}
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={importing}
            onClick={() => document.getElementById('fomag-import-input').click()}
            style={{
              background: importing ? 'var(--border-color)' : 'linear-gradient(135deg, #4a1942, #7b2d8b)',
              color: 'white',
              padding: '10px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontWeight: '800',
              borderRadius: '16px',
              fontSize: '0.9rem',
              whiteSpace: 'nowrap',
              border: 'none',
              cursor: importing ? 'not-allowed' : 'pointer'
            }}
          >
            <Upload size={18} />
            <span className="btn-text">{importing ? 'Importando...' : 'Importar FOMAG'}</span>
          </motion.button>

          {/* Exportar FOMAG */}
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleDownloadAllFomag}
            style={{ 
              background: 'linear-gradient(135deg, #1b5e20, #2e7d32)', 
              color: 'white', 
              padding: '10px 20px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              fontWeight: '800',
              borderRadius: '16px',
              fontSize: '0.9rem',
              whiteSpace: 'nowrap',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            <FileSpreadsheet size={18} />
            <span className="btn-text">Exportar FOMAG</span>
          </motion.button>
          
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => handleOpenModal(e)}
            style={{ 
              background: 'var(--primary-color)', 
              color: 'white', 
              padding: '10px 20px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              fontWeight: '800',
              borderRadius: '16px',
              fontSize: '0.9rem',
              whiteSpace: 'nowrap',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            <Plus size={18} />
            <span className="btn-text">Nueva</span>
          </motion.button>
        </div>
      </div>

      <div className="organic-card" style={{ overflow: 'hidden', position: 'relative', zIndex: 1 }}>
        <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="Buscar..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ 
                paddingLeft: '42px', 
                paddingRight: '15px',
                paddingTop: '10px',
                paddingBottom: '10px',
                background: 'var(--bg-color)', 
                border: '1px solid var(--border-color)',
                fontSize: '0.9rem',
                borderRadius: '12px',
                width: '100%'
              }}
            />
          </div>
        </div>

        {/* Desktop: tabla */}
        <div className="maternas-table-view" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, textAlign: 'left', minWidth: '700px' }}>
            <thead>
              <tr style={{ background: 'var(--bg-color)', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>
                <th style={{ padding: '1rem 1.2rem' }}>PACIENTE</th>
                <th style={{ padding: '1rem 1.2rem' }}>DOCUMENTO</th>
                <th style={{ padding: '1rem 1.2rem' }}>F. EMBARAZO</th>
                <th style={{ padding: '1rem 1.2rem' }}>PAQUETES</th>
                <th style={{ padding: '1rem 1.2rem' }}>RIESGO</th>
                <th style={{ padding: '1rem 1.2rem' }}>CARPETA</th>
                <th style={{ padding: '1rem 1.2rem', textAlign: 'right' }}>ACCIONES</th>
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
                  <td style={{ padding: '1rem 1.2rem', borderBottom: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: 'var(--bg-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-color)', border: '1px solid var(--border-color)', flexShrink: 0 }}>
                        <Baby size={18} />
                      </div>
                      <div>
                        <p style={{ fontWeight: '800', fontSize: '0.9rem', color: 'var(--text-main)' }}>{m.nombre}</p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Por: {m.creadaPor?.nombre || 'Admin'}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '1rem 1.2rem', borderBottom: '1px solid var(--border-color)' }}>
                    <p style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-main)' }}>{m.tipoDocumento} {m.documento}</p>
                  </td>
                  <td style={{ padding: '1rem 1.2rem', borderBottom: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-main)' }}>
                      <Calendar size={14} style={{ color: 'var(--text-muted)' }} />
                      {new Date(m.fechaEmbarazo).toLocaleDateString()}
                    </div>
                  </td>
                  <td style={{ padding: '1rem 1.2rem', borderBottom: '1px solid var(--border-color)' }}>
                    {m.paquetesSeleccionados?.length > 0 ? (
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {m.paquetesSeleccionados.map(pid => {
                          const isBasico = pid === 'basico';
                          const pack = paquetes.find(p => p.id === pid);
                          const name = isBasico ? 'Básico' : (pack?.nombre || 'Paquete');
                          return (
                            <span key={pid} style={{ fontSize: '0.65rem', background: 'var(--primary-color)15', color: 'var(--primary-color)', padding: '2px 8px', borderRadius: '12px', fontWeight: '800', border: '1px solid var(--primary-color)30' }}>
                              {name}
                            </span>
                          );
                        })}
                      </div>
                    ) : (
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Ninguno</span>
                    )}
                  </td>
                  <td style={{ padding: '1rem 1.2rem', borderBottom: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: '900', background: `${getRiskColor(m.tipoRiesgo)}15`, color: getRiskColor(m.tipoRiesgo), border: `1px solid ${getRiskColor(m.tipoRiesgo)}30` }}>
                      <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: getRiskColor(m.tipoRiesgo) }} />
                      {m.tipoRiesgo}
                    </div>
                  </td>
                  <td style={{ padding: '1rem 1.2rem', borderBottom: '1px solid var(--border-color)' }}>
                    <div style={{ 
                      display: 'inline-flex', alignItems: 'center', gap: '6px', 
                      padding: '4px 10px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: '800',
                      background: m.carpetaEntregada ? 'var(--success-color)15' : 'var(--bg-color)',
                      color: m.carpetaEntregada ? 'var(--success-color)' : 'var(--text-muted)',
                      border: `1px solid ${m.carpetaEntregada ? 'var(--success-color)30' : 'var(--border-color)'}`
                    }}>
                      <Folder size={14} />
                      {m.carpetaEntregada ? 'Entregada' : 'Falta'}
                    </div>
                  </td>
                  <td style={{ padding: '1rem 1.2rem', textAlign: 'right', borderBottom: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                      <motion.button whileHover={{ scale: 1.1 }} onClick={(e) => handleOpenModal(e, m)} style={{ background: 'transparent', padding: '6px', color: 'var(--text-muted)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                        <Edit2 size={14} />
                      </motion.button>
                      <motion.button whileHover={{ scale: 1.1 }} onClick={(e) => handleDelete(e, m.id)} style={{ background: 'transparent', padding: '6px', color: 'var(--error-color)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                        <Trash2 size={14} />
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
                padding: '0.8rem 1rem',
                borderBottom: '1px solid var(--border-color)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--bg-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-color)', border: '1px solid var(--border-color)', flexShrink: 0 }}>
                    <Baby size={18} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontWeight: '800', fontSize: '0.85rem', color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.nombre}</p>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{m.documento}</p>
                    {m.paquetesSeleccionados?.length > 0 && (
                      <div style={{ display: 'flex', gap: '4px', marginTop: '4px', flexWrap: 'wrap' }}>
                        {m.paquetesSeleccionados.map(pid => {
                          const isBasico = pid === 'basico';
                          const pack = paquetes.find(p => p.id === pid);
                          const name = isBasico ? 'Básico' : (pack?.nombre || 'P');
                          return (
                            <span key={pid} style={{ fontSize: '0.6rem', background: 'var(--primary-color)15', color: 'var(--primary-color)', padding: '2px 6px', borderRadius: '8px', fontWeight: '700' }}>
                              {name}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 8px', borderRadius: '15px', fontSize: '0.65rem', fontWeight: '900', background: `${getRiskColor(m.tipoRiesgo)}15`, color: getRiskColor(m.tipoRiesgo), border: `1px solid ${getRiskColor(m.tipoRiesgo)}30`, flexShrink: 0 }}>
                    <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: getRiskColor(m.tipoRiesgo) }} />
                    {m.tipoRiesgo}
                  </div>
                  <div style={{ 
                    display: 'inline-flex', alignItems: 'center', gap: '4px', 
                    padding: '3px 8px', borderRadius: '15px', fontSize: '0.65rem', fontWeight: '900',
                    background: m.carpetaEntregada ? 'var(--success-color)15' : 'var(--bg-color)',
                    color: m.carpetaEntregada ? 'var(--success-color)' : 'var(--text-muted)',
                    border: `1px solid ${m.carpetaEntregada ? 'var(--success-color)30' : 'var(--border-color)'}`,
                    flexShrink: 0 
                  }}>
                    <Folder size={11} />
                    {m.carpetaEntregada ? 'Carpeta' : 'Falta'}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>
                  <Calendar size={12} />
                  FUM: {new Date(m.fechaEmbarazo).toLocaleDateString()}
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button onClick={(e) => handleOpenModal(e, m)} style={{ background: 'var(--bg-color)', padding: '6px', color: 'var(--text-muted)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <Edit2 size={13} />
                  </button>
                  <button onClick={(e) => handleDelete(e, m.id)} style={{ background: 'var(--bg-color)', padding: '6px', color: 'var(--error-color)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <Trash2 size={13} />
                  </button>
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

    </div>

      {/* Modal Registro/Edición */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="modal-overlay" style={{ 
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', 
            background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999,
            padding: '12px'
          }}>
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="organic-card modal-sheet"
              style={{ 
                width: '100%', maxWidth: '700px',
                padding: 'clamp(1rem, 3vw, 2.5rem)',
                boxShadow: 'var(--shadow-xl)', 
                maxHeight: '90vh', 
                overflowY: 'auto',
                borderRadius: '28px',
                position: 'relative',
                background: 'var(--card-bg)'
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

                <div className="form-grid-2">
                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: '800', marginBottom: '10px', display: 'block', color: 'var(--text-main)', letterSpacing: '0.5px' }}>TELÉFONO</label>
                    <input type="text" value={formData.telefono} onChange={e => setFormData({...formData, telefono: e.target.value})} placeholder="Ej. 321 456 7890" style={{ background: 'var(--bg-color)', border: '1px solid var(--border-color)', borderRadius: '14px', padding: '14px 18px', width: '100%' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: '800', marginBottom: '10px', display: 'block', color: 'var(--text-main)', letterSpacing: '0.5px' }}>CONTACTO EMERGENCIA / PAREJA</label>
                    <input type="text" value={formData.contactoEmergencia} onChange={e => setFormData({...formData, contactoEmergencia: e.target.value})} placeholder="Ej. Juan Perez (Pareja)" style={{ background: 'var(--bg-color)', border: '1px solid var(--border-color)', borderRadius: '14px', padding: '14px 18px', width: '100%' }} />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: '800', marginBottom: '10px', display: 'block', color: 'var(--text-main)', letterSpacing: '0.5px' }}>DIRECCIÓN DE RESIDENCIA</label>
                  <input type="text" value={formData.direccion} onChange={e => setFormData({...formData, direccion: e.target.value})} placeholder="Ej. Calle 10 #5-20, Cúcuta" style={{ background: 'var(--bg-color)', border: '1px solid var(--border-color)', borderRadius: '14px', padding: '14px 18px', width: '100%' }} />
                </div>


                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: '800', marginBottom: '10px', display: 'block', color: 'var(--text-main)', letterSpacing: '0.5px' }}>APLICAR PAQUETES DE ESTUDIOS (OPCIONAL)</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    <motion.button 
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        const current = formData.paquetesSeleccionados;
                        const next = current.includes('basico') ? current.filter(x => x !== 'basico') : [...current, 'basico'];
                        setFormData({...formData, paquetesSeleccionados: next});
                      }}
                      style={{ 
                        padding: '10px 16px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '700',
                        border: '1px solid',
                        borderColor: formData.paquetesSeleccionados.includes('basico') ? 'var(--primary-color)' : 'var(--border-color)',
                        background: formData.paquetesSeleccionados.includes('basico') ? 'var(--primary-color)20' : 'var(--bg-color)',
                        color: formData.paquetesSeleccionados.includes('basico') ? 'var(--primary-color)' : 'var(--text-muted)',
                        cursor: 'pointer'
                      }}
                    >
                      Plan Básico
                    </motion.button>
                    {paquetes.map(p => (
                      <motion.button 
                        key={p.id}
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          const current = formData.paquetesSeleccionados;
                          const next = current.includes(p.id) ? current.filter(x => x !== p.id) : [...current, p.id];
                          setFormData({...formData, paquetesSeleccionados: next});
                        }}
                        style={{ 
                          padding: '10px 16px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '700',
                          border: '1px solid',
                          borderColor: formData.paquetesSeleccionados.includes(p.id) ? 'var(--primary-color)' : 'var(--border-color)',
                          background: formData.paquetesSeleccionados.includes(p.id) ? 'var(--primary-color)20' : 'var(--bg-color)',
                          color: formData.paquetesSeleccionados.includes(p.id) ? 'var(--primary-color)' : 'var(--text-muted)',
                          cursor: 'pointer'
                        }}
                      >
                        {p.nombre}
                      </motion.button>
                    ))}
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

                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: '800', marginBottom: '10px', display: 'block', color: 'var(--text-main)', letterSpacing: '0.5px' }}>ALERTAS CLÍNICAS (ALERGIAS, RIESGOS ESPECÍFICOS)</label>
                  <textarea 
                    value={formData.alertas} 
                    onChange={e => setFormData({...formData, alertas: e.target.value})} 
                    placeholder="Ej. Alergia a la penicilina, antecedente de preeclampsia..." 
                    style={{ background: 'var(--bg-color)', border: '1px solid var(--border-color)', borderRadius: '14px', padding: '14px 18px', width: '100%', minHeight: '80px', resize: 'none' }} 
                  />
                </div>
                
                {/* --- FOMAG Demographics Section --- */}
                <div style={{ background: 'var(--primary-color)05', borderRadius: '20px', padding: '1rem', border: '1px solid var(--primary-color)20' }}>
                  <h4 style={{ margin: '0 0 1rem', fontSize: '0.9rem', color: 'var(--primary-color)', fontWeight: '950', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Folder size={16} /> Demografía FOMAG
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    
                    <div>
                      <label style={{ fontSize: '0.7rem', fontWeight: '900', color: 'var(--text-muted)' }}>REGIONAL (1-10)</label>
                      <input type="text" placeholder="Ej. 1" value={formData.fichaFomag.regional} onChange={e => setFormData({...formData, fichaFomag: {...formData.fichaFomag, regional: e.target.value}})} style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid var(--border-color)' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.7rem', fontWeight: '900', color: 'var(--text-muted)' }}>GRUPO ÉTNICO</label>
                      <select value={formData.fichaFomag.grupoEtnico} onChange={e => setFormData({...formData, fichaFomag: {...formData.fichaFomag, grupoEtnico: e.target.value}})} style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'white' }}>
                        <option value="">Seleccione...</option>
                        <option value="MESTIZO">Mestizo</option>
                        <option value="AFRO">Afrocolombiano</option>
                        <option value="INDIGENA">Indígena</option>
                        <option value="RAIZAL">Raizal</option>
                        <option value="ROM">Rom</option>
                        <option value="NORESP">No Responde</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: '0.7rem', fontWeight: '900', color: 'var(--text-muted)' }}>NIVEL EDUCATIVO</label>
                      <select value={formData.fichaFomag.nivelEducativo} onChange={e => setFormData({...formData, fichaFomag: {...formData.fichaFomag, nivelEducativo: e.target.value}})} style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'white' }}>
                        <option value="">Seleccione...</option>
                        <option value="T">T (Técnico)</option>
                        <option value="E">E (Escolar)</option>
                        <option value="U">U (Universitario)</option>
                        <option value="O">O (Otro)</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: '0.7rem', fontWeight: '900', color: 'var(--text-muted)' }}>OCUPACIÓN</label>
                      <input type="text" placeholder="Ej. Docente" value={formData.fichaFomag.ocupacion} onChange={e => setFormData({...formData, fichaFomag: {...formData.fichaFomag, ocupacion: e.target.value}})} style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid var(--border-color)' }} />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.7rem', fontWeight: '900', color: 'var(--text-muted)' }}>RÉGIMEN</label>
                      <select value={formData.fichaFomag.regimen} onChange={e => setFormData({...formData, fichaFomag: {...formData.fichaFomag, regimen: e.target.value}})} style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'white' }}>
                        <option value="">Seleccione...</option>
                        <option value="CONTRIBUTIVO">Contributivo</option>
                        <option value="SUBSIDIADO">Subsidiado</option>
                        <option value="VINCULADO">Vinculado</option>
                        <option value="ESPECIAL">Especial (FOMAG)</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: '0.7rem', fontWeight: '900', color: 'var(--text-muted)' }}>VINCULACIÓN</label>
                      <select value={formData.fichaFomag.tipoVinculacion} onChange={e => setFormData({...formData, fichaFomag: {...formData.fichaFomag, tipoVinculacion: e.target.value}})} style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'white' }}>
                        <option value="">Seleccione...</option>
                        <option value="AFILIADO">Afiliado Cotizante</option>
                        <option value="BENEFICIARIO">Beneficiario</option>
                      </select>
                    </div>

                  </div>
                </div>
                
                <div style={{ 
                  background: 'var(--bg-color)', padding: '1.2rem', borderRadius: '20px', border: '1px solid var(--border-color)',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.5rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: formData.carpetaEntregada ? 'var(--success-color)15' : 'var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: formData.carpetaEntregada ? 'var(--success-color)' : 'var(--text-muted)' }}>
                      <Folder size={22} />
                    </div>
                    <div>
                      <p style={{ fontSize: '0.9rem', fontWeight: '950', color: 'var(--text-main)', margin: 0 }}>Entrega de Carpeta Física</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>Marcar si la paciente ya recibió su carpeta.</p>
                    </div>
                  </div>
                  <motion.button 
                    type="button"
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setFormData({...formData, carpetaEntregada: !formData.carpetaEntregada})}
                    style={{ 
                      width: '54px', height: '28px', borderRadius: '20px', 
                      background: formData.carpetaEntregada ? 'var(--success-color)' : 'var(--border-color)',
                      position: 'relative', border: 'none', cursor: 'pointer', transition: 'all 0.3s'
                    }}
                  >
                    <motion.div 
                      animate={{ x: formData.carpetaEntregada ? 28 : 3 }}
                      style={{ 
                        width: '22px', height: '22px', borderRadius: '50%', background: 'white',
                        position: 'absolute', top: '3px', left: 0, boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                      }}
                    />
                  </motion.button>
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
          .modal-overlay { align-items: flex-end !important; padding: 0 !important; }
          .modal-sheet { border-radius: 28px 28px 0 0 !important; }
        }
      `}</style>
    </>
  );
};

export default Maternas;
