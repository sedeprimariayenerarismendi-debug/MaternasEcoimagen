import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';

const Layout = () => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar: visible solo en desktop */}
      <div className="sidebar-wrapper">
        <Sidebar />
      </div>

      {/* Contenido principal */}
      <main className="main-content">
        <div style={{ maxWidth: '1600px', margin: '0 auto', width: '100%' }}>
          <Outlet />
        </div>
      </main>

      {/* Bottom Nav: visible solo en móvil */}
      <div className="bottom-nav-wrapper">
        <BottomNav />
      </div>

      <style>{`
        /* Desktop: sidebar visible, bottom nav oculto */
        .sidebar-wrapper {
          display: block;
        }
        .bottom-nav-wrapper {
          display: none;
        }
        .main-content {
          flex: 1;
          margin-left: var(--sidebar-width);
          padding: 2.5rem;
          background: var(--bg-color);
          min-height: 100vh;
        }

        /* Móvil: sidebar oculto, bottom nav visible */
        @media (max-width: 768px) {
          .sidebar-wrapper {
            display: none;
          }
          .bottom-nav-wrapper {
            display: block;
          }
          .main-content {
            margin-left: 0;
            padding: 0.75rem 0.75rem;
            padding-bottom: 80px; /* Espacio para el bottom nav */
          }
        }
      `}</style>
    </div>
  );
};

export default Layout;
