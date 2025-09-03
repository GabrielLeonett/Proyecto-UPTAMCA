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
import { profesorRouter } from "./routes/Profesor.routes.js";
import { CurricularRouter } from "./routes/Curricular.routes.js";
import { UserRouter } from "./routes/User.routes.js";
import { HorarioRouter } from "./routes/Horario.routes.js";
import { SedesRouter } from "./routes/Sedes.routes.js";

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
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: "JSON malformado" });
  }
  next();
});
app.use(cookieParser());

// Rutas
app.use("", profesorRouter);
app.use("", CurricularRouter);
app.use("", UserRouter);
app.use("", HorarioRouter);
app.use("", SedesRouter);



// Encendido del servidor
app.listen(process.env.SERVER_PORT, () => {
  console.log(
    picocolors.bgGreen(
      `${process.env.APP_NAME} está corriendo en el puerto: ${process.env.SERVER_PORT}`
    )
  );
});