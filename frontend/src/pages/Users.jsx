import React, { useState, useEffect } from 'react';
import api from '../api';
import { 
  Plus, 
  Search, 
  MoreVertical, 
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
  
  // Form state
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

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenModal = (user = null) => {
    if (user) {
      setCurrentUser(user);
      setFormData({
        nombre: user.nombre,
        email: user.email,
        password: '',
        rol: user.rol,
        activo: user.activo
      });
    } else {
      setCurrentUser(null);
      setFormData({
        nombre: '',
        email: '',
        password: '',
        rol: 'ENFERMERA',
        activo: true
      });
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

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div>
          <h2 style={{ fontSize: '2rem', fontWeight: '800' }}>Gestión de Usuarios</h2>
          <p style={{ color: 'var(--text-muted)' }}>Administra el personal médico y administrativo.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
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
          Nuevo Usuario
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
              placeholder="Buscar por nombre o email..." 
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
                <th style={{ padding: '1.2rem 1.5rem' }}>USUARIO</th>
                <th style={{ padding: '1.2rem 1.5rem' }}>ROL</th>
                <th style={{ padding: '1.2rem 1.5rem' }}>ESTADO</th>
                <th style={{ padding: '1.2rem 1.5rem', textAlign: 'right' }}>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(u => (
                <tr key={u.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '1.2rem 1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ 
                        width: '40px', height: '40px', borderRadius: '12px', background: 'var(--bg-color)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-color)'
                      }}>
                        <User size={20} />
                      </div>
                      <div>
                        <p style={{ fontWeight: '600' }}>{u.nombre}</p>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '1.2rem 1.5rem' }}>
                    <span style={{ 
                      padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700',
                      background: u.rol === 'ADMIN' ? '#dbeafe' : '#f3f4f6',
                      color: u.rol === 'ADMIN' ? '#1e40af' : '#4b5563'
                    }}>
                      {u.rol}
                    </span>
                  </td>
                  <td style={{ padding: '1.2rem 1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: u.activo ? '#10b981' : '#ef4444', fontSize: '0.85rem', fontWeight: '600' }}>
                      {u.activo ? <CheckCircle size={16} /> : <XCircle size={16} />}
                      {u.activo ? 'Activo' : 'Inactivo'}
                    </div>
                  </td>
                  <td style={{ padding: '1.2rem 1.5rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                      <button onClick={() => handleOpenModal(u)} style={{ background: 'var(--bg-color)', padding: '8px', color: 'var(--text-muted)' }}>
                        <Edit2 size={18} />
                      </button>
                      <button onClick={() => handleToggleStatus(u)} style={{ background: 'var(--bg-color)', padding: '8px', color: u.activo ? '#ef4444' : '#10b981' }}>
                        {u.activo ? <Trash2 size={18} /> : <CheckCircle size={18} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
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
                background: 'var(--card-bg)', width: '100%', maxWidth: '500px', borderRadius: '24px', padding: '2.5rem',
                boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: '800' }}>
                  {currentUser ? 'Editar Usuario' : 'Nuevo Usuario'}
                </h3>
                <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', color: 'var(--text-muted)' }}>
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px', display: 'block' }}>Nombre Completo</label>
                  <input 
                    type="text" 
                    value={formData.nombre}
                    onChange={e => setFormData({...formData, nombre: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px', display: 'block' }}>Email</label>
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px', display: 'block' }}>
                    Contraseña {currentUser && '(Dejar en blanco para no cambiar)'}
                  </label>
                  <input 
                    type="password" 
                    value={formData.password}
                    onChange={e => setFormData({...formData, password: e.target.value})}
                    required={!currentUser}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px', display: 'block' }}>Rol</label>
                  <select 
                    value={formData.rol}
                    onChange={e => setFormData({...formData, rol: e.target.value})}
                  >
                    <option value="ENFERMERA">Enfermera</option>
                    <option value="MEDICO">Médico</option>
                    <option value="ADMIN">Administrador</option>
                  </select>
                </div>
                
                <button 
                  type="submit" 
                  style={{ background: 'var(--primary-color)', color: 'white', padding: '14px', fontWeight: '700', marginTop: '1rem' }}
                >
                  {currentUser ? 'Guardar Cambios' : 'Crear Usuario'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Users;
