import { createContext, useState, useEffect, useCallback } from "react";
import { loginAPI } from "../apis/AuthApi.js"; // Corregí el nombre del archivo
import { verifyApi } from "../apis/vefiryApi.js"; // Corregí el nombre del archivo
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Nuevo estado de carga
  const navigate = useNavigate();

  const login = useCallback(async (userData) => {
    const loginData = await loginAPI(userData);
    if (loginData?.user) {
      setUser(loginData.user);
      setIsAuthenticated(true);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setIsAuthenticated(false);
    navigate("/Inicio-session");
  }, [navigate]);

  const verifyAuth = useCallback(async () => {
    setIsLoading(true);
    try {
      const verifiedData = await verifyApi();
      if (verifiedData) {
        setUser(verifiedData);
        setIsAuthenticated(true);
      }
    }finally {
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
