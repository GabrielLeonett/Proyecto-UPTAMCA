import axios from "./axios.js";

// Definimos el tipo para la respuesta del servido
export async function registrarProfesorApi(formData) {
  try {
    if (!formData) throw new Error('No hay formData'); // ✅ Corregido
    
    const response = await axios.post("profesor/register", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.log("Error en registrarProfesorApi:", error);
    throw new Error(
      error.response?.data?.message || "Error al registrar profesor"
    );
  }
}

