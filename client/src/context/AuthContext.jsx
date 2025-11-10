import { createContext, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import useApi from "../hook/useApi.jsx";
import useSweetAlert from "../hook/useSweetAlert";
import LoadingCharge from "../components/ui/LoadingCharge.jsx";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const alert = useSweetAlert();
  const axios = useApi(true);
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Para verificación inicial
  const [isLoggingIn, setIsLoggingIn] = useState(false); // Estado específico para login
  const navigate = useNavigate();

  const login = useCallback(
    async (userData) => {
      try {
        // Usar el estado específico para login
        setIsLoggingIn(true);

        const { user } = await axios.post("/auth/login", userData);
        console.log(user);
        if (user) {
          setUser(user);
          setIsAuthenticated(true);

          /*
          alert
            .success("¡Inicio de sesión exitoso!", "Bienvenido al sistema")
            .then((result) => {
              if (result.isConfirmed) {
                if (user.primera_vez) {
                  navigate("/cambiar-contraseña");
                } else {
                  navigate("/");
                }
              }
            });
            */
          setTimeout(() => {
            setIsLoggingIn(false);
          }, 3000);

          if (user.primera_vez) {
            navigate("/cambiar-contraseña");
          } else {
            navigate("/");
          }
        } else {
          throw new Error("Respuesta del servidor incompleta");
        }
      } catch (error) {
        setUser(null);
        setIsAuthenticated(false);
        setIsLoggingIn(false);
        if (error.error.totalErrors > 0) {
          error.error.validationErrors.map((error_validacion) => {
            alert.toast(error_validacion.field, error_validacion.message);
          });
        } else {
          alert.error(error.title, error.message);
        }
      }
    },
    [navigate, alert, axios]
  );

  const logout = useCallback(async () => {
    try {
      console.log("Cerrando la sesión...");
      await axios.get("/auth/logout");
      console.log("Cierre exitoso");

      setUser(null);
      setIsAuthenticated(false);
      navigate("/cerrar-sesion");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      setUser(null);
      setIsAuthenticated(false);
      navigate("/cerrar-sesion");
    }
  }, [navigate, axios]);

  const verifyAuth = useCallback(async () => {
    setIsLoading(true);
    try {
      const verifiedData = await axios.get("/auth/verify");
      if (verifiedData) {
        setUser(verifiedData);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error("Error verificando autenticación:", error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, [axios]);

  const checkUserAccess = useCallback(
    (requiredRoles) => {
      if (!isAuthenticated || !user?.roles) return false;
      return user.roles.some((role) => requiredRoles.includes(role));
    },
    [user, isAuthenticated]
  );

  useEffect(() => {
    verifyAuth();
  }, [verifyAuth]);

  // Si está cargando la verificación inicial, mostrar LoadingCharge
  if (isLoading) {
    return <LoadingCharge charge={true} text="Verificando autenticación..." />;
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated,
        isLoading,
        isLoggingIn, // Exportamos el estado de login
        checkUserAccess,
      }}
    >
      {/* Mostrar LoadingCharge global durante el login */}
      {isLoggingIn && (
        <LoadingCharge charge={true} text="Iniciando sesión..." />
      )}

      {/* Renderizar children solo cuando no esté haciendo login */}
      {!isLoggingIn && children}
    </AuthContext.Provider>
  );
}
