import axios from 'axios';
import { formatErrorAxios } from '../utils/formatErrorAxios.js';

const API_URL = 'http://localhost:3000/login';


// Definimos el tipo para la respuesta del servido
export async function registerUser(input) {
  try {
    const response = await axios.post(API_URL, input, {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    const formatError = formatErrorAxios(error)
    throw formatError;
  }
}
