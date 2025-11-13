import { Router } from "express";
import { middlewareAuth } from "../middlewares/auth.middleware.js";
import CoordinadorController from "../controllers/coordinador.controller.js";

// Destructuración de los métodos del controlador de Coordinador
const { 
  asignarCoordinador, 
  listarCoordinadores,
  actualizarCoordinador,
  eliminarCoordinador,
} = CoordinadorController;

// Creación del router para las rutas de Coordinador
export const coordinadorRouter = Router();

/**
 * =============================================
 * RUTAS DE COORDINADORES (CRUD PRINCIPAL)
 * =============================================
 */

/**
 * @name GET /coordinadores
 * @description Obtiene listado de todos los coordinadores existentes
 * @query {string} [estatus] - Filtro por estatus (activo/inactivo)
 * @query {string} [departamento] - Filtro por departamento
 * @middleware Requiere uno de estos roles:
 *   - SuperAdmin
 *   - Vicerrector
 *   - Director General de Gestión Curricular
 *   - Coordinador
 * @returns {Array} Lista de coordinadores
 * @example
 * // Obtener todos los coordinadores activos
 * curl -X GET 'http://localhost:3000/coordinadores?estatus=activo'
 * 
 * // Obtener coordinadores de un departamento específico
 * curl -X GET 'http://localhost:3000/coordinadores?departamento=Informática'
 */
coordinadorRouter.get(
  "/coordinadores",
  middlewareAuth([
    "SuperAdmin",
    "Vicerrector",
    "Director General de Gestión Curricular",
    "Coordinador",
  ]),
  listarCoordinadores
);

/**
 * @name GET /coordinadores/:id
 * @description Obtiene un coordinador específico por ID
 * @param {number} id - ID del coordinador
 * @middleware Requiere uno de estos roles:
 *   - SuperAdmin
 *   - Vicerrector
 *   - Director General de Gestión Curricular
 *   - Coordinador
 * @returns {Object} Datos del coordinador
 * @example
 * curl -X GET 'http://localhost:3000/coordinadores/1'
 */
coordinadorRouter.get(
  "/coordinadores/:id",
  middlewareAuth([
    "SuperAdmin",
    "Vicerrector",
    "Director General de Gestión Curricular",
    "Coordinador",
  ]),
  //obtenerCoordinadorPorId
);

/**
 * @name POST /coordinadores
 * @description Asigna a un profesor existente como coordinador
 * @body {Object} Datos de asignación
 * @body {number} body.cedula_profesor - Cédula del profesor a asignar (requerido)
 * @body {string} body.departamento - Departamento de coordinación (requerido)
 * @body {string} body.area_responsabilidad - Área de responsabilidad (requerido)
 * @body {string} body.fecha_inicio - Fecha de inicio (requerido, formato YYYY-MM-DD)
 * @body {string} [body.fecha_fin] - Fecha de finalización (formato YYYY-MM-DD)
 * @body {string} [body.observaciones] - Observaciones adicionales
 * @middleware Requiere uno de estos roles:
 *   - SuperAdmin
 *   - Vicerrector
 *   - Director General de Gestión Curricular
 * @returns {Object} Coordinador creado
 * @example
 * curl -X POST 'http://localhost:3000/coordinadores' \
 *   -H 'Content-Type: application/json' \
 *   -d '{
 *     "cedula_profesor": 31264460,
 *     "departamento": "Informática",
 *     "area_responsabilidad": "Coordinación de Extensión",
 *     "fecha_inicio": "2024-01-15",
 *     "fecha_fin": "2025-01-15",
 *     "observaciones": "Asignación por reestructuración departamental"
 *   }'
 */
coordinadorRouter.post(
  "/coordinadores",
  middlewareAuth([
    "SuperAdmin",
    "Vicerrector",
    "Director General de Gestión Curricular",
  ]),
  asignarCoordinador
);

