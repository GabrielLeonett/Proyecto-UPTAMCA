import dotenv from "dotenv";
dotenv.config(); // Cargar variables de entorno desde el archivo .env

// knexfile.js
export default {
  development: {
    client: 'pg',  // o 'pg', 'sqlite3', etc.
    connection: {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT 
    },
    migrations: {
      directory: './database/migrations',
    },
    seeds: {
      directory: './database/seeds',
    },
  },
};