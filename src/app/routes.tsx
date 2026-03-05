import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '@/features/auth/pages/LoginPage';
import PrivateRoute from '@/features/auth/components/PrivateRoute';

// Placeholders para páginas que serão migradas
const DashboardPlaceholder = () => (
  <div className="p-8">
    <h1 className="text-2xl font-bold">Dashboard</h1>
    <p>Bem-vindo ao SEGECS. Em breve, os dados do Supabase aparecerão aqui.</p>
  </div>
);

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <DashboardPlaceholder />
          </PrivateRoute>
        }
      />

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
