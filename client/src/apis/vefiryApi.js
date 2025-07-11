import axios from './axios.js';

// Definimos el tipo para la respuesta del servido
export async function verifyApi() {
    const response = await axios.get('/vefiry');
    return response.data;
}

