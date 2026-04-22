import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Baby,
  Users,
  Settings,
  LogOut,
} from 'lucide-react';

const BottomNav = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const menuItems = [
    { name: 'Inicio', path: '/dashboard', icon: LayoutDashboard, admin: false },
    { name: 'Maternas', path: '/maternas', icon: Baby, admin: false },
    { name: 'Usuarios', path: '/usuarios', icon: Users, admin: true },
    { name: 'Config', path: '/configuracion', icon: Settings, admin: true },
  ];

  const filteredMenu = menuItems.filter(item => !item.admin || user?.rol === 'ADMIN');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
      background: 'var(--card-bg)',
      borderTop: '1px solid var(--border-color)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      padding: 'env(safe-area-inset-bottom, 0px)',
      boxShadow: '0 -4px 30px rgba(0,0,0,0.08)',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        padding: '8px 4px',
        maxWidth: '480px',
        margin: '0 auto',
      }}>
        {filteredMenu.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            style={{ textDecoration: 'none', flex: 1 }}
          >
            {({ isActive }) => (
              <motion.div
                whileTap={{ scale: 0.85 }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  padding: '8px 4px',
                  position: 'relative',
                }}
              >
                {isActive && (
                  <motion.div
                    layoutId="bottom-nav-pill"
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '36px',
                      height: '3px',
                      borderRadius: '0 0 4px 4px',
                      background: 'var(--primary-color)',
                      boxShadow: '0 2px 8px var(--primary-glow)',
                    }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <motion.div
                  animate={{
                    color: isActive ? 'var(--primary-color)' : 'var(--text-muted)',
                    scale: isActive ? 1.1 : 1,
                  }}
                  transition={{ duration: 0.2 }}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <item.icon size={24} strokeWidth={isActive ? 2.5 : 1.8} />
                </motion.div>
                <motion.span
                  animate={{
                    color: isActive ? 'var(--primary-color)' : 'var(--text-muted)',
                    fontWeight: isActive ? '800' : '500',
                  }}
                  style={{ fontSize: '10px', letterSpacing: '0.2px' }}
                >
                  {item.name}
                </motion.span>
              </motion.div>
            )}
          </NavLink>
        ))}

        {/* Botón cerrar sesión */}
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={handleLogout}
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
            padding: '8px 4px',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: '#ef4444',
          }}
        >
          <LogOut size={24} strokeWidth={1.8} />
          <span style={{ fontSize: '10px', fontWeight: '500', letterSpacing: '0.2px' }}>
            Salir
          </span>
        </motion.button>
      </div>
    </nav>
  );
};

export default BottomNav;
