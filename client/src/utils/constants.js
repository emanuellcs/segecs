// Constantes da aplicação
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Roles de usuário
export const USER_ROLES = {
  STUDENT: 'student',
  SUPERVISOR: 'supervisor',
  COORDINATOR: 'coordinator',
  ADMIN: 'admin',
};

// Status de estágio
export const INTERNSHIP_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

