import axios from "./axios.js";
import respuestaAxios from "../utils/respuestasAxios.js";

// Definimos el tipo para la respuesta del servido
export async function registrarProfesorApi( data ) {
  try {
    const response = await axios.post("profesor/register", data);
    respuestaAxios({ respuesta: response });
  } catch (error) {
    console.log(error)
    const { response } = error;
    respuestaAxios({ respuesta: response });
  }
}
