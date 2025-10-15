import { Router } from "express";
import HorarioController from "../controllers/horario.controller.js";
import { middlewareAuth } from "../middlewares/auth.js";

const {
  registrarHorario,
  mostrarHorarios,
  mostrarProfesoresParaHorario,
  mostrarAulasParaHorario,
  mostrarHorariosProfesores,
  exportarHorarioWord,
} = HorarioController;

export const HorarioRouter = Router();

/**
 * =============================================
 * SECCIÓN DE RUTAS GET
 * =============================================
 */

/**
 * @name GET /Horarios
 * @description Ver todos los horarios registrados.
 * @middleware Requiere uno de estos roles:
 *   - SuperAdmin
 *   - Vicerrector
 *   - Director General de Gestión Curricular
 *   - Coordinador
 *   - Profesor
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
 * @name GET /Horarios
 * @description Ver todos los horarios registrados.
 * @middleware Requiere uno de estos roles:
 *   - SuperAdmin
 *   - Vicerrector
 *   - Director General de Gestión Curricular
 *   - Coordinador
 *   - Profesor
 */
HorarioRouter.get(
  "/exportar/:id_seccion",
  middlewareAuth([
    "SuperAdmin",
    "Vicerrector",
    "Director General de Gestión Curricular",
    "Coordinador",
    "Profesor",
  ]),
  exportarHorarioWord
);

/**
 * @name GET /Horarios/Profesores
 * @description Ver los horarios asignados a los profesores.
 * @middleware Requiere uno de estos roles:
 *   - SuperAdmin
 *   - Vicerrector
 *   - Director General de Gestión Curricular
 *   - Coordinador
 *   - Profesor
 */
HorarioRouter.get(
  "/Horarios/Profesores",
  middlewareAuth([
    "SuperAdmin",
    "Vicerrector",
    "Director General de Gestión Curricular",
    "Coordinador",
    "Profesor",
  ]),
  mostrarHorariosProfesores
);

/**
 * @name GET /Profesores/to/horarios
 * @description Obtener información de profesores para la creación de un nuevo horario.
 * @middleware Requiere uno de estos roles:
 *   - SuperAdmin
 *   - Vicerrector
 *   - Director General de Gestión Curricular
 *   - Coordinador
 *   - Profesor
 */
HorarioRouter.get(
  "/Profesores/to/horarios",
  middlewareAuth([
    "SuperAdmin",
    "Vicerrector",
    "Director General de Gestión Curricular",
    "Coordinador",
    "Profesor",
  ]),
  mostrarProfesoresParaHorario
);

/**
 * @name GET /Aulas/to/horarios
 * @description Obtener información de aulas disponibles para la creación de un nuevo horario.
 * @middleware Requiere uno de estos roles:
 *   - SuperAdmin
 *   - Vicerrector
 *   - Director General de Gestión Curricular
 *   - Coordinador
 *   - Profesor
 */
HorarioRouter.get(
  "/Aulas/to/horarios",
  middlewareAuth([
    "SuperAdmin",
    "Vicerrector",
    "Director General de Gestión Curricular",
    "Coordinador",
    "Profesor",
  ]),
  mostrarAulasParaHorario
);

/**
 * =============================================
 * SECCIÓN DE RUTAS POST
 * =============================================
 */

/**
 * @name POST /Horario/create
 * @description Crear un nuevo horario académico.
 * @body {Object} datos del nuevo horario:
 * {
 *    "idSeccion": 2,
 *    "idProfesor": 1,
 *    "idUnidadCurricular": 1,
 *    "idAula": 1,
 *    "diaSemana": "Lunes",
 *    "horaInicio": "10:20:00"
 * }
 * @middleware Requiere uno de estos roles:
 *   - SuperAdmin
 *   - Vicerrector
 *   - Director General de Gestión Curricular
 *   - Coordinador
 *   - Profesor
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
