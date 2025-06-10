import axios from "axios";
import respuestaAxios from "../utils/respuestasAxios.js";

const API_URL = "http://localhost:3000/login";

// Definimos el tipo para la respuesta del servido
export async function loginAPI(input) {
  try {
    const response = await axios.post(API_URL, input, {
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
      },
    });
    respuestaAxios({ respuesta: response });
    return response.data;
  } catch (error) {
    const {response} = error
    respuestaAxios({ respuesta: response });
    throw error;
  }
}
