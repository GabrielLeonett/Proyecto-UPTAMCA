import dotenv from "dotenv";
dotenv.config(); // Cargar variables de entorno desde el archivo .env

import pg from "pg";

const { Pool } = pg;

// Crear una instancia de Pool para manejar conexiones a la base de datos
export const db = new Pool({
  user: process.env.DB_USER ,
  host: process.env.DB_HOST ,
  database: process.env.DB_NAME ,
  password: process.env.DB_PASSWORD ,
  port: process.env.DB_PORT ,
});
