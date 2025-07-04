// ProtectedViews.js
import Box from '@mui/material/Box'
import LogoSimple from '../components/ui/logoSimple'
import { Navigate } from "react-router-dom";
import { useAuth } from "../hook/useAuth";

const ProtectedViews = ({ children, allowedRoles }) => {
  const { isAuthenticated, isLoading, checkUserAccess } = useAuth();

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
        <LogoSimple animacion={true} ></LogoSimple>
      </Box>
    );
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
