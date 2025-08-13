import { Router } from "express";
import { middlewareAuth } from "../middlewares/auth.js";
import ProfesorController from "../controllers/ProfesorController.js";

// Destructuración de los métodos del controlador de profesores
const { registrarProfesor, mostrarProfesorAPI, mostrarProfesor, buscarProfesor, mostrarPreGrados, mostrarPostGrados, mostrarAreasConocimiento, registerPreGrado, registerPostGrado, registerAreaConocimiento} = ProfesorController;

// Creación del router para las rutas de profesores
export const profesorRouter = Router();

/**
 * =============================================
 * SECCIÓN DE RUTAS GET
 * =============================================
 */

/**
 * @name GET /api/Profesor
 * @description Obtiene listado de profesores con filtros avanzados (API format)
 * @query {string} [dedicacion] - Filtro por dedicación (1: Convencional, etc.)
 * @query {string} [categoria] - Filtro por categoría (ej: "Instructor")
 * @query {string} [ubicacion] - Filtro por ubicación (1: Núcleo Salud, etc.)
 * @query {string} [genero] - Filtro por género ("masculino"/"femenino")
 * @middleware Requiere uno de estos roles:
 *   - SuperAdmin
 *   - Vicerrector
 *   - Director General de Gestión Curricular
 *   - Coordinador
 * @example
 * // Ejemplo de cURL:
 * curl -X GET 'http://localhost:3000/api/Profesor?dedicacion=1&categoria=Instructor'
 */
profesorRouter.get(
"/api/Profesor",
  middlewareAuth([
    'SuperAdmin',
    'Vicerrector',
    'Director General de Gestión Curricular',
    'Coordinador'
  ]),
  mostrarProfesorAPI
);

/**
 * @name GET /Profesor/pre-grado
 * @description Obtener un listado de los pre-grado de los profesores existentes 
 * @query {string} [tipo] - Filtro por tipo (1: TSU, Tecnico Medio, Licenciado, etc.)
 * @middleware Requiere uno de estos roles:
 *   - SuperAdmin
 *   - Vicerrector
 *   - Director General de Gestión Curricular
 *   - Coordinador
 * @example
 * // Ejemplo de URL:
 * curl -X GET 'http://localhost:3000/Profesor/pre-grado?tipo=TSU'
 */
profesorRouter.get(
"/Profesor/pre-grado",
  middlewareAuth([
    'SuperAdmin',
    'Vicerrector',
    'Director General de Gestión Curricular',
    'Coordinador'
  ]),
  mostrarPreGrados
);

/**
 * @name GET /Profesor/post-grado
 * @description Obtener un listado de los post-grado de los profesores existentes 
 * @query {string} [tipo] - Filtro por tipo (Maestria, Doctorado, etc.)
 * @middleware Requiere uno de estos roles:
 *   - SuperAdmin
 *   - Vicerrector
 *   - Director General de Gestión Curricular
 *   - Coordinador
 * @example
 * // Ejemplo de URL:
 * curl -X GET 'http://localhost:3000/Profesor/post-grado?tipo=Maestria'
 */
profesorRouter.get(
"/Profesor/post-grado",
  middlewareAuth([
    'SuperAdmin',
    'Vicerrector',
    'Director General de Gestión Curricular',
    'Coordinador'
  ]),
  mostrarPostGrados
);

/**
 * @name GET /Profesor/areas-conocimiento
 * @description Obtener un listado de las areas de conocimiento de los profesores existentes 
 * @middleware Requiere uno de estos roles:
 *   - SuperAdmin
 *   - Vicerrector
 *   - Director General de Gestión Curricular
 *   - Coordinador
 * @example
 * // Ejemplo de URL:
 * curl -X GET 'http://localhost:3000/Profesor/Areas-conocimiento'
 */
profesorRouter.get(
"/Profesor/areas-conocimiento",
  middlewareAuth([
    'SuperAdmin',
    'Vicerrector',
    'Director General de Gestión Curricular',
    'Coordinador'
  ]),
  mostrarAreasConocimiento
);

/**
 * @name GET /Profesor
 * @description Muestra la vista HTML del listado de profesores
 * @middleware Mismos requisitos de rol que /api/Profesor
 * @example
 * curl -X GET 'http://localhost:3000/Profesor'
 */
profesorRouter.get(
  "/Profesor",
  middlewareAuth([
    'SuperAdmin',
    'Vicerrector',
    'Director General de Gestión Curricular',
    'Coordinador'
  ]),
  mostrarProfesor
);

/**
 * =============================================
 * SECCIÓN DE RUTAS POST
 * =============================================
 */

