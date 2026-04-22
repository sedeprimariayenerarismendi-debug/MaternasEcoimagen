import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Baby, Lock, Mail, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const { config } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: `linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%)`,
      padding: '20px'
    }}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          width: '100%',
          maxWidth: '450px',
          background: 'var(--card-bg)',
          borderRadius: '24px',
          padding: '3rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          textAlign: 'center'
        }}
      >
        <div style={{ 
          background: 'var(--primary-color)', 
          width: '70px', 
          height: '70px', 
          borderRadius: '20px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          color: 'white',
          margin: '0 auto 1.5rem',
          boxShadow: '0 10px 20px rgba(233, 30, 140, 0.3)'
        }}>
          <Baby size={40} />
        </div>

        <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '0.5rem', color: 'var(--text-main)' }}>
          Bienvenido
        </h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem' }}>
          Sistema de Seguimiento de Maternas - {config.clinicName}
        </p>

        {error && (
          <div style={{ 
            background: '#fee2e2', 
            color: '#ef4444', 
            padding: '12px', 
            borderRadius: '12px', 
            marginBottom: '1.5rem',
            fontSize: '0.9rem',
            fontWeight: '500'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <div style={{ position: 'relative', textAlign: 'left' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px', display: 'block', paddingLeft: '4px' }}>
              Email
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="email" 
                placeholder="usuario@maternas.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ paddingLeft: '45px' }}
              />
            </div>
          </div>

          <div style={{ position: 'relative', textAlign: 'left' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px', display: 'block', paddingLeft: '4px' }}>
              Contraseña
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="password" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ paddingLeft: '45px' }}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{ 
              background: 'var(--primary-color)', 
              color: 'white', 
              padding: '14px', 
              fontSize: '1.1rem', 
              fontWeight: '700',
              marginTop: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px'
            }}
          >
            {loading ? <Loader2 className="animate-spin" /> : 'Entrar al Sistema'}
          </button>
        </form>

        <p style={{ marginTop: '2rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          © 2024 {config.clinicName}. Todos los derechos reservados.
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
