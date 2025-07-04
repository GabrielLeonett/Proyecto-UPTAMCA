// Carga las variables de entorno
import dotenv from "dotenv";

const envFile = `.env.${process.env.NODE_ENV || 'development'}`;

dotenv.config({path:envFile})


// Importación de dependencias
import cookieParser from "cookie-parser";
import express from "express";
import picocolors from "picocolors";
import { segurityMiddleware } from "./middlewares/security.js";
import helmet from "helmet";
import cors from 'cors'

// Importaciones de Rutas
import { profesorRouter } from "./routes/ProfesorRoutes.js";
import { CurricularRouter } from "./routes/CurricularRoutes.js";
import { UserRouter } from "./routes/UserRoutes.js";
import { HorarioRouter } from "./routes/HorarioRoutes.js";

// Creación del servidor
const app = express();

// Middleware de seguridad
app.use(segurityMiddleware);
app.use(cors({
  origin: process.env.ORIGIN_FRONTEND,
  credentials: true
}));
app.use(helmet());
app.use(express.json());
app.use(cookieParser());

// Rutas
app.use("", profesorRouter);
app.use("", CurricularRouter);
app.use("", UserRouter);
app.use("", HorarioRouter);



// Encendido del servidor
app.listen(process.env.SERVER_PORT, () => {
  console.log(
    picocolors.bgGreen(
      `${process.env.APP_NAME} está corriendo en el puerto: ${process.env.SERVER_PORT}`
    )
  );
});