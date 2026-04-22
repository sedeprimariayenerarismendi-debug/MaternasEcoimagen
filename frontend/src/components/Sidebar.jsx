import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  LogOut, 
  Baby,
  ChevronRight
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const { config } = useTheme();
  const navigate = useNavigate();

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, admin: false },
    { name: 'Maternas', path: '/maternas', icon: Baby, admin: false },
    { name: 'Usuarios', path: '/usuarios', icon: Users, admin: true },
    { name: 'Configuración', path: '/configuracion', icon: Settings, admin: true },
  ];

  const filteredMenu = menuItems.filter(item => !item.admin || user?.rol === 'ADMIN');

  return (
    <aside style={{
      width: 'var(--sidebar-width)',
      height: '100vh',
      position: 'fixed',
      left: 0,
      top: 0,
      background: 'var(--card-bg)',
      borderRight: '1px solid var(--border-color)',
      padding: '2rem 1.5rem',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 100
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '3rem' }}>
        <div style={{ 
          background: 'var(--primary-color)', 
          padding: '8px', 
          borderRadius: '12px',
          color: 'white'
        }}>
          <Baby size={28} />
        </div>
        <h1 style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{config.clinicName}</h1>
      </div>

      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {filteredMenu.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              borderRadius: 'var(--radius)',
              textDecoration: 'none',
              color: isActive ? 'white' : 'var(--text-muted)',
              background: isActive ? 'var(--primary-color)' : 'transparent',
              transition: 'all 0.3s ease',
              boxShadow: isActive ? '0 4px 12px rgba(233, 30, 140, 0.3)' : 'none'
            })}
          >
            <item.icon size={20} />
            <span style={{ fontWeight: '500' }}>{item.name}</span>
            {menuItems.find(i => i.path === item.path)?.path === window.location.pathname && (
              <ChevronRight size={16} style={{ marginLeft: 'auto' }} />
            )}
          </NavLink>
        ))}
      </nav>

      <div style={{ 
        marginTop: 'auto', 
        paddingTop: '2rem', 
        borderTop: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        gap: '15px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            borderRadius: '50%', 
            background: 'var(--secondary-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold'
          }}>
            {user?.nombre?.charAt(0)}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <p style={{ fontWeight: '600', fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.nombre}
            </p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user?.rol}</p>
          </div>
        </div>
        
        <button 
          onClick={logout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 16px',
            width: '100%',
            background: 'rgba(239, 68, 68, 0.1)',
            color: '#ef4444',
            fontWeight: '600',
            fontSize: '0.9rem'
          }}
        >
          <LogOut size={20} />
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
