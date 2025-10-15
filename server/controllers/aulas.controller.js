import FormatResponseController from "../utils/FormatResponseController.js";
import AulaService from "../services/aula.service.js";

/**
 * @class AulaController
 * @description Controlador para gestionar las operaciones relacionadas con aulas
 */
export default class AulaController {
  /**
   * @name registerAula
   * @description Registrar una nueva aula
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   * @returns {void}
   */
  static async registerAula(req, res) {
    try {
      const respuesta = await AulaService.registrarAula(
        req.body,
        req.user
      );
      FormatResponseController.respuestaExito(res, respuesta);
    } catch (error) {
      FormatResponseController.respuestaError(res, error);
    }
  }

  /**
   * @name mostrarAulas
   * @description Obtener todas las aulas registradas
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   * @returns {void}
   */
  static async mostrarAulas(req, res) {
    try {
      const respuesta = await AulaService.mostrarAulas();
      FormatResponseController.respuestaExito(res, respuesta);
    } catch (error) {
      FormatResponseController.respuestaError(res, error);
    }
  }

  /**
   * @name obtenerAulaPorId
   * @description Obtener una aula específica por ID
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   * @returns {void}
   */
  static async obtenerAulaPorId(req, res) {
    try {
      const { id } = req.params;
      const respuesta = await AulaService.obtenerAulaPorId(
        parseInt(id)
      );
      FormatResponseController.respuestaExito(res, respuesta);
    } catch (error) {
      FormatResponseController.respuestaError(res, error);
    }
  }

  /**
   * @name actualizarAula
   * @description Actualizar una aula existente
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   * @returns {void}
   */
  static async actualizarAula(req, res) {
    try {
      const { id } = req.params;
      const respuesta = await AulaService.actualizarAula(
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
   * @name eliminarAula
   * @description Eliminar una aula específica
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   * @returns {void}
   */
  static async eliminarAula(req, res) {
    try {
      const { id } = req.params;
      const respuesta = await AulaService.eliminarAula(
        parseInt(id),
        req.user
      );
      FormatResponseController.respuestaExito(res, respuesta);
    } catch (error) {
      FormatResponseController.respuestaError(res, error);
    }
  }

  /**
   * @name obtenerAulasPorTipo
   * @description Obtener aulas filtradas por tipo
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   * @returns {void}
   */
  static async obtenerAulasPorTipo(req, res) {
    try {
      const { tipo } = req.params;
      const respuesta = await AulaService.obtenerAulasPorTipo(tipo);
      FormatResponseController.respuestaExito(res, respuesta);
    } catch (error) {
      FormatResponseController.respuestaError(res, error);
    }
  }

  /**
   * @name obtenerAulasPorSede
   * @description Obtener aulas filtradas por sede
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   * @returns {void}
   */
  static async obtenerAulasPorSede(req, res) {
    try {
      const { sede } = req.params;
      const respuesta = await AulaService.obtenerAulasPorSede(sede);
      FormatResponseController.respuestaExito(res, respuesta);
    } catch (error) {
      FormatResponseController.respuestaError(res, error);
    }
  }
}