import { createContext, useState, useEffect, useCallback } from "react";
import { verifyApi } from "../apis/vefiryApi.js"; // Corregí el nombre del archivo
import { useNavigate } from "react-router-dom";
import axios from "../apis/axios.js";
import Swal from "sweetalert2";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Nuevo estado de carga
  const navigate = useNavigate();

  const login = useCallback(
    async (userData) => {
      try {
        const { data } = await axios.post("/login", userData);

        if (data?.user) {
          setUser(data.user);
          setIsAuthenticated(true);

          Swal.fire({
            icon: "success",
            title: "¡Bienvenido!",
            text: "Has iniciado sesión correctamente",
            timer: 1500,
            showConfirmButton: false,
          });

          // Redirección con React Router
          setTimeout(() => {
            if (data.user.primera_vez) {
              navigate("/cambiar-contraseña");
            } else {
              navigate("/");
            }
          }, 3000);
        } else {
          throw new Error("Respuesta del servidor incompleta");
        }
      } catch (error) {
        // Manejo de errores (igual que arriba)
        let errorMessage = "Error al iniciar sesión";

        if (error.response) {
          switch (error.response.status) {
            case 401:
              errorMessage = "Usuario o contraseña incorrectos";
              break;
            case 403:
              errorMessage = "Cuenta desactivada. Contacta al administrador";
              break;
            default:
              errorMessage =
                error.response.data?.message || "Error del servidor";
          }
        }

        Swal.fire({
          icon: "error",
          title: "Error de autenticación",
          text: errorMessage,
          confirmButtonColor: "#3085d6",
        });

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
      navigate("/cerrar-session");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);

      // Aunque falle la petición, limpiar el estado local y redirigir
      setUser(null);
      setIsAuthenticated(false);
      navigate("/cerrar-session");
    }
  }, [navigate]);

  const verifyAuth = useCallback(async () => {
    setIsLoading(true);
    try {
      const verifiedData = await verifyApi();
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
