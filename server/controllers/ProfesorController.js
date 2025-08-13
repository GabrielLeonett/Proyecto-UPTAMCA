import { validationProfesor } from "../schemas/ProfesorSchema.js";
import ProfesorModel from "../models/ProfesorModel.js";
import validationErrors from "../utils/validationsErrors.js";
import FormatResponseController from "../utils/FormatResponseController.js";

/**
 * Controlador para gestionar todas las operaciones relacionadas con profesores
 *
 * @class ProfesorController
 * @description Contiene los métodos para registrar, mostrar y buscar profesores
 */
export default class ProfesorController {
  /**
   * Registra un nuevo profesor en el sistema
   *
   * @static
   * @async
   * @method registrarProfesor
   * @param {Object} req - Objeto de solicitud de Express
   * @param {Object} res - Objeto de respuesta de Express
   * @returns {Promise<Object>} Respuesta JSON con el resultado de la operación
   *
   * @throws {400} Si la validación de datos falla
   * @throws {500} Si ocurre un error en el servidor
   *
   * @example
   * // Ejemplo de body requerido:
   * {
   *   "nombres": "Nombre",
   *   "apellidos": "Apellido",
   *   // ...otros campos del profesor
   * }
   */
  static async registrarProfesor(req, res) {
    try {

      const input = {...req.body};
      // Validación de datos del profesor usando el esquema definido
      let validaciones = validationErrors(validationProfesor(input));

      if (validaciones !== true) {
        FormatResponseController.respuestaError(res, {
          status: 401,
          title: "Datos Erroneos",
          message: "Los datos estan errados",
          error: validaciones,
        });
        return
      }

      // Registrar profesor en la base de datos
      const result = await ProfesorModel.RegisterProfesor({
        datos: req.body,
        usuario_accion: req.user, // Usuario que realiza la acción
      });

      FormatResponseController.respuestaExito(res, result);
    } catch (error) {
      // Manejo de errores inesperados
      FormatResponseController.respuestaError(res, error);
    }
  }

  /**
   * Obtiene el listado de profesores en formato API (para consumo programático)
   *
   * @static
   * @async
   * @method mostrarProfesorAPI
   * @param {Object} req - Objeto de solicitud de Express
   * @param {Object} res - Objeto de respuesta de Express
   * @returns {Promise<Object>} Listado de profesores con metadatos
   *
   * @throws {500} Si ocurre un error al consultar la base de datos
   *
   * @example
   * // Ejemplo de query params:
   * /api/Profesor?categoria=Instructor&genero=masculino
   */
  static async mostrarProfesorAPI(req, res) {
    try {
      const result = await ProfesorModel.mostrarProfesorAPI({
        datos: req.query,
      });

      FormatResponseController.respuestaDatos(res, result, {
        timestamp: Date.now,
      });
    } catch (error) {
      FormatResponseController.respuestaError(res, error);
    }
  }

  /**
   * Obtiene el listado de profesores para visualización en interfaz web
   *
   * @static
   * @async
   * @method mostrarProfesor
   * @param {Object} req - Objeto de solicitud de Express
   * @param {Object} res - Objeto de respuesta de Express
   * @returns {Promise<Object>} Datos formateados para vista web
   *
   * @throws {500} Si ocurre un error al consultar la base de datos
   */
  static async mostrarProfesor(req, res) {
    try {
      const result = await ProfesorModel.mostrarProfesor({ datos: req.query });

      FormatResponseController.respuestaDatos(res, result, {
        timestamp: Date.now,
      });
    } catch (error) {
      FormatResponseController.respuestaError(res, error);
    }
  }

  /**
   * Busca profesores según criterios específicos
   *
   * @static
   * @async
   * @method buscarProfesor
   * @param {Object} req - Objeto de solicitud de Express
   * @param {Object} res - Objeto de respuesta de Express
   * @returns {Promise<Object>} Resultados de la búsqueda
   *
   * @throws {500} Si ocurre un error en la búsqueda
   *
   * @example
   * // Ejemplo de query params:
   * /Profesor/search?busqueda=3124460
   */
  static async buscarProfesor(req, res) {
    try {
      const result = await ProfesorModel.buscarProfesor({ datos: req.body });

      FormatResponseController.respuestaDatos(res, result, {
        timestamp: Date.now,
      });
    } catch (error) {
      FormatResponseController.respuestaError(res, error);
    }
  }

  /**
   * Mostrar los pre-grados existentes
   *
   * @static
   * @async
   * @method mostrarPreGrados
   * @param {Object} req - Objeto de solicitud de Express
   * @param {string} req.param.tipo - el tipo de pre-grado que desea buscar
   * @param {Object} res - Objeto de respuesta de Express
   * @returns {Promise<Object>} Resultados de la búsqueda
   *
   * @throws {500} Si ocurre un error en la búsqueda
   *
   * @example
   * // Ejemplo de query params:
   * /Profesor/pre-grado?tipo=TSU
   */
  static async mostrarPreGrados(req, res) {
    try {
      const result =  await ProfesorModel.mostrarPreGrados();
      FormatResponseController.respuestaDatos(res, result)
    } catch (error) {
      FormatResponseController.respuestaError(res, error)
    }
  }

