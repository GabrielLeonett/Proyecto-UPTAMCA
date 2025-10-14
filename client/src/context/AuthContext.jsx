import { createContext, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import useApi from "../hook/useApi.jsx";
import Swal from "sweetalert2";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const axios = useApi();
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Nuevo estado de carga
  const navigate = useNavigate();

  const login = useCallback(
    async (userData) => {
      try {
        const { data } = await axios.post("/login", userData);
        if (data) {
          setUser(data);
          setIsAuthenticated(true);

          // Redirección con React Router
          setTimeout(() => {
            if (data.primera_vez) {
              navigate("/cambiar-contraseña");
            } else {
              navigate("/");
            }
          }, 3000);
        } else {
          throw new Error("Respuesta del servidor incompleta");
        }
      } catch (e) {
        console.error(e);
        setUser(null);
        setIsAuthenticated(false);
      }
    },
    [navigate]
  );

  const logout = useCallback(async () => {
    try {
      // Hacer petición de logout al backend
      await axios.get(
        "/logout",
        {},
        {
          withCredentials: true, // Importante para enviar las cookies
        }
      );

      // Limpiar el estado local
      setUser(null);
      setIsAuthenticated(false);

      // Redirigir a la página de cerrar-session
      navigate("/cerrar-sesion");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);

      // Aunque falle la petición, limpiar el estado local y redirigir
      setUser(null);
      setIsAuthenticated(false);
      navigate("/cerrar-sesion");
    }
  }, [navigate]);

  const verifyAuth = useCallback(async () => {
    setIsLoading(true);
    try {
      const verifiedData = await axios.get("/verification");
      if (verifiedData) {
        setUser(verifiedData);
        setIsAuthenticated(true);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

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

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated,
        isLoading, // Exportamos el estado de carga
        checkUserAccess,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
