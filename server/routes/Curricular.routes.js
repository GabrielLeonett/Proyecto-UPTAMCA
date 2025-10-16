import { Router } from "express";
import CurricularController from '../controllers/curricular.controller.js';
import { middlewareAuth } from '../middlewares/auth.js'

const { 
  regitrarPNF, 
  regitrarUnidadCurricular, 
  mostrarPNF, 
  mostrarTrayectos, 
  mostrarSecciones, 
  mostrarUnidadesCurriculares, 
  CrearSecciones, 
  asignacionTurnoSeccion 
} = CurricularController;

/**
 * @module CurricularRouter
 * @description Router de Express para manejar las rutas relacionadas con:
 * - Programas Nacionales de Formación (PNF)
 * - Trayectos académicos
 * - Unidades curriculares
 * - Secciones
 * 
 * Todas las rutas requieren autenticación mediante middlewareAuth y roles específicos.
 */
export const CurricularRouter = Router();

/**
 * =============================================
 * RUTAS DE PROGRAMAS NACIONALES DE FORMACIÓN (PNF)
 * =============================================
 */

/**
 * @name GET /pnf
 * @description Obtiene todos los Programas Nacionales de Formación (PNF) registrados
 * @middleware Requiere autenticación y uno de estos roles:
 *  - SuperAdmin
 *  - Vicerrector
 *  - Director General de Gestión Curricular
 *  - Coordinador
 *  - Profesor
 * @returns {Array} Lista de PNFs con sus datos completos
 */
CurricularRouter.get(
  '/pnf',
  middlewareAuth([
    'SuperAdmin',
    'Vicerrector',
    'Director General de Gestión Curricular',
    'Coordinador',
    'Profesor'
  ]), 
  mostrarPNF
);

/**
 * @name POST /pnf
 * @description Registra un nuevo Programa Nacional de Formación (PNF)
 * @middleware Requiere autenticación y uno de estos roles:
 *  - SuperAdmin
 *  - Vicerrector
 *  - Director General de Gestión Curricular
 * @body {Object} datos - Datos del PNF a registrar
 * @body {string} datos.nombre_pnf - Nombre del PNF (requerido)
 * @body {string} datos.descripcion - Descripción del PNF
 * @body {string} datos.poblacionPNF - Población objetivo
 * @body {string} datos.codigoPNF - Código único del PNF (requerido)
 * @returns {Object} Objeto con mensaje de confirmación
 */
CurricularRouter.post(
  '/pnf',
  middlewareAuth([
    'SuperAdmin',
    'Vicerrector',
    'Director General de Gestión Curricular',
  ]), 
  regitrarPNF
);

/**
 * =============================================
 * RUTAS DE TRAYECTOS
 * =============================================
 */

/**
 * @name GET /pnf/:codigoPNF/trayectos
 * @description Obtiene todos los trayectos académicos de un PNF específico
 * @param {string} codigoPNF - Código del PNF
 * @middleware Requiere autenticación y uno de estos roles:
 *  - SuperAdmin
 *  - Vicerrector
 *  - Director General de Gestión Curricular
 *  - Coordinador
 *  - Profesor
 * @returns {Array} Lista de trayectos académicos
 * @example GET /pnf/INF_101/trayectos
 */
CurricularRouter.get(
  '/pnf/:codigoPNF/trayectos',
  middlewareAuth([
    'SuperAdmin',
    'Vicerrector',
    'Director General de Gestión Curricular',
    'Coordinador',
    'Profesor'
  ]), 
  mostrarTrayectos
);

/**
 * =============================================
 * RUTAS DE UNIDADES CURRICULARES
 * =============================================
 */

/**
 * @name GET /trayectos/:idTrayecto/unidades-curriculares
 * @description Obtiene las unidades curriculares de un trayecto académico específico
 * @param {number} idTrayecto - ID del trayecto a consultar
 * @middleware Requiere autenticación y uno de estos roles:
 *  - SuperAdmin
 *  - Vicerrector
 *  - Director General de Gestión Curricular
 *  - Coordinador
 *  - Profesor
 * @returns {Array} Lista de unidades curriculares
 */
CurricularRouter.get(
  '/trayectos/:idTrayecto/unidades-curriculares',
  middlewareAuth([
    'SuperAdmin',
    'Vicerrector',
    'Director General de Gestión Curricular',
    'Coordinador',
    'Profesor'
  ]),
  mostrarUnidadesCurriculares
);

