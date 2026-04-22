import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [config, setConfig] = useState({
    primaryColor: '#E91E8C',
    secondaryColor: '#3B82F6',
    accentColor: '#F472B6',
    darkMode: false,
    clinicName: 'Clínica Maternas',
  });

  const fetchTheme = async () => {
    try {
      const res = await api.get('/theme');
      if (res.data) {
        setConfig(res.data);
        applyTheme(res.data);
      }
    } catch (err) {
      console.error('Error loading theme:', err);
    }
  };

  const applyTheme = (theme) => {
    const root = document.documentElement;
    root.style.setProperty('--primary-color', theme.primaryColor);
    root.style.setProperty('--secondary-color', theme.secondaryColor);
    root.style.setProperty('--accent-color', theme.accentColor);
    document.body.setAttribute('data-theme', theme.darkMode ? 'dark' : 'light');
    document.title = theme.clinicName;
  };

  useEffect(() => {
    fetchTheme();
  }, []);

  const updateTheme = async (newConfig) => {
    try {
      const res = await api.put('/theme', newConfig);
      setConfig(res.data);
      applyTheme(res.data);
      return { success: true };
    } catch (err) {
      return { success: false, error: 'Error al actualizar tema' };
    }
  };

  return (
    <ThemeContext.Provider value={{ config, updateTheme, refreshTheme: fetchTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
