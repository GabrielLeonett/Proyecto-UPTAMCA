// Carga las variables de entorno
import dotenv from "dotenv";
dotenv.config();

// Importación de dependencias
import cookieParser from "cookie-parser";
import express from "express";
import picocolors from "picocolors";
import { userRouter } from "./routes/userRoutes.js";
import { segurityMiddleware } from "./middlewares/security.js";
import helmet from "helmet";
import cors from 'cors'

// Creación del servidor
const app = express();

// Configuración del servidor
const PORT = process.env.PORT || 3000;
const APP_NAME = process.env.APP_NAME; // Valor por defecto opcional


// Middleware de seguridad
app.use(segurityMiddleware);
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}))
app.use(helmet());

// Middleware para procesar los datos JSON
app.use(express.json());
app.use(cookieParser());

// Rutas
app.use("", userRouter);

// Encendido del servidor
app.listen(PORT, () => {
  console.log(
    picocolors.bgGreen(
      `${APP_NAME} está corriendo en: http://localhost:${PORT}`
    )
  );
});