  /**
   * Mostrar los pos-grados existentes
   *
   * @static
   * @async
   * @method mostrarPosGrados
   * @param {Object} req - Objeto de solicitud de Express
   * @param {string} req.param.tipo - el tipo de pos-grado que desea buscar
   * @param {Object} res - Objeto de respuesta de Express
   * @returns {Promise<Object>} Resultados de la búsqueda
   *
   * @throws {500} Si ocurre un error en la búsqueda
   *
   * @example
   * // Ejemplo de query params:
   * /Profesor/pos-grado?tipo=Maestría
   */
  static async mostrarPosGrados(req, res) {
    try {
      const result =  await ProfesorModel.mostrarPosGrados();
      FormatResponseController.respuestaDatos(res, result)
    } catch (error) {
      FormatResponseController.respuestaError(res, error)
    }
  }

  /**
   * Buscar las areas de conocimiento existentes
   *
   * @static
   * @async
   * @method mostrarAreasConocimiento
   * @param {Object} req - Objeto de solicitud de Express
   * @param {Object} res - Objeto de respuesta de Express
   * @returns {Promise<Object>} Resultados de la búsqueda
   *
   * @throws {500} Si ocurre un error en la búsqueda
   *
   * @example
   * // Ejemplo de query params:
   * /Profesor/areas-conocimiento
   */
  static async mostrarAreasConocimiento(req, res) {
    try {
      const result =  await ProfesorModel.mostrarAreasConocimiento();
      FormatResponseController.respuestaDatos(res, result)
    } catch (error) {
      FormatResponseController.respuestaError(res, error)
    }
  }

  /**
   * Registrar un Pre-Grado 
   *
   * @static
   * @async
   * @method registerPreGrado
   * @param {Object} req.body.tipo - Tipo de pre-grado que se desea registrar 
   * @param {Object} req.body.nombre - Nombre del pre-grado que se desea registrar 
   * @param {Object} res - Objeto de respuesta de Express
   * @returns {Promise<Object>} Resultados de la búsqueda
   *
   * @throws {500} Si ocurre un error en la búsqueda
   *
   * @example
   * // Ejemplo del body:
   * {
   *  tipo: "TSU",
   *  Nombre: "en Imformática"
   * }
   */
  static async registerPreGrado(req, res) {
    try {
      const result = await ProfesorModel.registerPreGrado({usuario_accion: req.user, datos:req.body})
      FormatResponseController.respuestaExito(res, result);
    } catch (error) {
      // Manejo de errores inesperados
      FormatResponseController.respuestaError(res, error);
    }
  }

  /**
   * Registrar un Pos-Grado
   *
   * @static
   * @async
   * @method registerPosGrado
   * @param {Object} req.body.tipo - Tipo de pos-grado que se desea registrar 
   * @param {Object} req.body.nombre - Nombre del pos-grado que se desea registrar 
   * @param {Object} res - Objeto de respuesta de Express
   * @returns {Promise<Object>} Resultados de la búsqueda
   *
   * @throws {500} Si ocurre un error en la búsqueda
   *
   * @example
   * // Ejemplo del body:
   * {
   *  tipo: "Doctorardo",
   *  Nombre: "en IA"
   * }
   */
  static async registerPosGrado(req, res) {
    try {
      const result = await ProfesorModel.registerPosGrado({usuario_accion: req.user, datos:req.body})
      FormatResponseController.respuestaExito(res, result);
    } catch (error) {
      console.log(error)
      // Manejo de errores inesperados
      FormatResponseController.respuestaError(res, error);
    }
  }

  /**
   * Registrar una area de conocimiento de docentes
   *
   * @static
   * @async
   * @method registerAreaConocimiento
   * @param {Object} req.body.area_conocimiento - Nombre de un area conocimiento que se desea registrar 
   * @param {Object} res - Objeto de respuesta de Express
   * @returns {Promise<Object>} Resultados de la búsqueda
   *
   * @throws {500} Si ocurre un error en la búsqueda
   *
   * @example
   * // Ejemplo de body:
   * {
   *  area_conocimiento: "Matematicas"
   * }
   */
  static async registerAreaConocimiento(req, res) {
    try {
      const result = await ProfesorModel.registerAreaConocimiento({usuario_accion: req.user, datos:req.body})
      FormatResponseController.respuestaExito(res, result);
    } catch (error) {
      console.log(error)
      // Manejo de errores inesperados
      FormatResponseController.respuestaError(res, error);
    }
  }
}
