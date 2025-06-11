import axios from "./axios.js";
import respuestaAxios from "../utils/respuestasAxios.js";

// Definimos el tipo para la respuesta del servido
export async function registrarPnfApi({ data }) {
  try {
    console.log(data)
    const response = await axios.post("PNF/create", data);
    respuestaAxios({ respuesta: response });
  } catch (error) {
    const { response } = error;
    respuestaAxios({ respuesta: response });
  }
}
