import React, { createContext, useState } from "react";
import { loginAPI } from "../apis/AuthApi.js";


export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAutenticate, setIsAutenticate] = useState(false);

  const login = async (userData)=> {
    try{
      const loginData = await loginAPI(userData);
      setUser(loginData.user);
      setIsAutenticate(true);
      return loginData;
    }catch(error){
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, isAutenticate }}>
      {children}
    </AuthContext.Provider>
  );
}