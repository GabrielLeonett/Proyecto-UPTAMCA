// En tu archivo axios.js
import axios from "axios";

const instance = axios.create({
  baseURL: "http://localhost:3000/", // Asegúrate de que esta URL sea correcta
  timeout: 30000,
  withCredentials: true,
});

// Interceptor para debug
instance.interceptors.request.use(
  (config) => {
    console.log("🚀 Request interceptado:", config);
    return config;
  },
  (error) => {
    console.error("❌ Error en request:", error);
    return Promise.reject(error);
  }
);

instance.interceptors.response.use(
  (response) => {
    console.log("✅ Response interceptado:", response);
    return response;
  },
  (error) => {
    console.error("❌ Error en response:", error);
    return Promise.reject(error);
  }
);

export default instance;