/**
 * @name POST /Profesor/register
 * @description Registra un nuevo profesor en el sistema
 * @body {Object} Datos del profesor - Ver estructura completa abajo
 * @middleware Requiere uno de estos roles:
 *   - SuperAdmin
 *   - Vicerrector
 *   - Director General de Gestión Curricular
 * @example
 * // Ejemplo de body JSON:
 * {
 *   "nombres": "Gabriel Dayer",
 *   "apellidos": "Leonett Armas",
 *   "email": "gabrielleonett@uptamca.edu.ve",
 *   "id": 31264460,
 *   "password": "12345678",
 *   "direccion": "Av. Bermudez, Los teques",
 *   "telefono_movil": "04142245310",
 *   "telefono_local": "02122641697",
 *   "genero": "masculino",
 *   "fecha_nacimiento": "27-11-2004",
 *   "fecha_ingreso": "22-03-2021",
 *   "dedicacion": "Convencional",
 *   "categoria": "Instructor",
 *   "area_de_conocimiento": "Inteligencia Artificial",
 *   "pre_grado": "Ingeniería en Sistemas",
 *   "pos_grado": "Doctorado en Ciencias de la Computación",
 *   "ubicacion": "Núcleo de Tegnología y Ciencias Administrativas"
 * }
 */
profesorRouter.post(
  "/Profesor/register",
  middlewareAuth([
    'SuperAdmin',
    'Vicerrector',
    'Director General de Gestión Curricular'
  ]),
  registrarProfesor
);

/**
 * @name POST /Profesor/search
 * @description Busca profesores por cédula, nombre o apellido
 * @query {string} busqueda - Término de búsqueda (cédula o nombre)
 * @middleware Requiere uno de estos roles:
 *   - SuperAdmin
 *   - Vicerrector
 *   - Director General de Gestión Curricular
 *   - Coordinador
 * @example
 * // Ejemplo de body JSON:
 * {
 *   "busqueda": "3124460"
 * }
 */
profesorRouter.post(
  "/Profesor/search",
  middlewareAuth([
    'SuperAdmin',
    'Vicerrector',
    'Director General de Gestión Curricular',
    'Coordinador'
  ]),
  buscarProfesor
);

/**
 * @name POST /Profesor/pre-grado
 * @description Registrar el pre-grado de un profesor
 * @body {Object} pre_grado.tipo tipo de pre-grado TSU, Licenciatura, etc
 * @body {Object} pre_grado.nombre Nombre de pre-grado Informatica, Ciencias Administrativas, etc.
 * @middleware Requiere uno de estos roles:
 *   - SuperAdmin
 *   - Vicerrector
 *   - Director General de Gestión Curricular
 *   - Coordinador
 * @example
 * // Ejemplo de body JSON:
 * {
 *    tipo: "TSU",
 *    nombre: "En informática"
 * }
 */
profesorRouter.post(
  "/Profesor/pre-grado",
  middlewareAuth([
    'SuperAdmin',
    'Vicerrector',
    'Director General de Gestión Curricular',
    'Coordinador'
  ]),
  registerPreGrado
);

/**
 * @name POST /Profesor/post-grado
 * @description Registrar el post-grado de un profesor
 * @body {Object} post_grado.tipo tipo de post-grado Maestria, Doctorado, especializacion, etc.
 * @body {Object} post_grado.nombre Nombre de post-grado IA, TIC, etc.
 * @middleware Requiere uno de estos roles:
 *   - SuperAdmin
 *   - Vicerrector
 *   - Director General de Gestión Curricular
 *   - Coordinador
 * @example
 * // Ejemplo de body JSON:
 * post_grado :{
 *    tipo: "Maestria",
 *    nombre: "En IA"
 * }
 */
profesorRouter.post(
  "/Profesor/post-grado",
  middlewareAuth([
    'SuperAdmin',
    'Vicerrector',
    'Director General de Gestión Curricular',
    'Coordinador'
  ]),
  registerPostGrado
);

/**
 * @name POST /Profesor/areas-conocimiento
 * @description Registrar el areas conocimiento de un profesor
 * @body {Object} area_conocimiento Area conocimiento Matematicas, Contabilidad, etc.
 * @middleware Requiere uno de estos roles:
 *   - SuperAdmin
 *   - Vicerrector
 *   - Director General de Gestión Curricular
 *   - Coordinador
 * @example
 * // Ejemplo de body JSON:
 * area_conocimiento : "Matematicas"
 */
profesorRouter.post(
  "/Profesor/areas-conocimiento",
  middlewareAuth([
    'SuperAdmin',
    'Vicerrector',
    'Director General de Gestión Curricular',
    'Coordinador'
  ]),
  registerAreaConocimiento
);

/**
 * =============================================
 * RUTAS FUTURAS (COMENTADAS)
 * =============================================
 */
// profesorRouter.put('/Profesor?id', actualizarProfesor)