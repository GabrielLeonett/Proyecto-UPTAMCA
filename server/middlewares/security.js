import cors from "cors";

/**
 * @function segurityMiddleware
 * @description Esta funcion se encarga de la seguridad de la aplicacion en cuanto a las conexion de cors y otros
 */

export function segurityMiddleware(req, res, next) {
  res.removeHeader("X-Powered-By"); // Ejemplo común
  res.removeHeader("Server");
  next();
}
