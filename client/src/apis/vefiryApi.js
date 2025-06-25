import axios from './axios.js';

// Definimos el tipo para la respuesta del servido
export async function verifyApi() {
    const response = await axios.get('/vefiry');
    console.log(response)
    return response.data;
}

