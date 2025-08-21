import { Router } from "express";
import HorarioController from "../controllers/HorarioController.js";
import { middlewareAuth } from "../middlewares/auth.js";

const { registrarHorario, mostrarHorarios } = HorarioController;

export const HorarioRouter = Router();

/**
 * =============================================
 * SECCIÓN DE RUTAS GET
 * =============================================
 */

/**
 * @name POST
 * @description Ver los horarios
 * @middleware Requiere uno de estos roles:
 *   - SuperAdmin
 *   - Vicerrector
 *   - Director General de Gestión Curricular
 */
HorarioRouter.get(
  "/Horarios",
  middlewareAuth([
    "SuperAdmin",
    "Vicerrector",
    "Director General de Gestión Curricular",
    "Coordinador",
    "Profesor",
  ]),
  mostrarHorarios
);

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
 *    "idSeccion": 2,
 *    "idProfesor": 1,
 *    "idUnidadCurricular": 1,
 *    "idAula": 1,
 *    "diaSemana": "Lunes",
 *    "horaInicio": "10:20:00"
 * }
 */

HorarioRouter.post(
  "/Horario/create",
  middlewareAuth([
    "SuperAdmin",
    "Vicerrector",
    "Director General de Gestión Curricular",
    "Coordinador",
    "Profesor",
  ]),
  registrarHorario
);
