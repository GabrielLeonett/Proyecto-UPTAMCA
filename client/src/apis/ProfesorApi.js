import axios from 'axios';

const API_URL = 'http://localhost:3000/api/profesor';

function registerProfesor(profesor) {
    try {
        const response = axios.post(API_URL, profesor, { whitCredentials: true, headers: { 'Content-Type': 'application/json' } });
        return response.data;
    } catch (error) {
        console.error('Error registering profesor:', error);
        throw error;
    }
}