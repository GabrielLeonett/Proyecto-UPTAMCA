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
    const token = req.cookies?.autorization;

    if (!token) {
      return res.status(401).json({ error: "Acceso denegado: Se requiere autenticación" });
    }

    // 2. Verificación de validez del token
    jwt.verify(token, process.env.AUTH_SECRET_KEY, (error, decoded) => {
      if (error) {
        // Manejo específico de errores de token
        return res.status(403).json({ 
          error: error.name === "TokenExpiredError" 
            ? "Token expirado, por favor inicie sesión nuevamente" 
            : "Token inválido" 
        });
      }
      
      // Adjunta la información del usuario decodificada a la solicitud
      req.user = decoded;

      // 3. Verificación de roles (si se especificaron roles requeridos)
      if (requiredRoles) {
        // Lógica corregida: SuperAdmin tiene acceso completo O el usuario tiene alguno de los roles requeridos
        const hasPermission = req.user.roles.some(role => 
          role === 'SuperAdmin' || requiredRoles.includes(role)
        );

        if (!hasPermission) {
          return res.status(403).json({ 
            error: "Acceso denegado: Privilegios insuficientes" 
          });
        }
      }
      
      // Si pasa todas las validaciones, continúa con el siguiente middleware
      next();
    });
  };
};