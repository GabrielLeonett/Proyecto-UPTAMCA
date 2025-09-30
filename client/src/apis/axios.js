// En tu archivo axios.js
import axios from "axios";

const instance = axios.create({
  baseURL: "http://localhost:3000/", // Asegúrate de que esta URL sea correcta
  timeout: 30000,
  withCredentials: true,
});


export default instance;
