//Importa funcion para poder obtener la cookie de un string
import { getCookie } from "../utils/utilis.js";
// Importa la librería jsonwebtoken para trabajar con JWT (JSON Web Tokens)
import jwt from "jsonwebtoken";
/**
 * Middleware de autenticación JWT que protege rutas basado en roles.
 *
 * @example
 * // Uso básico:
 * router.get('/ruta-protegida', middlewareAuth(['admin', 'editor']), handler);
 *
 * @param {string[]} [requiredRoles] - Roles requeridos para acceder (opcional).
 *
 * @returns {import('express').RequestHandler} Middleware de Express
 *
 * @throws {401} Si no hay token presente
 * @throws {403} Si el token es inválido/expirado o faltan permisos
 *
 * @version 2.0.0
 * @since 1.0.0
 */
export const middlewareAuth = (requiredRoles, options = {}) => {
  return (req, res, next) => {
    // 1. Verificación de token presente
    //console.log("Cookies recibido en middlewareAuth:", req.cookies);
    const token = req.cookies?.autorization;
    //console.log("Token recibido en middlewareAuth:", token);
    
    if (!token) {
      return res
      .status(401)
      .json({ error: "Acceso denegado: Se requiere autenticación" });
    }
    
    // 2. Verificación de validez del token
    jwt.verify(token, process.env.AUTH_SECRET_KEY, (error, decoded) => {
      if (error) {
        // Manejo específico de errores de token
        return res.status(403).json({
          error:
          error.name === "TokenExpiredError"
          ? "Token expirado, por favor inicie sesión nuevamente"
          : "Token inválido",
        });
      }
      
      // Adjunta la información del usuario decodificada a la solicitud
      req.user = decoded;
      //console.log("Datos extraidos del middleware:", decoded);
      
      // 3. Verificación de roles (si se especificaron roles requeridos)
      if (requiredRoles) {
        // Lógica corregida: SuperAdmin tiene acceso completo O el usuario tiene alguno de los roles requeridos
        const hasPermission = req.user.roles.some(
          (role) => role === "SuperAdmin" || requiredRoles.includes(role)
        );

        if (!hasPermission) {
          return res.status(403).json({
            error: "Acceso denegado: Privilegios insuficientes",
          });
        }
      }

      // Si pasa todas las validaciones, continúa con el siguiente middleware
      next();
    });
  };
};

/**
 * Middleware de autenticación JWT para Socket.io que protege conexiones basado en roles.
 *
 * @example
 * // Uso básico:
 * io.use(socketAuth(['admin', 'editor']));
 *
 * // En tu servicio Socket:
 * this.io.use(socketAuth(['user', 'admin']));
 *
 * @param {string[]} [requiredRoles] - Roles requeridos para la conexión (opcional).
 *
 * @returns {Function} Middleware de Socket.io
 *
 * @throws {Error} Si no hay token presente
 * @throws {Error} Si el token es inválido/expirado o faltan permisos
 *
 * @version 1.0.0
 * @since 1.0.0
 */
export const socketAuth = (requiredRoles = []) => {
  return (socket, next) => {
    try {
      // Si ya tenemos socket.user, saltar la verificación
      if (socket.user) {
        return validateRoles(socket, requiredRoles, next);
      }

      const autorizationCookie = getCookie(
        socket.handshake.headers.cookie,
        "autorization"
      );

      // Si no hay token, continuar como anónimo
      if (!autorizationCookie) {
        return next();
      }

      // Verificar token
      jwt.verify(
        autorizationCookie,
        process.env.AUTH_SECRET_KEY,
        (error, decoded) => {
          if (error) {
            return next(); // Continuar como anónimo
          }

          // Adjuntar información del usuario
          const { id, nombres, apellidos, roles } = decoded;
          socket.user = { id, nombres, apellidos, roles };

          // Validar roles después de tener el usuario
          validateRoles(socket, requiredRoles, next);
        }
      );
    } catch (error) {
      next(); // Continuar como anónimo en caso de error
    }
  };
};

// Función auxiliar para validación de roles
function validateRoles(socket, requiredRoles, next) {
  // Solo validar si se especificaron roles requeridos
  if (requiredRoles && requiredRoles.length > 0 && socket.user) {
    const hasRequiredRole = socket.user.roles.some(
      (role) => role === "SuperAdmin" || requiredRoles.includes(role)
    );

    if (!hasRequiredRole) {
      return next(new Error("Acceso denegado: Privilegios insuficientes"));
    }
  }
  
  next();
}
