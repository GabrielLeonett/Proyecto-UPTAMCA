import React, { createContext, useState } from "react";
import { registerUser } from "../apis/AuthAPI";


export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const login = async (userData)=> {
    try {
      const loginData = await registerUser(userData);
      setUser(loginData);
    } catch (error) {
      console.error("Login failed:", error);
      throw error; // Puedes manejar esto de otra forma según tus necesidades
    }
  };

  return (
    <AuthContext.Provider value={{ user, login }}>
      {children}
    </AuthContext.Provider>
  );
}