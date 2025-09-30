// Carga las variables de entorno
import dotenv from "dotenv";

const envFile = `.env.${process.env.NODE_ENV || "development"}`;

dotenv.config({ path: envFile });

// Importación de dependencias
import cookieParser from "cookie-parser";
import express from "express";
import picocolors from "picocolors";
import { segurityMiddleware } from "./middlewares/security.js";
import helmet from "helmet";
import { Server } from "socket.io";
import { createServer } from "node:http";
import cors from "cors";

// Importaciones de Rutas
import { profesorRouter } from "./routes/profesor.routes.js";
import { CurricularRouter } from "./routes/curricular.routes.js";
import { UserRouter } from "./routes/user.routes.js";
import { HorarioRouter } from "./routes/horario.routes.js";
import { SedesRouter } from "./routes/sedes.routes.js";
import { AulaRouter } from "./routes/aula.routes.js";

// Creación del servidor
const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: ["*"],
});

// Middleware de seguridad
app.use(segurityMiddleware);
app.use(helmet());
app.use(express.json());
app.use(cookieParser());
console.log(process.env.ORIGIN_FRONTEND)
app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);
//Middleware para formatear la peticion
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({ error: "JSON malformado" });
  }
  next();
});

io.on("connection", (socket) => {
  console.log("a user connected");
  io.emit('message', 'Hola como estas')
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

//Rutas del sistema
app.use("", profesorRouter);
app.use("", CurricularRouter);
app.use("", UserRouter);
app.use("", HorarioRouter);
app.use("", SedesRouter);
app.use("", AulaRouter);

// Encendido del servidor
server.listen(process.env.SERVER_PORT, () => {
  console.log(
    picocolors.bgGreen(
      `${process.env.APP_NAME} está corriendo en el puerto: ${process.env.SERVER_PORT}`
    )
  );
});
