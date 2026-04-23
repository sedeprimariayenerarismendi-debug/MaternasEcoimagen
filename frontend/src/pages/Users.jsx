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
import { useNotification } from '../context/NotificationContext';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const { notify } = useNotification();
  
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
      notify(currentUser ? 'Usuario actualizado' : 'Usuario creado con éxito');
    } catch (err) {
      notify(err.response?.data?.error || 'Error al guardar usuario', 'error');
    }
  };

  const handleToggleStatus = async (user) => {
    try {
      await api.put(`/users/${user.id}`, { activo: !user.activo });
      fetchUsers();
      notify('Estado del usuario actualizado');
    } catch (err) {
      notify('Error al cambiar estado', 'error');
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
      <div className="users-header" style={{ marginBottom: '1rem' }}>
        <div>
          <h2 style={{ fontSize: 'clamp(1.2rem, 4vw, 2rem)', fontWeight: '900', letterSpacing: '-0.8px' }}>Usuarios</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Gestión de personal médico y administrativo.</p>
        </div>
        <motion.button 
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={() => handleOpenModal()}
          style={{ background: 'var(--primary-color)', color: 'white', padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', borderRadius: '16px', fontSize: '0.9rem', whiteSpace: 'nowrap' }}
        >
          <Plus size={18} />
          <span className="users-btn-text">Nuevo</span>
        </motion.button>
      </div>

      <div className="organic-card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" placeholder="Buscar..." 
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '40px', background: 'var(--bg-color)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '10px 15px 10px 40px', width: '100%', fontSize: '0.9rem' }}
            />
          </div>
        </div>

        {/* Desktop: tabla */}
        <div className="users-table-view" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '550px' }}>
            <thead>
              <tr style={{ background: 'var(--bg-color)', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>
                <th style={{ padding: '1rem 1.2rem' }}>USUARIO</th>
                <th style={{ padding: '1rem 1.2rem' }}>ROL</th>
                <th style={{ padding: '1rem 1.2rem' }}>ESTADO</th>
                <th style={{ padding: '1rem 1.2rem', textAlign: 'right' }}>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(u => {
                const rolStyle = getRolColor(u.rol);
                return (
                  <tr key={u.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '1rem 1.2rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '12px', background: 'var(--primary-color)20', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-color)', flexShrink: 0 }}>
                          <User size={18} />
                        </div>
                        <div>
                          <p style={{ fontWeight: '700', color: 'var(--text-main)', fontSize: '0.9rem' }}>{u.nombre}</p>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '1rem 1.2rem' }}>
                      <span style={{ padding: '4px 12px', borderRadius: '15px', fontSize: '0.7rem', fontWeight: '800', background: rolStyle.bg, color: rolStyle.color }}>{u.rol}</span>
                    </td>
                    <td style={{ padding: '0.8rem 1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: u.activo ? '#10b981' : '#ef4444', fontSize: '0.8rem', fontWeight: '700' }}>
                        {u.activo ? <CheckCircle size={14} /> : <XCircle size={14} />}
                        {u.activo ? 'Activo' : 'Inactivo'}
                      </div>
                    </td>
                    <td style={{ padding: '0.8rem 1rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                        <motion.button whileHover={{ scale: 1.1 }} onClick={() => handleOpenModal(u)} style={{ background: 'var(--bg-color)', padding: '6px', color: 'var(--text-muted)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                          <Edit2 size={14} />
                        </motion.button>
                        <motion.button whileHover={{ scale: 1.1 }} onClick={() => handleToggleStatus(u)} style={{ background: 'var(--bg-color)', padding: '6px', color: u.activo ? '#ef4444' : '#10b981', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                          {u.activo ? <Trash2 size={14} /> : <CheckCircle size={14} />}
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
              <div key={u.id} style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '12px', background: 'var(--primary-color)20', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-color)', flexShrink: 0 }}>
                  <User size={18} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    <p style={{ fontWeight: '800', color: 'var(--text-main)', fontSize: '0.9rem' }}>{u.nombre}</p>
                    <span style={{ padding: '2px 8px', borderRadius: '12px', fontSize: '0.65rem', fontWeight: '800', background: rolStyle.bg, color: rolStyle.color }}>{u.rol}</span>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: u.activo ? '#10b981' : '#ef4444', fontSize: '0.7rem', fontWeight: '700', marginTop: '2px' }}>
                    {u.activo ? <CheckCircle size={10} /> : <XCircle size={10} />}
                    {u.activo ? 'Activo' : 'Inactivo'}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                  <button onClick={() => handleOpenModal(u)} style={{ background: 'var(--bg-color)', padding: '7px', color: 'var(--text-muted)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <Edit2 size={13} />
                  </button>
                  <button onClick={() => handleToggleStatus(u)} style={{ background: 'var(--bg-color)', padding: '7px', color: u.activo ? '#ef4444' : '#10b981', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    {u.activo ? <Trash2 size={13} /> : <CheckCircle size={13} />}
                  </button>
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
