import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Baby,
  Users,
  Settings,
  LogOut,
  Layers,
  MoreHorizontal,
  X
} from 'lucide-react';

const MAX_VISIBLE = 3; // cuántos ítems caben fijos (sin contar "Más" y "Salir")

const BottomNav = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [moreOpen, setMoreOpen] = useState(false);

  const allItems = [
    { name: 'Inicio',    path: '/dashboard',     icon: LayoutDashboard, admin: false },
    { name: 'Maternas',  path: '/maternas',       icon: Baby,            admin: false },
    { name: 'Paquetes',  path: '/paquetes',       icon: Layers,          admin: false },
    { name: 'Usuarios',  path: '/usuarios',       icon: Users,           admin: true  },
    { name: 'Config',    path: '/configuracion',  icon: Settings,        admin: true  },
  ];

  const filtered = allItems.filter(item => !item.admin || user?.rol === 'ADMIN');
  const visibleItems = filtered.slice(0, MAX_VISIBLE);
  const overflowItems = filtered.slice(MAX_VISIBLE);
  const hasOverflow = overflowItems.length > 0;

  const handleLogout = () => {
    setMoreOpen(false);
    logout();
    navigate('/');
  };

  const NavItem = ({ item, onClick }) => (
    <NavLink
      key={item.path}
      to={item.path}
      onClick={onClick}
      style={{ textDecoration: 'none', flex: 1 }}
    >
      {({ isActive }) => (
        <motion.div
          whileTap={{ scale: 0.82 }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '3px',
            padding: '8px 2px',
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
                width: '32px',
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
            <item.icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
          </motion.div>
          <motion.span
            animate={{
              color: isActive ? 'var(--primary-color)' : 'var(--text-muted)',
              fontWeight: isActive ? '800' : '500',
            }}
            style={{ fontSize: '9px', letterSpacing: '0.2px' }}
          >
            {item.name}
          </motion.span>
        </motion.div>
      )}
    </NavLink>
  );

  return (
    <>
      {/* ── Overflow bottom sheet ── */}
      <AnimatePresence>
        {moreOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMoreOpen(false)}
              style={{
                position: 'fixed', inset: 0, zIndex: 998,
                background: 'rgba(0,0,0,0.35)',
                backdropFilter: 'blur(4px)',
              }}
            />
            {/* Sheet */}
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              style={{
                position: 'fixed',
                bottom: '64px', // encima del nav
                left: 0, right: 0,
                zIndex: 999,
                background: 'var(--card-bg)',
                borderRadius: '24px 24px 0 0',
                borderTop: '1px solid var(--border-color)',
                padding: '16px 20px 20px',
                boxShadow: '0 -8px 40px rgba(0,0,0,0.15)',
              }}
            >
              {/* Handle */}
              <div style={{ width: '36px', height: '4px', borderRadius: '4px', background: 'var(--border-color)', margin: '0 auto 16px' }} />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {overflowItems.map(item => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setMoreOpen(false)}
                    style={{ textDecoration: 'none' }}
                  >
                    {({ isActive }) => (
                      <motion.div
                        whileTap={{ scale: 0.97 }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '14px',
                          padding: '13px 16px',
                          borderRadius: '16px',
                          background: isActive ? 'var(--primary-color)12' : 'transparent',
                          border: isActive ? '1px solid var(--primary-color)25' : '1px solid transparent',
                        }}
                      >
                        <div style={{
                          width: '38px', height: '38px',
                          borderRadius: '12px',
                          background: isActive ? 'var(--primary-color)20' : 'var(--bg-color)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: isActive ? 'var(--primary-color)' : 'var(--text-muted)',
                          border: '1px solid var(--border-color)',
                          flexShrink: 0,
                        }}>
                          <item.icon size={18} strokeWidth={isActive ? 2.5 : 1.8} />
                        </div>
                        <span style={{
                          fontSize: '0.95rem',
                          fontWeight: isActive ? '900' : '700',
                          color: isActive ? 'var(--primary-color)' : 'var(--text-main)',
                        }}>
                          {item.name}
                        </span>
                      </motion.div>
                    )}
                  </NavLink>
                ))}

                {/* Logout inside sheet */}
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleLogout}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '14px',
                    padding: '13px 16px',
                    borderRadius: '16px',
                    background: 'transparent',
                    border: '1px solid transparent',
                    cursor: 'pointer',
                    marginTop: '4px',
                  }}
                >
                  <div style={{
                    width: '38px', height: '38px', borderRadius: '12px',
                    background: 'var(--error-color)15',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--error-color)',
                    border: '1px solid var(--error-color)25',
                    flexShrink: 0,
                  }}>
                    <LogOut size={18} />
                  </div>
                  <span style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--error-color)' }}>
                    Cerrar sesión
                  </span>
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Bottom nav bar ── */}
      <nav style={{
        position: 'fixed',
        bottom: 0, left: 0, right: 0,
        zIndex: 1000,
        background: 'var(--card-bg)',
        borderTop: '1px solid var(--border-color)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        boxShadow: '0 -4px 30px rgba(0,0,0,0.08)',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
          padding: '6px 4px',
          maxWidth: '480px',
          margin: '0 auto',
        }}>
          {/* Fixed visible items */}
          {visibleItems.map(item => <NavItem key={item.path} item={item} />)}

          {/* "Más" button (only if there are overflow items) */}
          {hasOverflow && (
            <motion.button
              whileTap={{ scale: 0.82 }}
              onClick={() => setMoreOpen(v => !v)}
              style={{
                flex: 1,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                gap: '3px', padding: '8px 2px',
                background: 'transparent', border: 'none', cursor: 'pointer',
                color: moreOpen ? 'var(--primary-color)' : 'var(--text-muted)',
              }}
            >
              <motion.div animate={{ rotate: moreOpen ? 90 : 0 }} transition={{ duration: 0.2 }}>
                {moreOpen ? <X size={22} strokeWidth={2} /> : <MoreHorizontal size={22} strokeWidth={1.8} />}
              </motion.div>
              <span style={{ fontSize: '9px', fontWeight: moreOpen ? '800' : '500', letterSpacing: '0.2px' }}>
                {moreOpen ? 'Cerrar' : 'Más'}
              </span>
            </motion.button>
          )}

          {/* Logout (only if no overflow, i.e. all items fit) */}
          {!hasOverflow && (
            <motion.button
              whileTap={{ scale: 0.82 }}
              onClick={handleLogout}
              style={{
                flex: 1,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                gap: '3px', padding: '8px 2px',
                background: 'transparent', border: 'none', cursor: 'pointer',
                color: '#ef4444',
              }}
            >
              <LogOut size={22} strokeWidth={1.8} />
              <span style={{ fontSize: '9px', fontWeight: '500', letterSpacing: '0.2px' }}>Salir</span>
            </motion.button>
          )}
        </div>
      </nav>
    </>
  );
};

export default BottomNav;
