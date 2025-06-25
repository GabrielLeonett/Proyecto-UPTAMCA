import dotenv from "dotenv";

const envFile = `.env.${process.env.NODE_ENV || 'development'}`;

dotenv.config({ path: envFile }); // Cargar el archivo correspondiente

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
  deploy: {
    client: 'pg',  // o 'pg', 'sqlite3', etc.
    connection: {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT,
      ssl:{ rejectUnauthorized: true }
    },
    migrations: {
      directory: './database/migrations',
    },
    seeds: {
      directory: './database/seeds',
    },
  },
};