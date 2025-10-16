import FormatResponseController from "../utils/FormatterResponseController.js";

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
    try {
      const respuesta = await CurricularService.registrarPNF(
        req.body,
        req.user
      );
      FormatResponseController.respuestaExito(res, respuesta);
    } catch (error) {
      FormatResponseController.respuestaError(res, error);
    }
  }

  /**
   * @name regitrarUnidadCurricular
   * @description Registrar una nueva Unidad Curricular
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   * @returns {void}
   */
  static async regitrarUnidadCurricular(req, res) {
    try {
      const respuesta = await CurricularService.registrarUnidadCurricular(
        req.body,
        req.user
      );
      FormatResponseController.respuestaExito(res, respuesta);
    } catch (error) {
      FormatResponseController.respuestaError(res, error);
    }
  }

  /**
   * @name mostrarPNF
   * @description Obtener todos los Programas Nacionales de Formación registrados
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   * @returns {void}
   */
  static async mostrarPNF(req, res) {
    try {
      const respuesta = await CurricularService.mostrarPNF();
      FormatResponseController.respuestaExito(res, respuesta);
    } catch (error) {
      FormatResponseController.respuestaError(res, error);
    }
  }

  /**
   * @name mostrarTrayectos
   * @description Obtener todos los trayectos académicos registrados
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   * @returns {void}
   */
  static async mostrarTrayectos(req, res) {
    try {
      const { PNF } = req.query;
      const respuesta = await CurricularService.mostrarTrayectos(PNF);
      FormatResponseController.respuestaExito(res, respuesta);
    } catch (error) {
      FormatResponseController.respuestaError(res, error);
    }
  }

  /**
   * @name mostrarUnidadesCurriculares
   * @description Obtener todas las unidades curriculares de un trayecto
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   * @returns {void}
   */
  static async mostrarUnidadesCurriculares(req, res) {
    try {
      const { Trayecto } = req.query;
      const respuesta = await CurricularService.mostrarUnidadesCurriculares(
        Trayecto ? Number(Trayecto) : null
      );
      FormatResponseController.respuestaExito(res, respuesta);
    } catch (error) {
      FormatResponseController.respuestaError(res, error);
    }
  }

  /**
   * @name mostrarSecciones
   * @description Obtener todas las secciones de un trayecto
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   * @returns {void}
   */
  static async mostrarSecciones(req, res) {
    try {
      const { Trayecto } = req.query;
      const respuesta = await CurricularService.mostrarSecciones(
        Trayecto ? Number(Trayecto) : null
      );
      FormatResponseController.respuestaExito(res, respuesta);
    } catch (error) {
      FormatResponseController.respuestaError(res, error);
    }
  }

  /**
   * @name CrearSecciones
   * @description Crear secciones para un trayecto de forma automática
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   * @returns {void}
   */
  static async CrearSecciones(req, res) {
    try {
      const { idTrayecto } = req.params;
      const respuesta = await CurricularService.crearSecciones(
        parseInt(idTrayecto),
        req.body,
        req.user
      );
      FormatResponseController.respuestaExito(res, respuesta);
    } catch (error) {
      FormatResponseController.respuestaError(res, error);
    }
  }

  /**
   * @name asignacionTurnoSeccion
   * @description Asignar un turno a una sección específica
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   * @returns {void}
   */
  static async asignacionTurnoSeccion(req, res) {
    try {
      const respuesta = await CurricularService.asignarTurnoSeccion(
        req.body,
        req.user
      );
      FormatResponseController.respuestaExito(res, respuesta);
    } catch (error) {
      FormatResponseController.respuestaError(res, error);
    }
  }
}