import axios from 'axios'

const instacia = axios.create({
    baseURL: 'https://proyecto-uptamca-1.onrender.com/',
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    }
})

export default instacia;