import jwt from "jsonwebtoken";

export const middlewareSession = (req, res, next) => {
  // 1. Extraer el token de la cookie "autorization" (¡así la nombraste al crearla!)
  const token = req.cookies.autorization; // ← Nombre exacto de tu cookie

  // 2. Verificar si el token existe
  if (!token) {
    return res.status(401).json({ error: "Acceso denegado: No hay token" });
  }

  // 3. Verificar el token JWT
  jwt.verify(token, process.env.AUTH_SECRET_KEY, (error, decoded) => {
    if (error) {
      // Manejar errores específicos
      if (error.name === "TokenExpiredError") {
        return res.status(403).json({ error: "Token expirado" });
      }
      return res.status(403).json({ error: "Token inválido" });
    }

    // 4. Adjuntar los datos del usuario al request
    req.user = decoded; // decoded = { id, email, etc. } (lo que guardaste en el token)
    next(); // Continuar
  });
};