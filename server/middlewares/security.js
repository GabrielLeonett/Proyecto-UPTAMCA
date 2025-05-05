import cors from "cors";

export function segurityMiddleware(req, res, next) {
  res.removeHeader("X-Powered-By"); // Ejemplo común
  res.removeHeader("Server");
  cors({
    origin: process.env.CORS_ORIGIN || ["http://localhost:3000", "http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  });
  next();
}
