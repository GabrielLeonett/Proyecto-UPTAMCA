import axios from 'axios'

const instacia = axios.create({
    //baseURL: 'https://proyecto-uptamca-1.onrender.com/',
    baseURL: 'http://localhost:3000/', //Descomentar esto si es para hacer pruebas en el servidor local
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    }
})

export default instacia;