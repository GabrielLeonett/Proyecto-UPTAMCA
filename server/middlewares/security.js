import cors from "cors";

export function segurityMiddleware(req, res, next) {
  res.removeHeader("X-Powered-By"); // Ejemplo común
  res.removeHeader("Server");
  next();
}
