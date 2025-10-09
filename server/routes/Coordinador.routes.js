import { Router } from "express";
import { middlewareAuth } from "../middlewares/auth.js";
import CoordinadorController from "../controllers/coordinador.controller.js";

// Destructuración de los métodos del controlador de Coordinador
const { asignarCoordinador, listarCoordinadores } =
  CoordinadorController;

// Creación del router para las rutas de Coordinador
export const coordinadorRouter = Router();

/**
 * =============================================
 * SECCIÓN DE RUTAS GET
 * =============================================
 */

/**
 * @name GET /Coordinador
 * @description Obtiene listado de todos los coordinadores existentes
 * @middleware Requiere uno de estos roles:
 *   - SuperAdmin
 *   - Vicerrector
 *   - Director General de Gestión Curricular
 *   - Coordinador
 * @example
 * // Ejemplo de cURL:
 * curl -X GET 'http://localhost:3000/Coordinador' \
 *   -H 'Authorization: Bearer token'
 *
 * // Respuesta esperada:
 * {
 *   "coordinadores": [
 *     {
 *       "id_coordinador": 1,
 *       "fecha_inicio": "2024-01-15",
 *       "fecha_fin": null,
 *       "estatus": "activo",
 *       "departamento": "Matemáticas",
 *       "area_responsabilidad": "Coordinación Académica",
 *       "profesor": {
 *         "cedula": 12345678,
 *         "nombres": "María",
 *         "apellidos": "González",
 *         "email": "maria.gonzalez@example.com"
 *       }
 *     }
 *   ]
 * }
 */
coordinadorRouter.get(
  "/Coordinadores",
  middlewareAuth([
    "SuperAdmin",
    "Vicerrector",
    "Director General de Gestión Curricular",
    "Coordinador",
  ]),
  listarCoordinadores
);

/**
 * =============================================
 * SECCIÓN DE RUTAS POST
 * =============================================
 */


/**
 * @name POST /Coordinador/asignar
 * @description Asigna a un profesor existente como coordinador
 * @body {Object} Datos de asignación
 * @middleware Requiere uno de estos roles:
 *   - SuperAdmin
 *   - Vicerrector
 *   - Director General de Gestión Curricular
 * @example
 * // Ejemplo de body JSON:
 * {
 *   "cedula_profesor": 31264460,
 *   "departamento": "Informática",
 *   "area_responsabilidad": "Coordinación de Extensión",
 *   "fecha_inicio": "2024-01-15",
 *   "fecha_fin": "2025-01-15",
 *   "observaciones": "Asignación por reestructuración departamental"
 * }
 */
coordinadorRouter.post(
  "/Coordinador/asignar",
  middlewareAuth([
    "SuperAdmin",
    "Vicerrector",
    "Director General de Gestión Curricular",
  ]),
  asignarCoordinador
);

/**
 * =============================================
 * SECCIÓN DE RUTAS PUT
 * =============================================
 */

/**
 * @name PUT /Coordinador/actualizar
 * @description Actualiza los datos de un coordinador existente
 * @body {Object} Datos actualizados del coordinador
 * @middleware Requiere uno de estos roles:
 *   - SuperAdmin
 *   - Vicerrector
 *   - Director General de Gestión Curricular
 *   - Coordinador
 * @example
 * // Ejemplo de body JSON:
 * {
 *   "id_coordinador": 1,
 *   "departamento": "Nuevo Departamento",
 *   "area_responsabilidad": "Nueva Área de Responsabilidad",
 *   "fecha_fin": "2026-01-15",
 *   "estatus": "activo"
 * }
 */
coordinadorRouter.put(
  "/Coordinador/actualizar",
  middlewareAuth([
    "SuperAdmin",
    "Vicerrector",
    "Director General de Gestión Curricular",
    "Coordinador",
  ]),
);

/**
 * =============================================
 * SECCIÓN DE RUTAS DELETE
 * =============================================
 */

/**
 * @name DELETE /Coordinador/eliminar
 * @description Elimina un coordinador del sistema (cambio de estatus o eliminación lógica)
 * @query {number} id_coordinador - ID del coordinador a eliminar
 * @middleware Requiere uno de estos roles:
 *   - SuperAdmin
 *   - Vicerrector
 *   - Director General de Gestión Curricular
 * @example
 * // Ejemplo de cURL:
 * curl -X DELETE 'http://localhost:3000/Coordinador/eliminar?id_coordinador=1' \
 *   -H 'Authorization: Bearer token'
 */
coordinadorRouter.delete(
  "/Coordinador/eliminar",
  middlewareAuth([
    "SuperAdmin",
    "Vicerrector",
    "Director General de Gestión Curricular",
  ]),
);
