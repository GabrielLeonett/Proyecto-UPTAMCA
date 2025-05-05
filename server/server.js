// Carga las variables de entorno
import dotenv from "dotenv";
dotenv.config();

// Importación de dependencias
import express from "express";
import picocolors from "picocolors";
import { userRouter } from "./routes/userRoutes.js";
import { segurityMiddleware } from "./middlewares/security.js";
import helmet from "helmet";

// Creación del servidor
const app = express();

// Configuración del servidor
const PORT = process.env.PORT || 3000;
const APP_NAME = process.env.APP_NAME; // Valor por defecto opcional

console.log(`Nombre de la aplicación: ${APP_NAME}`);

// Middleware de seguridad
app.use(segurityMiddleware);
app.use(helmet());

// Middleware para procesar los datos JSON
app.use(express.json());

// Rutas
app.use("", userRouter);

// Encendido del servidor
app.listen(PORT, () => {
  console.log(
    picocolors.bgRed(
      `${APP_NAME} está corriendo en: http://localhost:${PORT}`
    )
  );
});