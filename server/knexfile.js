import dotenv from "dotenv";

const envFile = `.env.${process.env.NODE_ENV || "development"}`;

dotenv.config({ path: envFile }); // Cargar el archivo correspondiente

// knexfile.js
export default {
  development: {
    client: "pg", // o 'pg', 'sqlite3', etc.
    connection: {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT,
    },
    migrations: {
      directory: "./database/migrations",
    },
    seeds: {
      directory: "./database/seeds",
    },
  },
  production: {
    client: "pg", // o 'pg', 'sqlite3', etc.
    connection: {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE, // Asegúrate de que coincide con el nombre en Render
      port: process.env.DB_PORT,
      ssl: { rejectUnauthorized: false }, // Obligatorio en Render
      connectionTimeoutMillis: 5000, // 5 segundos para establecer conexión
      idleTimeoutMillis: 30000, // Cierra conexiones inactivas después de 30s
      max: 10, // Máximo de conexiones en el pool
      allowExitOnIdle: true, // Libera recursos cuando el pool está inactivo
    },
    migrations: {
      directory: "./database/migrations",
    },
    seeds: {
      directory: "./database/seeds",
    },
  },
};
