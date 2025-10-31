import FormatResponseController from "../utils/FormatterResponseController.js";
import CoordinadorService from "../services/coordinador.service.js";

/**
 * @class CoordinadorController
 * @description Controlador para gestionar las operaciones relacionadas con coordinadores
 */
export default class CoordinadorController {
  /**
   * @name asignarCoordinador
   * @description Asigna un profesor como coordinador de un PNF
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   * @returns {void}
   */
  static async asignarCoordinador(req, res) {
    return FormatResponseController.manejarServicio(
      res,
      CoordinadorService.asignarCoordinador(req.body, req.user)
    );
  }

  /**
   * @name listarCoordinadores
   * @description Obtiene el listado de todos los coordinadores
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   * @returns {void}
   */
  static async listarCoordinadores(req, res) {
    return FormatResponseController.manejarServicio(
      res,
      CoordinadorService.listarCoordinadores(req.query)
    );
  }

  /**
   * @name obtenerCoordinador
   * @description Obtiene los detalles de un coordinador específico
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   * @returns {void}
   */
  static async obtenerCoordinador(req, res) {
    return FormatResponseController.manejarServicio(
      res,
      CoordinadorService.obtenerCoordinador(parseInt(req.params.cedula))
    );
  }

  /**
   * @name actualizarCoordinador
   * @description Actualiza los datos de un coordinador existente
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   * @returns {void}
   */
  static async actualizarCoordinador(req, res) {
    return FormatResponseController.manejarServicio(
      res,
      CoordinadorService.actualizarCoordinador(parseInt(req.params.id), req.body, req.user)
    );
  }

  /**
   * @name eliminarCoordinador
   * @description Elimina un coordinador (destitución)
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   * @returns {void}
   */
  static async eliminarCoordinador(req, res) {
    return FormatResponseController.manejarServicio(
      res,
      CoordinadorService.eliminarCoordinador(parseInt(req.params.id), req.user)
    );
  }
}