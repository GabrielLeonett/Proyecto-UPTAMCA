// ProtectedViews.js
import Box from '@mui/material/Box'
import LogoSimple from '../components/ui/logoSimple'
import { Navigate } from "react-router-dom";
import { useAuth } from "../hook/useAuth";

const ProtectedViews = ({ children, allowedRoles }) => {
  const { isAuthenticated, isLoading, checkUserAccess } = useAuth();
  console.log(isLoading)

  if (isLoading) {
    return (
      <Box
        sx={{
          width: "100%",
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignContent: "center",
        }}
      >
        <LogoSimple animacion={{letras:'logo-letras-loop', pluma:'logo-pluma-loop', libro: 'logo-libro-loop'}}></LogoSimple>
      </Box>
    ); // Muestra un spinner o skeleton
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
