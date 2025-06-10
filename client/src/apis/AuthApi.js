import axios from './axios.js';
import respuestaAxios from "../utils/respuestasAxios.js";

// Definimos el tipo para la respuesta del servido
export async function loginAPI(input) {
  try {
    const response = await axios.post('login', input);
    respuestaAxios({respuesta: response})
    return response.data;
  } catch (error) {
    const {response} = error
    respuestaAxios({ respuesta: response});
  }
}
