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
      CurricularService.registrarUnidadCurricular(
        req.params.idTrayecto,
        req.body,
        req.user
      )
    );
  }

  /**
   * @name actualizarPNF
   * @description Actualizar un Programa Nacional de Formación (PNF) existente
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   * @returns {void}
   */
  static async actualizarPNF(req, res) {
    const idPNF = parseInt(req.params.idPNF);

    return FormatResponseController.manejarServicio(
      res,
      CurricularService.actualizarPNF(idPNF, req.body, req.user)
    );
  }

  /**
   * @name actualizarDescripcionTrayecto
   * @description Actualizar la descripción de un trayecto específico
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   * @returns {void}
   */
  static async actualizarDescripcionTrayecto(req, res) {
    const idTrayecto = parseInt(req.params.idTrayecto);

    return FormatResponseController.manejarServicio(
      res,
      CurricularService.actualizarDescripcionTrayecto(
        idTrayecto,
        req.body,
        req.user
      )
    );
  }

  /**
   * @name actualizarUnidadCurricular
   * @description Actualizar una Unidad Curricular existente (parcial o completamente)
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   * @returns {void}
   */
  static async actualizarUnidadCurricular(req, res) {
    const idUnidadCurricular = parseInt(req.params.idUnidadCurricular);

    return FormatResponseController.manejarServicio(
      res,
      CurricularService.actualizarUnidadCurricular(
        idUnidadCurricular,
        req.body,
        req.user
      )
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
      CurricularService.mostrarTrayectos(req.params.codigoPNF)
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
    const trayecto = req.params.idTrayecto
      ? Number(req.params.idTrayecto)
      : null;
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
    const trayecto = req.params.idTrayecto
      ? Number(req.params.idTrayecto)
      : null;
    return FormatResponseController.manejarServicio(
      res,
      CurricularService.mostrarSecciones(trayecto)
    );
  }

  /**
   * @name mostrarSeccionesByPnfAndValueTrayecto
   * @description Obtener todas las secciones de un trayecto específico de un PNF
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   * @returns {void}
   */
  static async mostrarSeccionesByPnfAndValueTrayecto(req, res) {
    try {
      const { codigoPNF, valorTrayecto } = req.params;

      // Validar parámetros requeridos
      if (!codigoPNF || !valorTrayecto) {
        return res.status(400).json({
          success: false,
          message: "Los parámetros codigoPNF y valorTrayecto son requeridos",
          data: null,
        });
      }

      console.log("🔍 [Controlador] Obteniendo secciones...", {
        codigoPNF,
        valorTrayecto,
      });

      return FormatResponseController.manejarServicio(
        res,
        CurricularService.mostrarSeccionesByPnfAndValueTrayecto(
          codigoPNF,
          valorTrayecto
        )
      );
    } catch (error) {
      console.error("💥 Error en controlador mostrar secciones:", error);
      return res.status(500).json({
        success: false,
        message: "Error interno del servidor",
        data: null,
      });
    }
  }

  /**
   * @name mostrarSeccionesByPnfAndValueUnidadCurricular
   * @description Obtener todas las unidades curriculares de un trayecto específico de un PNF
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   * @returns {void}
   */
  static async mostrarSeccionesByPnfAndValueUnidadCurricular(req, res) {
    try {
      const { codigoPNF, valorTrayecto } = req.params;

      // Validar parámetros requeridos
      if (!codigoPNF || !valorTrayecto) {
        return res.status(400).json({
          success: false,
          message: "Los parámetros codigoPNF y valorTrayecto son requeridos",
          data: null,
        });
      }

      console.log("🔍 [Controlador] Obteniendo secciones...", {
        codigoPNF,
        valorTrayecto,
      });

      return FormatResponseController.manejarServicio(
        res,
        CurricularService.mostrarSeccionesByPnfAndValueUnidadCurricular(
          codigoPNF,
          valorTrayecto
        )
      );
    } catch (error) {
      console.error("💥 Error en controlador mostrar secciones:", error);
      return res.status(500).json({
        success: false,
        message: "Error interno del servidor",
        data: null,
      });
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
    return FormatResponseController.manejarServicio(
      res,
      CurricularService.crearSecciones(
        parseInt(req.params.idTrayecto),
        req.body,
        req.user
      )
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
      CurricularService.asignarTurnoSeccion(
        req.params.idSeccion,
        req.body,
        req.user
      )
    );
  }
}
