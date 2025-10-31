import { Router } from "express";
import { middlewareAuth } from "../middlewares/auth.js";
import UserController from "../controllers/user.controller.js";
import fs from "node:fs";

const {
  login,
  verificarUsers,
  closeSession,
  cambiarContraseña,
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
 * @name get /auth/logout
 * @description Cerrar sesión del usuario
 * @middleware Requiere autenticación (cualquier rol)
 */
UserRouter.get("/auth/logout", middlewareAuth(null), closeSession);

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