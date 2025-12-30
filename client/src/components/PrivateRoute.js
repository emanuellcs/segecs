import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const PrivateRoute = () => {
  // Tenta pegar o token salvo no navegador
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');

  // Se tiver token e user, renderiza a página interna (Outlet).
  // Se não tiver, chuta o usuário de volta para a raiz (Login).
  return (token && user) ? <Outlet /> : <Navigate to="/" />;
};

export default PrivateRoute;
