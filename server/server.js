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
import { UserRouter } from "./routes/fjasdjfasdf.js";
import { HorarioRouter } from "./routes/HorarioRoutes.js";
import { NotificationRoutes } from "./routes/NotificationRoutes.js";



// Creación del servidor
const app = express();

// Middleware de seguridad
app.use(segurityMiddleware);
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}))

app.use(helmet());

// Rutas
app.use("", profesorRouter);
app.use("", CurricularRouter);
app.use("", UserRouter);
app.use("", HorarioRouter);
app.use("", NotificationRoutes);

// Middleware para procesar los datos JSON
app.use(express.json());
app.use(cookieParser());


// Encendido del servidor
app.listen(process.env.SERVER_PORT, () => {
  console.log(
    picocolors.bgGreen(
      `${process.env.APP_NAME} está corriendo en el puerto: ${process.env.SERVER_PORT}`
    )
  );
});