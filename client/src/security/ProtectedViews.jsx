// ProtectedViews.js
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hook/useAuth';


const ProtectedViews = ({ children, allowedRoles }) => {
  const { isAuthenticated, isLoading, checkUserAccess } = useAuth();

  if (isLoading) {
    return <div>Cargando...</div>; // Muestra un spinner o skeleton
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!checkUserAccess(allowedRoles)) {
    return <Navigate to="/no-autorizado" replace />;
  }

  return children;
};

export default ProtectedViews;