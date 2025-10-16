import FormatResponseController from "../utils/FormatterResponseController.js";
import HorarioService from "../services/horario.service.js";

/**
 * @class HorarioController
 * @description Controlador para gestionar las operaciones relacionadas con horarios académicos
 */
export default class HorarioController {
  /**
   * @name mostrarHorarios
   * @description Obtener todos los horarios registrados
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   * @returns {void}
   */
  static async mostrarHorarios(req, res) {
    try {
      const respuesta = await HorarioService.mostrarHorarios();
      FormatResponseController.respuestaExito(res, respuesta);
    } catch (error) {
      FormatResponseController.respuestaError(res, error);
    }
  }

  /**
   * @name obtenerHorariosPorSeccion
   * @description Obtener horarios por sección específica
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   * @returns {void}
   */
  static async obtenerHorariosPorSeccion(req, res) {
    try {
      const { id_seccion } = req.params;
      const respuesta = await HorarioService.obtenerHorariosPorSeccion(
        parseInt(id_seccion)
      );
      FormatResponseController.respuestaExito(res, respuesta);
    } catch (error) {
      FormatResponseController.respuestaError(res, error);
    }
  }

  /**
   * @name obtenerHorariosPorProfesor
   * @description Obtener horarios por profesor específico
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   * @returns {void}
   */
  static async obtenerHorariosPorProfesor(req, res) {
    try {
      const { id_profesor } = req.params;
      const respuesta = await HorarioService.obtenerHorariosPorProfesor(
        parseInt(id_profesor)
      );
      FormatResponseController.respuestaExito(res, respuesta);
    } catch (error) {
      FormatResponseController.respuestaError(res, error);
    }
  }

  /**
   * @name obtenerHorariosPorAula
   * @description Obtener horarios por aula específica
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   * @returns {void}
   */
  static async obtenerHorariosPorAula(req, res) {
    try {
      const { id_aula } = req.params;
      const respuesta = await HorarioService.obtenerHorariosPorAula(
        parseInt(id_aula)
      );
      FormatResponseController.respuestaExito(res, respuesta);
    } catch (error) {
      FormatResponseController.respuestaError(res, error);
    }
  }

  /**
   * @name mostrarHorariosProfesores
   * @description Ver los horarios asignados a los profesores
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   * @returns {void}
   */
  static async mostrarHorariosProfesores(req, res) {
    try {
      const idProfesor = req.query.Profesor;
      const respuesta = await HorarioService.mostrarHorariosProfesores(
        idProfesor
      );
      FormatResponseController.respuestaExito(res, respuesta);
    } catch (error) {
      FormatResponseController.respuestaError(res, error);
    }
  }

  /**
   * @name mostrarAulasParaHorario
   * @description Obtener información de aulas disponibles para la creación de un nuevo horario
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   * @returns {void}
   */
  static async mostrarAulasParaHorario(req, res) {
    try {
      const nombrePNF = req.query.pnf;
      const respuesta = await HorarioService.mostrarAulasParaHorario(nombrePNF);
      FormatResponseController.respuestaExito(res, respuesta);
    } catch (error) {
      FormatResponseController.respuestaError(res, error);
    }
  }

  /**
   * @name mostrarProfesoresParaHorario
   * @description Obtener información de profesores para la creación de un nuevo horario
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   * @returns {void}
   */
  static async mostrarProfesoresParaHorario(req, res) {
    try {
      const horasNecesarias = req.query.horasNecesarias;
      const respuesta = await HorarioService.mostrarProfesoresParaHorario(
        horasNecesarias
      );
      FormatResponseController.respuestaExito(res, respuesta);
    } catch (error) {
      FormatResponseController.respuestaError(res, error);
    }
  }

  /**
   * @name registrarHorario
   * @description Crear un nuevo horario académico
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   * @returns {void}
   */
  static async registrarHorario(req, res) {
    try {
      const respuesta = await HorarioService.registrarHorario(
        req.body,
        req.user
      );
      FormatResponseController.respuestaExito(res, respuesta);
    } catch (error) {
      FormatResponseController.respuestaError(res, error);
    }
  }

  /**
   * @name actualizarHorario
   * @description Actualizar un horario existente
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   * @returns {void}
   */
  static async actualizarHorario(req, res) {
    try {
      const { id } = req.params;
      const respuesta = await HorarioService.actualizarHorario(
        id,
        req.body,
        req.user
      );
      FormatResponseController.respuestaExito(res, respuesta);
    } catch (error) {
      FormatResponseController.respuestaError(res, error);
    }
  }

  /**
   * @name eliminarHorario
   * @description Eliminar un horario específico
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   * @returns {void}
   */
  static async eliminarHorario(req, res) {
    try {
      const { id } = req.params;
      const respuesta = await HorarioService.eliminarHorario(
        parseInt(id),
        req.user
      );
      FormatResponseController.respuestaExito(res, respuesta);
    } catch (error) {
      FormatResponseController.respuestaError(res, error);
    }
  }

  /**
   * @name exportarHorarioWord
   * @description Exportar horario de una sección específica a Word
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   * @returns {void}
   */
  static async exportarHorarioWord(req, res) {
    try {
      const { id_seccion } = req.params;
      const buffer = await HorarioService.generarDocumentoHorario(
        parseInt(id_seccion)
      );

      res
        .setHeader(
          "Content-Type",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "Content-Disposition",
          `attachment; filename=horario_seccion_${id_seccion}.docx`
        )
        .send(buffer);
    } catch (error) {
      console.error("❌ Error en exportarHorarioWord:", error);
      FormatResponseController.respuestaError(res, {
        status: 500,
        title: "Error del Servidor",
        message: "Error al generar el documento de horario",
        error: error.message,
      });
    }
  }
}
