import { validationUser } from "../schemas/UserSchema.js";
import { validationProfesor } from "../schemas/ProfesorSchema.js";
import ProfesorModel from '../models/Profesorkjasfjasñklj.js';

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
      // Validación de datos del profesor usando el esquema definido
      const validationResultProfesor = validationProfesor({ input: req.body });
      if (!validationResultProfesor.success) {
        const errores = validationResultProfesor.error.errors.map(error => error.message);
        FormatResponseController.respuestaError(res, {status: 400, errores});
        return;
      }

      // Validación de datos de usuario asociado al profesor
      const validationResultUser = validationUser({ input: req.body });
      if (!validationResultUser.success) {
        const errores = validationResultUser.error.errors.map(error => error.message);
        FormatResponseController.respuestaError(res, {status: 400, errores});
        return;
      }
      
      // Registrar profesor en la base de datos
      const result = await ProfesorModel.RegisterProfesor({
        datos: req.body,
        usuario_accion: req.user // Usuario que realiza la acción
      });

      return res.status(result.status).json(result);
      
    } catch (error) {
      // Manejo de errores inesperados
      return res.status(error.status || 500).json(error);
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
      const result = await ProfesorModel.mostrarProfesorAPI({datos: req.query});

      res.status(200).json({
        success: true,
        data: result,
      });

    } catch (error) {
      console.error('Error al obtener profesores:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener la lista de profesores',
        error: error.message
      });
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
      const result = await ProfesorModel.mostrarProfesor({datos: req.query});

      res.status(200).json({
        success: true,
        data: result,
      });

    } catch (error) {
      console.error('Error al obtener profesores:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener la lista de profesores',
        error: error.message
      });
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
  static async buscarProfesor(req, res){
    try {
      const result = await ProfesorModel.buscarProfesor({datos: req.query});

      res.status(200).json({
        success: true,
        data: result,
      });

    } catch (error) {
      console.error('Error al obtener profesores:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener la lista de profesores',
        error: error.message
      });
    }
  }
}