/**
 * @name POST /trayectos/:idTrayecto/unidades-curriculares
 * @description Registra una nueva Unidad Curricular en un trayecto
 * @param {number} idTrayecto - ID del trayecto
 * @middleware Requiere autenticación y uno de estos roles:
 *  - SuperAdmin
 *  - Vicerrector
 *  - Director General de Gestión Curricular
 * @body {Object} datos - Datos de la unidad curricular
 * @body {string} datos.nombre_unidad - Nombre de la unidad (requerido)
 * @body {string} datos.descripcion_unidad - Descripción de la unidad
 * @body {number} datos.carga_horas_unidad - Carga horaria en horas (requerido)
 * @body {string} datos.codigo_unidad - Código único de la unidad (requerido)
 * @returns {Object} Objeto con mensaje de confirmación
 */
CurricularRouter.post(
  '/trayectos/:idTrayecto/unidades-curriculares',
  middlewareAuth([
    'SuperAdmin',
    'Vicerrector',
    'Director General de Gestión Curricular',
  ]), 
  regitrarUnidadCurricular
);

/**
 * =============================================
 * RUTAS DE SECCIONES
 * =============================================
 */

/**
 * @name GET /trayectos/:idTrayecto/secciones
 * @description Obtiene las secciones de un trayecto académico específico
 * @param {number} idTrayecto - ID del trayecto a consultar
 * @middleware Requiere autenticación y uno de estos roles:
 *  - SuperAdmin
 *  - Vicerrector
 *  - Director General de Gestión Curricular
 *  - Coordinador
 *  - Profesor
 * @returns {Array} Lista de secciones del trayecto
 */
CurricularRouter.get(
  '/trayectos/:idTrayecto/secciones',
  middlewareAuth([
    'SuperAdmin',
    'Vicerrector',
    'Director General de Gestión Curricular',
    'Coordinador',
    'Profesor'
  ]),
  mostrarSecciones
);

/**
 * @name POST /trayectos/:idTrayecto/secciones
 * @description Crea nuevas secciones para un trayecto académico
 * @param {number} idTrayecto - ID del trayecto
 * @middleware Requiere autenticación y uno de estos roles:
 *  - SuperAdmin
 *  - Vicerrector
 *  - Director General de Gestión Curricular
 * @body {Object} datos - Datos para crear las secciones
 * @body {number} datos.cantidadSecciones - Cantidad de secciones a crear
 * @body {string} datos.prefijo - Prefijo para el nombre de las secciones
 * @body {number} datos.capacidadMaxima - Capacidad máxima por sección
 * @returns {Object} Objeto con mensaje de confirmación
 */
CurricularRouter.post(
  '/trayectos/:idTrayecto/secciones',
  middlewareAuth([
    'SuperAdmin',
    'Vicerrector',
    'Director General de Gestión Curricular',
  ]), 
  CrearSecciones
);

/**
 * @name PUT /secciones/:idSeccion/turno
 * @description Asigna un turno a una sección específica
 * @param {number} idSeccion - ID de la sección
 * @middleware Requiere autenticación y uno de estos roles:
 *  - SuperAdmin
 *  - Vicerrector
 *  - Director General de Gestión Curricular
 * @body {Object} datos - Datos para la asignación de turno
 * @body {number} datos.idTurno - ID del turno a asignar (requerido)
 * @returns {Object} Objeto con mensaje de confirmación
 */
CurricularRouter.put(
  '/secciones/:idSeccion/turno',
  middlewareAuth([
    'SuperAdmin',
    'Vicerrector',
    'Director General de Gestión Curricular',
  ]), 
  asignacionTurnoSeccion
);

/**
 * =============================================
 * RUTAS ADICIONALES (COMPATIBILIDAD)
 * =============================================
 */

/**
 * @name GET /secciones
 * @description Obtiene secciones con filtros (mantenimiento de compatibilidad)
 * @query {number} [trayecto] - ID del trayecto para filtrar secciones
 * @middleware Requiere autenticación y uno de estos roles:
 *  - SuperAdmin
 *  - Vicerrector
 *  - Director General de Gestión Curricular
 *  - Coordinador
 *  - Profesor
 * @returns {Array} Lista de secciones filtradas
 */
CurricularRouter.get(
  '/secciones',
  middlewareAuth([
    'SuperAdmin',
    'Vicerrector',
    'Director General de Gestión Curricular',
    'Coordinador',
    'Profesor'
  ]),
  mostrarSecciones
);