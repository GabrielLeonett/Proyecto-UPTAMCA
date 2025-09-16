import { Router } from "express";
import CurricularController from '../controllers/CurricularController.js';
import { middlewareAuth } from '../middlewares/auth.js'

const { regitrarPNF, regitrarUnidadCurricular, mostrarPNF, mostrarTrayectos, mostrarSecciones, mostrarUnidadesCurriculares, CrearSecciones, asignacionTurnoSeccion } = CurricularController;

/**
 * @module CurricularRouter
 * @description Router de Express para manejar las rutas relacionadas con:
 * - Programas Nacionales de Formación (PNF)
 * - Trayectos académicos
 * - Unidades curriculares
 * 
 * Todas las rutas requieren autenticación mediante middlewareAuth y roles específicos.
 */
export const CurricularRouter = Router();

/**
 * =============================================
 * SECCIÓN DE RUTAS GET
 * =============================================
 */

/**
 * @name GET /PNF
 * @description Obtiene todos los Programas Nacionales de Formación (PNF) registrados
 * @memberof module:CurricularRouter
 * @function
 * @middleware middlewareAuth - Requiere autenticación y uno de estos roles:
 *  - SuperAdmin
 *  - Vicerrector
 *  - Director General de Gestión Curricular
 *  - Coordinador
 *  - Profesor
 * @returns {Array} Lista de PNFs con sus datos completos
 */
CurricularRouter.get(
    '/PNF',
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
 * @name GET /Trayectos
 * @description Obtiene todos los trayectos académicos registrados
 * @memberof module:CurricularRouter
 * @function
 * @middleware middlewareAuth - Requiere autenticación y uno de estos roles:
 *  - SuperAdmin
 *  - Vicerrector
 *  - Director General de Gestión Curricular
 *  - Coordinador
 *  - Profesor
 * @param {string} PNF Codigo del pnf que se desea obtener los trayecto.
 * @returns {Array} Lista de trayectos académicos
 * @example /Trayectos?PNF=INF_101
 */
CurricularRouter.get(
    '/Trayectos',
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
 * @name GET /Trayecto/Secciones?Trayecto=1
 * @description Obtiene las secciones de un trayecto académico específico
 * @memberof module:CurricularRouter
 * @function
 * @middleware middlewareAuth - Requiere autenticación y uno de estos roles:
 *  - SuperAdmin
 *  - Vicerrector
 *  - Director General de Gestión Curricular
 *  - Coordinador
 *  - Profesor
 * @query {number} Trayecto - ID del trayecto a consultar para traer las secciones
 * @returns {Object} Datos completos del trayecto solicitado
 */
CurricularRouter.get(
    '/Secciones/',
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
 * @name GET /Trayecto/Unidades-Curriculares?Trayecto=1
 * @description Obtiene las unidades curriculares de un trayecto académico específico
 * @memberof module:CurricularRouter
 * @function
 * @middleware middlewareAuth - Requiere autenticación y uno de estos roles:
 *  - SuperAdmin
 *  - Vicerrector
 *  - Director General de Gestión Curricular
 *  - Coordinador
 *  - Profesor
 * @query {number} Trayecto - ID del trayecto a consultar
 * @returns {Object} Datos completos del trayecto solicitado
 */
CurricularRouter.get(
    '/Trayecto/Unidades-Curriculares',
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
 * =============================================
 * SECCIÓN DE RUTAS POST
 * =============================================
 */

/**
 * @name POST /PNF/create
 * @description Registra un nuevo Programa Nacional de Formación (PNF)
 * @memberof module:CurricularRouter
 * @function
 * @middleware middlewareAuth - Requiere autenticación y uno de estos roles:
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
    '/PNF/create',
    middlewareAuth([
        'SuperAdmin',
        'Vicerrector',
        'Director General de Gestión Curricular',
    ]), 
    regitrarPNF
);

/**
 * @name POST /Unidad_Curricular/create
 * @description Registra una nueva Unidad Curricular
 * @memberof module:CurricularRouter
 * @function
 * @middleware middlewareAuth - Requiere autenticación y uno de estos roles:
 *  - SuperAdmin
 *  - Vicerrector
 *  - Director General de Gestión Curricular
 * @body {Object} datos - Datos de la unidad curricular
 * @body {number} datos.id_trayecto - ID del trayecto al que pertenece (requerido)
 * @body {string} datos.nombre_unidad - Nombre de la unidad (requerido)
 * @body {string} datos.descripcion_unidad - Descripción de la unidad
 * @body {number} datos.carga_horas_unidad - Carga horaria en horas (requerido)
 * @body {string} datos.codigo_unidad - Código único de la unidad (requerido)
 * @returns {Object} Objeto con mensaje de confirmación
 */
CurricularRouter.post(
    '/Unidad_Curricular/create',
    middlewareAuth([
        'SuperAdmin',
        'Vicerrector',
        'Director General de Gestión Curricular',
    ]), 
    regitrarUnidadCurricular
);

/**
 * @name POST /Trayecto/create-secciones
 * @description Registra una nueva Unidad Curricular
 * @memberof module:CurricularRouter
 * @function
 * @middleware middlewareAuth - Requiere autenticación y uno de estos roles:
 *  - SuperAdmin
 *  - Vicerrector
 *  - Director General de Gestión Curricular
 * @body {Object} datos - Datos de la unidad curricular
 * @body {number} datos.id_trayecto - ID del trayecto al que pertenece (requerido)
 * @body {string} datos.nombre_unidad - Nombre de la unidad (requerido)
 * @body {string} datos.descripcion_unidad - Descripción de la unidad
 * @body {number} datos.carga_horas_unidad - Carga horaria en horas (requerido)
 * @body {string} datos.codigo_unidad - Código único de la unidad (requerido)
 * @returns {Object} Objeto con mensaje de confirmación
 */
CurricularRouter.post(
    '/Trayecto/:idTrayecto/create-secciones',
    middlewareAuth([
        'SuperAdmin',
        'Vicerrector',
        'Director General de Gestión Curricular',
    ]), 
    CrearSecciones
);

/**
 * @name POST /Secciones
 * @description Registra una nueva Unidad Curricular
 * @memberof module:CurricularRouter
 * @function
 * @middleware middlewareAuth - Requiere autenticación y uno de estos roles:
 *  - SuperAdmin
 *  - Vicerrector
 *  - Director General de Gestión Curricular
 * @body {number} idSeccion - ID del seccion a la que se le asignara turno (requerido)
 * @body {number} idTurno - ID del turno que se desea asignar (requerido)
 * @returns {Object} Objeto con mensaje de confirmación
 */
CurricularRouter.post(
    '/Secciones/asignar-turno',
    middlewareAuth([
        'SuperAdmin',
        'Vicerrector',
        'Director General de Gestión Curricular',
    ]), 
    asignacionTurnoSeccion
);