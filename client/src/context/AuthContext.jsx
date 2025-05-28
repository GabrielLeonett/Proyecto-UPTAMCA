import React, { createContext, useState } from "react";
import { registerUser } from "../apis/AuthAPI";


export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAutenticate, setIsAutenticate] = useState(false);

  const login = async (userData)=> {
    try {
      const loginData = await registerUser(userData);
      console.log("Login successful:", loginData);
      setUser(loginData.user);
      setIsAutenticate(true);
    } catch (error) {
      throw error.response.dataor; // Puedes manejar esto de otra forma según tus necesidades
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, isAutenticate }}>
      {children}
    </AuthContext.Provider>
  );
}