import FormatResponseController from "../utils/FormatterResponseController.js";
import CurricularService from "../services/curricular.service.js";

/**
 * @class CurricularController
 * @description Controlador para gestionar las operaciones relacionadas con:
 * - Programas Nacionales de Formación (PNF)
 * - Unidades Curriculares
 * - Trayectos académicos
 * - Secciones
 */
export default class CurricularController {
  /**
   * @name regitrarPNF
   * @description Registrar un nuevo Programa Nacional de Formación (PNF)
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   * @returns {void}
   */
  static async regitrarPNF(req, res) {
    return FormatResponseController.manejarServicio(
      res,
      CurricularService.registrarPNF(req.body, req.user)
    );
  }

  /**
   * @name regitrarUnidadCurricular
   * @description Registrar una nueva Unidad Curricular
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   * @returns {void}
   */
  static async regitrarUnidadCurricular(req, res) {
    return FormatResponseController.manejarServicio(
      res,
      CurricularService.registrarUnidadCurricular(req.body, req.user)
    );
  }

  /**
   * @name mostrarPNF
   * @description Obtener todos los Programas Nacionales de Formación registrados
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   * @returns {void}
   */
  static async mostrarPNF(req, res) {
    return FormatResponseController.manejarServicio(
      res,
      CurricularService.mostrarPNF()
    );
  }

  /**
   * @name mostrarTrayectos
   * @description Obtener todos los trayectos académicos registrados
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   * @returns {void}
   */
  static async mostrarTrayectos(req, res) {
    return FormatResponseController.manejarServicio(
      res,
      CurricularService.mostrarTrayectos(req.query.PNF)
    );
  }

  /**
   * @name mostrarUnidadesCurriculares
   * @description Obtener todas las unidades curriculares de un trayecto
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   * @returns {void}
   */
  static async mostrarUnidadesCurriculares(req, res) {
    const trayecto = req.query.Trayecto ? Number(req.query.Trayecto) : null;
    return FormatResponseController.manejarServicio(
      res,
      CurricularService.mostrarUnidadesCurriculares(trayecto)
    );
  }

  /**
   * @name mostrarSecciones
   * @description Obtener todas las secciones de un trayecto
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   * @returns {void}
   */
  static async mostrarSecciones(req, res) {
    const trayecto = req.query.Trayecto ? Number(req.query.Trayecto) : null;
    return FormatResponseController.manejarServicio(
      res,
      CurricularService.mostrarSecciones(trayecto)
    );
  }

  /**
   * @name CrearSecciones
   * @description Crear secciones para un trayecto de forma automática
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   * @returns {void}
   */
  static async CrearSecciones(req, res) {
    return FormatResponseController.manejarServicio(
      res,
      CurricularService.crearSecciones(parseInt(req.params.idTrayecto), req.body, req.user)
    );
  }

  /**
   * @name asignacionTurnoSeccion
   * @description Asignar un turno a una sección específica
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   * @returns {void}
   */
  static async asignacionTurnoSeccion(req, res) {
    return FormatResponseController.manejarServicio(
      res,
      CurricularService.asignarTurnoSeccion(req.body, req.user)
    );
  }
}