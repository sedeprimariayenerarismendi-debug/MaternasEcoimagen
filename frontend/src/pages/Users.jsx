import React, { useState, useEffect } from 'react';
import api from '../api';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  CheckCircle, 
  XCircle,
  X,
  User
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    rol: 'ENFERMERA',
    activo: true
  });

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleOpenModal = (user = null) => {
    if (user) {
      setCurrentUser(user);
      setFormData({ nombre: user.nombre, email: user.email, password: '', rol: user.rol, activo: user.activo });
    } else {
      setCurrentUser(null);
      setFormData({ nombre: '', email: '', password: '', rol: 'ENFERMERA', activo: true });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentUser) {
        await api.put(`/users/${currentUser.id}`, formData);
      } else {
        await api.post('/users', formData);
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.error || 'Error al guardar usuario');
    }
  };

  const handleToggleStatus = async (user) => {
    try {
      await api.put(`/users/${user.id}`, { activo: !user.activo });
      fetchUsers();
    } catch (err) {
      alert('Error al cambiar estado');
    }
  };

  const filteredUsers = users.filter(u => 
    u.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRolColor = (rol) => {
    switch(rol) {
      case 'ADMIN': return { bg: '#dbeafe', color: '#1e40af' };
      case 'MEDICO': return { bg: '#dcfce7', color: '#15803d' };
      default: return { bg: '#f3f4f6', color: '#4b5563' };
    }
  };

  return (
    <div className="fade-in">
      <div className="users-header">
        <div>
          <h2 style={{ fontSize: 'clamp(1.5rem, 5vw, 2rem)', fontWeight: '900', letterSpacing: '-1px' }}>Gestión de Usuarios</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>Administra el personal médico y administrativo.</p>
        </div>
        <motion.button 
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={() => handleOpenModal()}
          style={{ background: 'var(--primary-color)', color: 'white', padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '700', borderRadius: '16px', whiteSpace: 'nowrap' }}
        >
          <Plus size={20} />
          <span className="users-btn-text">Nuevo Usuario</span>
        </motion.button>
      </div>

      <div className="organic-card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" placeholder="Buscar por nombre o email..." 
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '46px', background: 'var(--bg-color)', border: '1px solid var(--border-color)', borderRadius: '14px', padding: '12px 16px 12px 46px', width: '100%', fontSize: '0.95rem' }}
            />
          </div>
        </div>

        {/* Desktop: tabla */}
        <div className="users-table-view" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '550px' }}>
            <thead>
              <tr style={{ background: 'var(--bg-color)', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>
                <th style={{ padding: '1.2rem 1.5rem' }}>USUARIO</th>
                <th style={{ padding: '1.2rem 1.5rem' }}>ROL</th>
                <th style={{ padding: '1.2rem 1.5rem' }}>ESTADO</th>
                <th style={{ padding: '1.2rem 1.5rem', textAlign: 'right' }}>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(u => {
                const rolStyle = getRolColor(u.rol);
                return (
                  <tr key={u.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '1.2rem 1.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '14px', background: 'var(--primary-color)20', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-color)', flexShrink: 0 }}>
                          <User size={20} />
                        </div>
                        <div>
                          <p style={{ fontWeight: '700', color: 'var(--text-main)', fontSize: '0.95rem' }}>{u.nombre}</p>
                          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '1.2rem 1.5rem' }}>
                      <span style={{ padding: '5px 14px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '800', background: rolStyle.bg, color: rolStyle.color }}>{u.rol}</span>
                    </td>
                    <td style={{ padding: '1.2rem 1.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: u.activo ? '#10b981' : '#ef4444', fontSize: '0.85rem', fontWeight: '700' }}>
                        {u.activo ? <CheckCircle size={16} /> : <XCircle size={16} />}
                        {u.activo ? 'Activo' : 'Inactivo'}
                      </div>
                    </td>
                    <td style={{ padding: '1.2rem 1.5rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                        <motion.button whileHover={{ scale: 1.1 }} onClick={() => handleOpenModal(u)} style={{ background: 'var(--bg-color)', padding: '8px', color: 'var(--text-muted)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                          <Edit2 size={16} />
                        </motion.button>
                        <motion.button whileHover={{ scale: 1.1 }} onClick={() => handleToggleStatus(u)} style={{ background: 'var(--bg-color)', padding: '8px', color: u.activo ? '#ef4444' : '#10b981', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                          {u.activo ? <Trash2 size={16} /> : <CheckCircle size={16} />}
                        </motion.button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Móvil: cards */}
        <div className="users-cards-view">
          {filteredUsers.map(u => {
            const rolStyle = getRolColor(u.rol);
            return (
              <div key={u.id} style={{ padding: '1rem 1.2rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: 'var(--primary-color)20', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-color)', flexShrink: 0 }}>
                  <User size={22} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <p style={{ fontWeight: '800', color: 'var(--text-main)', fontSize: '0.95rem' }}>{u.nombre}</p>
                    <span style={{ padding: '3px 10px', borderRadius: '15px', fontSize: '0.7rem', fontWeight: '800', background: rolStyle.bg, color: rolStyle.color }}>{u.rol}</span>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: u.activo ? '#10b981' : '#ef4444', fontSize: '0.75rem', fontWeight: '700', marginTop: '4px' }}>
                    {u.activo ? <CheckCircle size={12} /> : <XCircle size={12} />}
                    {u.activo ? 'Activo' : 'Inactivo'}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                  <motion.button whileTap={{ scale: 0.9 }} onClick={() => handleOpenModal(u)} style={{ background: 'var(--bg-color)', padding: '9px', color: 'var(--text-muted)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                    <Edit2 size={15} />
                  </motion.button>
                  <motion.button whileTap={{ scale: 0.9 }} onClick={() => handleToggleStatus(u)} style={{ background: 'var(--bg-color)', padding: '9px', color: u.activo ? '#ef4444' : '#10b981', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                    {u.activo ? <Trash2 size={15} /> : <CheckCircle size={15} />}
                  </motion.button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 1000 }}>
            <motion.div 
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              style={{ background: 'var(--card-bg)', width: '100%', maxWidth: '500px', borderRadius: '28px 28px 0 0', padding: 'clamp(1.5rem, 5vw, 2.5rem)', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 -10px 40px rgba(0,0,0,0.2)' }}
            >
              <div style={{ width: '40px', height: '4px', background: 'var(--border-color)', borderRadius: '2px', margin: '0 auto 2rem' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: '900', letterSpacing: '-0.5px', color: 'var(--text-main)' }}>
                  {currentUser ? 'Editar Usuario' : 'Nuevo Usuario'}
                </h3>
                <motion.button whileTap={{ scale: 0.9 }} onClick={() => setIsModalOpen(false)} style={{ background: 'var(--bg-color)', color: 'var(--text-muted)', padding: '10px', borderRadius: '50%', border: '1px solid var(--border-color)' }}>
                  <X size={20} />
                </motion.button>
              </div>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                {[
                  { label: 'Nombre Completo', type: 'text', key: 'nombre', placeholder: 'Ej. María García' },
                  { label: 'Email', type: 'email', key: 'email', placeholder: 'usuario@maternas.com' },
                ].map(field => (
                  <div key={field.key}>
                    <label style={{ fontSize: '0.82rem', fontWeight: '800', marginBottom: '8px', display: 'block', color: 'var(--text-main)', letterSpacing: '0.5px', textTransform: 'uppercase' }}>{field.label}</label>
                    <input type={field.type} value={formData[field.key]} onChange={e => setFormData({...formData, [field.key]: e.target.value})} required placeholder={field.placeholder}
                      style={{ background: 'var(--bg-color)', border: '1px solid var(--border-color)', borderRadius: '14px', padding: '13px 16px', width: '100%', fontSize: '0.95rem' }}
                    />
                  </div>
                ))}
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: '800', marginBottom: '8px', display: 'block', color: 'var(--text-main)', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                    Contraseña {currentUser && <span style={{ fontWeight: '500', textTransform: 'none', fontSize: '0.75rem', color: 'var(--text-muted)' }}>(dejar en blanco para no cambiar)</span>}
                  </label>
                  <input type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required={!currentUser} placeholder="••••••••"
                    style={{ background: 'var(--bg-color)', border: '1px solid var(--border-color)', borderRadius: '14px', padding: '13px 16px', width: '100%', fontSize: '0.95rem' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: '800', marginBottom: '8px', display: 'block', color: 'var(--text-main)', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Rol</label>
                  <select value={formData.rol} onChange={e => setFormData({...formData, rol: e.target.value})}
                    style={{ background: 'var(--bg-color)', border: '1px solid var(--border-color)', borderRadius: '14px', padding: '13px 16px', width: '100%', fontSize: '0.95rem' }}
                  >
                    <option value="ENFERMERA">Enfermera</option>
                    <option value="MEDICO">Médico</option>
                    <option value="ADMIN">Administrador</option>
                  </select>
                </div>
                <motion.button type="submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  style={{ background: 'var(--primary-color)', color: 'white', padding: '16px', fontWeight: '900', borderRadius: '18px', marginTop: '0.5rem', fontSize: '1rem', boxShadow: 'var(--primary-glow) 0 8px 20px' }}
                >
                  {currentUser ? 'Guardar Cambios' : 'Crear Usuario'}
                </motion.button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .users-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          gap: 16px;
        }
        .users-table-view { display: block; }
        .users-cards-view { display: none; }
        @media (max-width: 768px) {
          .users-table-view { display: none; }
          .users-cards-view { display: block; }
          .users-btn-text { display: none; }
        }
      `}</style>
    </div>
  );
};

export default Users;
