import FormatResponseController from "../utils/FormatResponseController.js";
import SedeService from "../services/sede.service.js";

/**
 * @class SedeController
 * @description Controlador para gestionar las operaciones relacionadas con sedes
 */
export default class SedeController {
  /**
   * @name registerSede
   * @description Registrar una nueva sede
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   * @returns {void}
   */
  static async registerSede(req, res) {
    try {
      const respuesta = await SedeService.registrarSede(
        req.body,
        req.user
      );
      FormatResponseController.respuestaExito(res, respuesta);
    } catch (error) {
      FormatResponseController.respuestaError(res, error);
    }
  }

  /**
   * @name mostrarSedes
   * @description Obtener todas las sedes registradas
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   * @returns {void}
   */
  static async mostrarSedes(req, res) {
    try {
      const respuesta = await SedeService.mostrarSedes();
      FormatResponseController.respuestaExito(res, respuesta);
    } catch (error) {
      FormatResponseController.respuestaError(res, error);
    }
  }

  /**
   * @name obtenerSedePorId
   * @description Obtener una sede específica por ID
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   * @returns {void}
   */
  static async obtenerSedePorId(req, res) {
    try {
      const { id } = req.params;
      const respuesta = await SedeService.obtenerSedePorId(
        parseInt(id)
      );
      FormatResponseController.respuestaExito(res, respuesta);
    } catch (error) {
      FormatResponseController.respuestaError(res, error);
    }
  }

  /**
   * @name actualizarSede
   * @description Actualizar una sede existente
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   * @returns {void}
   */
  static async actualizarSede(req, res) {
    try {
      const { id } = req.params;
      const respuesta = await SedeService.actualizarSede(
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
   * @name eliminarSede
   * @description Eliminar una sede específica
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   * @returns {void}
   */
  static async eliminarSede(req, res) {
    try {
      const { id } = req.params;
      const respuesta = await SedeService.eliminarSede(
        parseInt(id),
        req.user
      );
      FormatResponseController.respuestaExito(res, respuesta);
    } catch (error) {
      FormatResponseController.respuestaError(res, error);
    }
  }
}