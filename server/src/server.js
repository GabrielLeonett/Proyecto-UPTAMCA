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
import SystemMonitor from "./services/systemMonitor.service.js";

// Importaciones de Rutas
import { profesorRouter } from "./routes/profesor.routes.js";
import { CurricularRouter } from "./routes/curricular.routes.js";
import { UserRouter } from "./routes/user.routes.js";
import { HorarioRouter } from "./routes/horario.routes.js";
import { SedesRouter } from "./routes/sedes.routes.js";
import { AulaRouter } from "./routes/aula.routes.js";
import { coordinadorRouter } from "./routes/coordinador.routes.js";
import { NotificationRouter } from "./routes/notification.routes.js";

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
app.use("", NotificationRouter);

//Configuración de WebSocke
const servicioSocket = new SocketServices();
const io = servicioSocket.initializeService();

let monitoringInterval = null;
let superAdminCount = 0;

io.on("connection", (socket) => {
  console.log("Nuevo cliente conectado:", socket.id);

  if (socket.user && socket.user.roles.includes("SuperAdmin")) {
    superAdminCount++;
    console.log(`SuperAdmin conectado. Total: ${superAdminCount}`);

    // 🔥 Iniciar monitoreo SOLO si es el primer SuperAdmin
    if (superAdminCount === 1 && !monitoringInterval) {
      console.log("🚀 Iniciando monitoreo del sistema...");
      monitoringInterval = SystemMonitor.iniciarMonitoreoTiempoReal(5000);
    }

    // Unir al socket a la sala de SuperAdmin
    socket.join("role_SuperAdmin");
  }

  socket.on("disconnect", (reason) => {
    console.log("Cliente desconectado:", socket.id, "Razón:", reason);

    if (socket.user && socket.user.roles.includes("SuperAdmin")) {
      superAdminCount--;
      console.log(`SuperAdmin desconectado. Total: ${superAdminCount}`);

      // 🔥 Detener monitoreo si no hay más SuperAdmins conectados
      if (superAdminCount === 0 && monitoringInterval) {
        console.log("⏹️ Deteniendo monitoreo del sistema...");
        clearInterval(monitoringInterval);
        monitoringInterval = null;
      }
    }
  });
});

// Encendido del servidor
server.listen(process.env.SERVER_PORT, () => {
  console.log(`Servidor corriendo en el puerto ${process.env.SERVER_PORT}`);
  console.log(
    `Notificaciones WebSocket configuradas en puerto ${process.env.SERVER_PORT}`
  );
});
