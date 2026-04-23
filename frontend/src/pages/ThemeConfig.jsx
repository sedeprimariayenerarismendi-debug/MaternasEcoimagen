import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';
import { Palette, Building2, Save, RefreshCcw, Moon, Sun, Loader2 } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';

const ThemeConfig = () => {
  const { config, updateTheme } = useTheme();
  const [formData, setFormData] = useState({ ...config });
  const [loading, setLoading] = useState(false);
  const { notify } = useNotification();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const result = await updateTheme(formData);
    if (result.success) {
      notify('Configuración guardada exitosamente ✨');
    } else {
      notify('Error al guardar configuración ❌', 'error');
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: '800px' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: '800' }}>Personalización</h2>
        <p style={{ color: 'var(--text-muted)' }}>Configura la identidad visual de tu plataforma.</p>
      </div>

      <div className="theme-grid">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          style={{
            background: 'var(--card-bg)',
            padding: '2rem',
            borderRadius: '24px',
            boxShadow: 'var(--shadow)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '2rem' }}>
            <Palette size={24} style={{ color: 'var(--primary-color)' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: '700' }}>Colores y Estilo</h3>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: '600', marginBottom: '8px', display: 'block' }}>Nombre de la Clínica</label>
              <div style={{ position: 'relative' }}>
                <Building2 size={18} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="text" 
                  name="clinicName"
                  value={formData.clinicName}
                  onChange={handleChange}
                  style={{ paddingLeft: '45px' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: '600', marginBottom: '8px', display: 'block' }}>Color Principal</label>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <input 
                    type="color" 
                    name="primaryColor"
                    value={formData.primaryColor || '#E91E8C'}
                    onChange={handleChange}
                    style={{ width: '50px', height: '50px', padding: '2px', cursor: 'pointer' }}
                  />
                  <input 
                    type="text" 
                    name="primaryColor"
                    value={formData.primaryColor}
                    onChange={handleChange}
                    style={{ fontSize: '0.8rem' }}
                  />
                </div>
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: '600', marginBottom: '8px', display: 'block' }}>Color Secundario</label>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <input 
                    type="color" 
                    name="secondaryColor"
                    value={formData.secondaryColor || '#3B82F6'}
                    onChange={handleChange}
                    style={{ width: '50px', height: '50px', padding: '2px', cursor: 'pointer' }}
                  />
                  <input 
                    type="text" 
                    name="secondaryColor"
                    value={formData.secondaryColor}
                    onChange={handleChange}
                    style={{ fontSize: '0.8rem' }}
                  />
                </div>
              </div>
            </div>

            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              padding: '15px',
              background: 'var(--bg-color)',
              borderRadius: '16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {formData.darkMode ? <Moon size={20} /> : <Sun size={20} />}
                <div>
                  <p style={{ fontSize: '0.9rem', fontWeight: '600' }}>Modo Oscuro</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Activa la interfaz oscura</p>
                </div>
              </div>
              <input 
                type="checkbox" 
                name="darkMode"
                checked={formData.darkMode}
                onChange={handleChange}
                style={{ width: '40px', height: '20px', cursor: 'pointer' }}
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              style={{ 
                background: 'var(--primary-color)', 
                color: 'white', 
                padding: '14px', 
                fontWeight: '700', 
                marginTop: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px'
              }}
            >
              {loading ? <Loader2 className="animate-spin" /> : <Save size={20} />}
              Guardar Cambios
            </button>

          </form>
        </motion.div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            style={{
              background: 'var(--card-bg)',
              padding: '2rem',
              borderRadius: '24px',
              boxShadow: 'var(--shadow)',
              flex: 1
            }}
          >
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '1.5rem' }}>Vista Previa</h3>
            <div style={{ 
              background: 'var(--bg-color)', 
              borderRadius: '16px', 
              padding: '20px',
              border: '2px solid var(--border-color)',
              display: 'flex',
              flexDirection: 'column',
              gap: '15px'
            }}>
              <div style={{ width: '100%', height: '40px', background: formData.primaryColor, borderRadius: '8px', opacity: 0.8 }} />
              <div style={{ width: '60%', height: '20px', background: 'var(--text-muted)', borderRadius: '4px', opacity: 0.3 }} />
              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ width: '30px', height: '30px', background: formData.secondaryColor, borderRadius: '50%' }} />
                <div style={{ width: '30px', height: '30px', background: formData.accentColor || '#f472b6', borderRadius: '50%' }} />
              </div>
              <p style={{ fontSize: '0.8rem', fontStyle: 'italic', color: 'var(--text-muted)' }}>
                * Los cambios se aplicarán a toda la interfaz al guardar.
              </p>
            </div>
          </motion.div>

          <div style={{ 
            background: 'var(--primary-color)', 
            padding: '2rem', 
            borderRadius: '24px', 
            color: 'white',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
            boxShadow: `0 10px 30px ${formData.primaryColor}40`
          }}>
            <RefreshCcw size={40} style={{ marginBottom: '1rem' }} />
            <h4 style={{ fontWeight: '800', marginBottom: '0.5rem', color: 'white' }}>Actualización en Tiempo Real</h4>
            <p style={{ fontSize: '0.85rem', opacity: 0.9 }}>
              Nuestro sistema utiliza CSS Variables para que los cambios de imagen corporativa sean instantáneos.
            </p>
          </div>
        </div>
      </div>
      <style>{`
        .theme-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 25px;
        }
        @media (max-width: 768px) {
          .theme-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default ThemeConfig;
