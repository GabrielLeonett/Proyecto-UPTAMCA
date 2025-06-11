import jwt from "jsonwebtoken";

export const middlewareAuth = (requiredRoles) => {
  return (req, res, next) => {
    const token = req.cookies.autorization;

    if (!token) {
      return res.status(401).json({ error: "Acceso denegado: No hay token" });
    }

    jwt.verify(token, process.env.AUTH_SECRET_KEY, (error, decoded) => {
      if (error) {
        if (error.name === "TokenExpiredError") {
          return res.status(403).json({ error: "Token expirado" });
        }
        return res.status(403).json({ error: "Token inválido" });
      }
      
      req.user = decoded;

      if (requiredRoles !== null) {
        const isPermitid = req.user.roles.some((role) =>
          requiredRoles.includes(role)
        );
        if (!isPermitid) {
          return res
            .status(403)
            .json({ error: "Acceso denegado: Faltan permisos" });
        }
      }
      
      next();
    });
  };
};