/**
 * @name PUT /coordinadores/:id
 * @description Actualiza los datos de un coordinador existente
 * @param {number} id - ID del coordinador a actualizar
 * @body {Object} Datos actualizados del coordinador
 * @body {string} [body.departamento] - Nuevo departamento
 * @body {string} [body.area_responsabilidad] - Nueva área de responsabilidad
 * @body {string} [body.fecha_fin] - Nueva fecha de finalización
 * @body {string} [body.estatus] - Nuevo estatus (activo/inactivo)
 * @body {string} [body.observaciones] - Nuevas observaciones
 * @middleware Requiere uno de estos roles:
 *   - SuperAdmin
 *   - Vicerrector
 *   - Director General de Gestión Curricular
 *   - Coordinador
 * @returns {Object} Coordinador actualizado
 * @example
 * curl -X PUT 'http://localhost:3000/coordinadores/1' \
 *   -H 'Content-Type: application/json' \
 *   -d '{
 *     "departamento": "Nuevo Departamento",
 *     "area_responsabilidad": "Nueva Área de Responsabilidad",
 *     "fecha_fin": "2026-01-15",
 *     "estatus": "activo"
 *   }'
 */
coordinadorRouter.put(
  "/coordinadores/:id",
  middlewareAuth([
    "SuperAdmin",
    "Vicerrector",
    "Director General de Gestión Curricular",
    "Coordinador",
  ]),
  actualizarCoordinador
);

/**
 * @name DELETE /coordinadores/:id
 * @description Elimina un coordinador del sistema (eliminación lógica)
 * @param {number} id - ID del coordinador a eliminar
 * @middleware Requiere uno de estos roles:
 *   - SuperAdmin
 *   - Vicerrector
 *   - Director General de Gestión Curricular
 * @returns {Object} Confirmación de eliminación
 * @example
 * curl -X DELETE 'http://localhost:3000/coordinadores/1'
 */
coordinadorRouter.delete(
  "/coordinadores/:id",
  middlewareAuth([
    "SuperAdmin",
    "Vicerrector",
    "Director General de Gestión Curricular",
  ]),
  eliminarCoordinador
);

/**
 * =============================================
 * RUTAS ESPECÍFICAS DE COORDINADORES
 * =============================================
 */

/**
 * @name GET /coordinadores/departamento/:departamento
 * @description Obtiene coordinadores por departamento específico
 * @param {string} departamento - Nombre del departamento
 * @middleware Requiere uno de estos roles:
 *   - SuperAdmin
 *   - Vicerrector
 *   - Director General de Gestión Curricular
 *   - Coordinador
 * @returns {Array} Lista de coordinadores del departamento
 * @example
 * curl -X GET 'http://localhost:3000/coordinadores/departamento/Informática'
 */
coordinadorRouter.get(
  "/coordinadores/departamento/:departamento",
  middlewareAuth([
    "SuperAdmin",
    "Vicerrector",
    "Director General de Gestión Curricular",
    "Coordinador",
  ]),
  // Aquí iría el controlador específico
);

/**
 * @name PUT /coordinadores/:id/estatus
 * @description Cambia el estatus de un coordinador (activar/desactivar)
 * @param {number} id - ID del coordinador
 * @body {Object} Datos del estatus
 * @body {string} body.estatus - Nuevo estatus (activo/inactivo)
 * @body {string} [body.observaciones] - Razón del cambio
 * @middleware Requiere uno de estos roles:
 *   - SuperAdmin
 *   - Vicerrector
 *   - Director General de Gestión Curricular
 * @returns {Object} Confirmación del cambio
 * @example
 * curl -X PUT 'http://localhost:3000/coordinadores/1/estatus' \
 *   -H 'Content-Type: application/json' \
 *   -d '{
 *     "estatus": "inactivo",
 *     "observaciones": "Finalización de período"
 *   }'
 */
coordinadorRouter.put(
  "/coordinadores/:id/estatus",
  middlewareAuth([
    "SuperAdmin",
    "Vicerrector",
    "Director General de Gestión Curricular",
  ]),
  // Aquí iría el controlador para cambiar estatus
);