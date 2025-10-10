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

import SocketServices from "./services/socket.services.js";

// Importaciones de Rutas
import { profesorRouter } from "./routes/profesor.routes.js";
import { CurricularRouter } from "./routes/curricular.routes.js";
import { UserRouter } from "./routes/user.routes.js";
import { HorarioRouter } from "./routes/horario.routes.js";
import { SedesRouter } from "./routes/sedes.routes.js";
import { AulaRouter } from "./routes/aula.routes.js";
import { coordinadorRouter } from "./routes/coordinador.routes.js";

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

const servicioSocket = new SocketServices("websocket");
const io = servicioSocket.initializeService();

io.on("connection", (socket) => {

  socket.on("disconnect", (reason) => {
  });

  socket.on("error", (error) => {
    console.error("Socket error:", error);
  });
});

// Encendido del servidor
server.listen(process.env.SERVER_PORT, () => {
  console.log(`Servidor corriendo en el puerto ${process.env.SERVER_PORT}`);
  console.log(
    `Notificaciones WebSocket configuradas en puerto ${process.env.SERVER_PORT}`
  );
});
