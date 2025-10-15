import FormatResponseController from "../utils/FormatResponseController.js";
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
    try {
      const respuesta = await CoordinadorService.asignarCoordinador(
        req.body,
        req.user
      );
      FormatResponseController.respuestaExito(res, respuesta);
    } catch (error) {
      FormatResponseController.respuestaError(res, error);
    }
  }

  /**
   * @name listarCoordinadores
   * @description Obtiene el listado de todos los coordinadores
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   * @returns {void}
   */
  static async listarCoordinadores(req, res) {
    try {
      const respuesta = await CoordinadorService.listarCoordinadores(req.query);
      FormatResponseController.respuestaExito(res, respuesta);
    } catch (error) {
      FormatResponseController.respuestaError(res, error);
    }
  }

  /**
   * @name obtenerCoordinador
   * @description Obtiene los detalles de un coordinador específico
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   * @returns {void}
   */
  static async obtenerCoordinador(req, res) {
    try {
      const { cedula } = req.params;
      const respuesta = await CoordinadorService.obtenerCoordinador(
        parseInt(cedula)
      );
      FormatResponseController.respuestaExito(res, respuesta);
    } catch (error) {
      FormatResponseController.respuestaError(res, error);
    }
  }

  /**
   * @name actualizarCoordinador
   * @description Actualiza los datos de un coordinador existente
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   * @returns {void}
   */
  static async actualizarCoordinador(req, res) {
    try {
      const { id } = req.params;
      const respuesta = await CoordinadorService.actualizarCoordinador(
        parseInt(id),
        req.body,
        req.user
      );
      FormatResponseController.respuestaExito(res, respuesta);
    } catch (error) {
      FormatResponseController.respuestaError(res, error);
    }
  }

  /**
   * @name eliminarCoordinador
   * @description Elimina un coordinador (destitución)
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   * @returns {void}
   */
  static async eliminarCoordinador(req, res) {
    try {
      const { id } = req.params;
      const respuesta = await CoordinadorService.eliminarCoordinador(
        parseInt(id),
        req.user
      );
      FormatResponseController.respuestaExito(res, respuesta);
    } catch (error) {
      FormatResponseController.respuestaError(res, error);
    }
  }
}