import React, { createContext, useState } from "react";
import { registerUser } from "../apis/AuthAPI";


export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const login = async (userData)=> {
    try {
      const loginData = await registerUser(userData);
      setUser(loginData);
      return loginData.menssage; // Retorna los datos del usuario logueado
    } catch (error) {
      return error.response.data; // Maneja el error según tus necesidades
      throw error; // Puedes manejar esto de otra forma según tus necesidades
    }
  };

  return (
    <AuthContext.Provider value={{ user, login }}>
      {children}
    </AuthContext.Provider>
  );
}