import cors from "cors";

import { loadEnv } from "../utils/utilis.js";

loadEnv();

/**
 * Configuración CORS para la aplicación
 * Define los orígenes permitidos, métodos HTTP y credenciales
 */
const corsOptions = {
  origin: function (origin, callback) {
    // Lista de orígenes permitidos
    const allowedOrigins = [process.env.ORIGIN_FRONTEND];

    // En desarrollo, permitir cualquier origen (útil para testing)
    if (process.env.NODE_ENV === "development") {
      return callback(null, true);
    }

    // En producción, verificar contra la lista de orígenes permitidos
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Origen no permitido por CORS"));
    }
  },
  credentials: true, // Permitir envío de cookies y credenciales
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"], // Métodos HTTP permitidos
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "Origin",
    "Access-Control-Request-Method",
    "Access-Control-Request-Headers",
  ], // Headers permitidos
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

/**
 * @function securityMiddleware
 * @description Middleware de seguridad que aplica políticas CORS y elimina headers sensibles
 *
 * @param {Object} req - Objeto de petición de Express
 * @param {Object} res - Objeto de respuesta de Express
 * @param {Function} next - Función next de Express para continuar con el siguiente middleware
 *
 * @returns {void}
 *
 * @example
 * // Uso en aplicación Express
 * app.use(securityMiddleware);
 *
 * @description
 * Este middleware combina dos capas de seguridad:
 * 1. Política CORS: Controla qué orígenes pueden acceder a la API
 * 2. Headers de seguridad: Elimina información sensible de los headers de respuesta
 *
 * Funcionalidades específicas:
 * - Configura CORS con orígenes permitidos y métodos HTTP
 * - Permite el envío de credenciales (cookies, autenticación)
 * - Elimina headers que revelan información del servidor
 * - Maneja pre-flight requests correctamente
 */
export function securityMiddleware(req, res, next) {
  // Aplicar política CORS
  cors(corsOptions)(req, res, (err) => {
    if (err) {
      return res.status(403).json({
        error: "Acceso denegado por política CORS",
        message: err.message,
      });
    }

    // Eliminar headers sensibles que revelan información del servidor
    res.removeHeader("X-Powered-By"); // Oculta la tecnología del backend
    res.removeHeader("Server"); // Oculta información del servidor

    // Agregar headers de seguridad adicionales (opcional)
    res.setHeader("X-Content-Type-Options", "nosniff"); // Previene MIME type sniffing
    res.setHeader("X-Frame-Options", "DENY"); // Previene clickjacking

    next();
  });
}
