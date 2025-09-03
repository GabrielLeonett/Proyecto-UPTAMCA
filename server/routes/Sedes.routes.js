import { Router } from "express";
import SedesController from "../controllers/SedesController.js";
import { middlewareAuth } from "../middlewares/auth.js";

const {registerSede } = SedesController;

export const SedesRouter = Router();

/**
 * =============================================
 * SECCIÓN DE RUTAS GET
 * =============================================
*/

/**
 * =============================================
 * SECCIÓN DE RUTAS POST
 * =============================================
 */

/**
 * @name POST /Horario/create
 * @description Crear un nuevo horario
 * @body {Object} datos del nuevo horario - Ver estructura completa abajo
 * @middleware Requiere uno de estos roles:
 *   - SuperAdmin
 *   - Vicerrector
 *   - Director General de Gestión Curricular
 * @example
 * // Ejemplo de body JSON:
 * {
 *    "nombreSede": "Nucleo de Tecnología y Ciencias Administrativas",
 *    "UbicacionSede": "Los Teques, Edo. Miranda",
 *    "GoogleSede": "https://maps.app.goo.gl/EHHeHjA7uXgNA32s9",
 * }
 */

SedesRouter.post(
  "/Sede/create",
  middlewareAuth([
    "SuperAdmin",
    "Vicerrector",
    "Director General de Gestión Curricular",
    "Coordinador",
    "Profesor",
  ]),
  registerSede
);
