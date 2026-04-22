import React from 'react';
import { motion } from 'framer-motion';

const LoadingSpinner = ({ fullPage = true }) => {
  const containerStyle = fullPage ? {
    height: '100vh',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--bg-color)',
    position: 'fixed',
    top: 0,
    left: 0,
    zIndex: 9999
  } : {
    padding: '3rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  };

  return (
    <div style={containerStyle}>
      <motion.div
        animate={{
          rotate: 360,
          borderRadius: ["20%", "20%", "50%", "50%", "20%"],
        }}
        transition={{
          repeat: Infinity,
          duration: 2,
          ease: "linear"
        }}
        style={{
          width: '60px',
          height: '60px',
          border: '4px solid var(--primary-color)',
          borderTopColor: 'transparent',
          borderRadius: '50%'
        }}
      />
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
        style={{
          marginTop: '1.5rem',
          color: 'var(--text-muted)',
          fontWeight: '600',
          letterSpacing: '1px',
          fontSize: '0.9rem'
        }}
      >
        CARGANDO...
      </motion.p>
    </div>
  );
};

export default LoadingSpinner;
