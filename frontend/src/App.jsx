import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import ThemeConfig from './pages/ThemeConfig';
import Maternas from './pages/Maternas';
import MaternaDetail from './pages/MaternaDetail';

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Login />} />
            
            <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/maternas" element={<Maternas />} />
              <Route path="/maternas/:id" element={<MaternaDetail />} />
              <Route path="/usuarios" element={<ProtectedRoute adminOnly><Users /></ProtectedRoute>} />
              <Route path="/configuracion" element={<ProtectedRoute adminOnly><ThemeConfig /></ProtectedRoute>} />
            </Route>

            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
