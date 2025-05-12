import axios from 'axios';

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
    console.error('Error registering user:', error);
    throw error;
  }
}