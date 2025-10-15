import { Router } from "express";
import { middlewareAuth } from "../middlewares/auth.js";
import UserController from "../controllers/user.controller.js";
import fs from "node:fs";

const {
  login,
  verificarUsers,
  closeSession,
  cambiarContraseña,
  enviarNotificacion,
} = UserController;

export const UserRouter = Router();

/**
 * =============================================
 * RUTAS PÚBLICAS (Sin autenticación)
 * =============================================
 */

/**
 * @name POST /auth/login
 * @description Iniciar sesión de usuario
 * @body {Object} Credenciales de acceso
 * @body {string} body.email - Correo electrónico
 * @body {string} body.password - Contraseña
 */
UserRouter.post("/auth/login", login);

/**
 * =============================================
 * RUTAS DE AUTENTICACIÓN
 * =============================================
 */

/**
 * @name GET /auth/verify
 * @description Verificar token de autenticación y obtener datos del usuario
 * @middleware Requiere autenticación (cualquier rol)
 */
UserRouter.get("/auth/verify", middlewareAuth(null), verificarUsers);

/**
 * @name POST /auth/logout
 * @description Cerrar sesión del usuario
 * @middleware Requiere autenticación (cualquier rol)
 */
UserRouter.post("/auth/logout", middlewareAuth(null), closeSession);

/**
 * @name PUT /auth/password
 * @description Cambiar contraseña del usuario autenticado
 * @middleware Requiere uno de estos roles:
 *   - Profesor
 *   - SuperAdmin
 *   - Vicerrector
 *   - Director General de Gestión Curricular
 *   - Coordinador
 */
UserRouter.put(
  "/auth/password",
  middlewareAuth([
    "Profesor",
    "SuperAdmin", 
    "Vicerrector",
    "Director General de Gestión Curricular",
    "Coordinador"
  ]),
  cambiarContraseña
);

/**
 * =============================================
 * RUTAS DE NOTIFICACIONES
 * =============================================
 */

/**
 * @name GET /notifications
 * @description Obtener notificaciones del usuario
 * @middleware Requiere autenticación (cualquier rol)
 */
UserRouter.get("/notifications", middlewareAuth(null), enviarNotificacion);

/**
 * =============================================
 * RUTAS DE ADMINISTRACIÓN
 * =============================================
 */

/**
 * @name GET /admin/reports
 * @description Obtener reportes del sistema (solo SuperAdmin)
 * @middleware Requiere rol: SuperAdmin
 */
UserRouter.get("/admin/reports", middlewareAuth(["SuperAdmin"]), (req, res) => {
  fs.readFile("./report/report.json", (err, data) => {
    try {
      if (err) {
        return res.status(500).json({
          status: 500,
          title: "Error del servidor",
          message: "No se pudo leer el archivo de reportes"
        });
      }
      res.json(JSON.parse(data));
    } catch (err) {
      console.log(err);
      res.status(500).json({
        status: 500,
        title: "Error del servidor", 
        message: "Error al procesar el reporte"
      });
    }
  });
});