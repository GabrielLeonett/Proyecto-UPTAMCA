import pg from 'pg';
import {APP_DB_USER, APP_DB_PASSWORD, APP_DB_HOST, APP_DB_PORT, APP_DB_NAME} from './config.js';

const { Pool } = pg;
// Crear una instancia de Pool para manejar conexiones a la base de datos
export const db = new Pool({
    user: APP_DB_USER,
    host: APP_DB_HOST,
    database: APP_DB_NAME,
    password: APP_DB_PASSWORD,
    port: APP_DB_PORT,
})