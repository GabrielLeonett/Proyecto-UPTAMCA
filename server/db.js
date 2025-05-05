import pg from 'pg';


const { Pool } = pg;
// Crear una instancia de Pool para manejar conexiones a la base de datos
export const db = new Pool({
    user: process.env.APP_DB_USER,
    host: process.env.APP_DB_HOST,
    database: process.env.APP_DB_NAME,
    password: process.env.APP_DB_PASSWORD,
    port: process.env.APP_DB_PORT,
})