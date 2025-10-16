// Carga las variables de entorno
import dotenv from "dotenv";

const envFile = `.env.${process.env.NODE_ENV || "development"}`;

dotenv.config({ path: envFile });

// Importación de dependencias
import cookieParser from "cookie-parser";
import express from "express";
import { securityMiddleware } from "./middlewares/security.js";
import { jsonSyntaxErrorHandler } from "./middlewares/process.js";
import helmet from "helmet";
import { createServer } from "node:http";

import SocketServices from "./services/socket.service.js";

// Importaciones de Rutas
import { profesorRouter } from "./routes/Profesor.routes.js";
import { CurricularRouter } from "./routes/Curricular.routes.js";
import { UserRouter } from "./routes/User.routes.js";
import { HorarioRouter } from "./routes/Horario.routes.js";
import { SedesRouter } from "./routes/Sedes.routes.js";
import { AulaRouter } from "./routes/aula.routes.js";
import { coordinadorRouter } from "./routes/Coordinador.routes.js";

// Creación del servidor
const app = express();
export const server = createServer(app);

// Middleware de seguridad
app.use(securityMiddleware);
app.use(helmet());
app.use(express.json());
app.use(cookieParser());
app.use(jsonSyntaxErrorHandler);

//Rutas del sistema
app.use("", profesorRouter);
app.use("", CurricularRouter);
app.use("", UserRouter);
app.use("", HorarioRouter);
app.use("", AulaRouter);
app.use("", SedesRouter);
app.use("", coordinadorRouter);

const servicioSocket = new SocketServices();
const io = servicioSocket.initializeService();

io.on("connection", (socket) => {

});

// Encendido del servidor
server.listen(process.env.SERVER_PORT, () => {
  console.log(`Servidor corriendo en el puerto ${process.env.SERVER_PORT}`);
  console.log(
    `Notificaciones WebSocket configuradas en puerto ${process.env.SERVER_PORT}`
  );
});
