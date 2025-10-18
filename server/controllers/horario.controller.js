import FormatResponseController from "../utils/FormatterResponseController.js";
import HorarioService from "../services/horario.service.js";

/**
 * @class HorarioController
 * @description Controlador para gestionar las operaciones relacionadas con horarios académicos
 */
export default class HorarioController {
  /**
   * @name obtenerHorariosPorSeccion
   * @description Obtener horarios por sección específica
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   * @returns {void}
   */
  static async obtenerHorariosPorSeccion(req, res) {
    return FormatResponseController.manejarServicio(
      res,
      HorarioService.mostrarHorariosPorSeccion(parseInt(req.params.id_seccion))
    );
  }

  /**
   * @name obtenerHorariosPorProfesor
   * @description Obtener horarios por profesor específico
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   * @returns {void}
   */
  static async obtenerHorariosPorProfesor(req, res) {
    return FormatResponseController.manejarServicio(
      res,
      HorarioService.mostrarHorariosProfesores(parseInt(req.params.id_profesor))
    );
  }

  /**
   * @name obtenerHorariosPorAula
   * @description Obtener horarios por aula específica
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   * @returns {void}
   */
  static async obtenerHorariosPorAula(req, res) {
    return FormatResponseController.manejarServicio(
      res,
      HorarioService.mostrarHorariosPorAula(parseInt(req.params.id_aula))
    );
  }
  /**
   * @name mostrarAulasParaHorario
   * @description Obtener información de aulas disponibles para la creación de un nuevo horario
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   * @returns {void}
   */
  static async mostrarAulasParaHorario(req, res) {
    return FormatResponseController.manejarServicio(
      res,
      HorarioService.mostrarAulasParaHorario(req.query.pnf)
    );
  }

  /**
   * @name mostrarProfesoresParaHorario
   * @description Obtener información de profesores para la creación de un nuevo horario
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   * @returns {void}
   */
  static async mostrarProfesoresParaHorario(req, res) {
    return FormatResponseController.manejarServicio(
      res,
      HorarioService.mostrarProfesoresParaHorario(req.query.horasNecesarias)
    );
  }

  /**
   * @name registrarHorario
   * @description Crear un nuevo horario académico
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   * @returns {void}
   */
  static async registrarHorario(req, res) {
    return FormatResponseController.manejarServicio(
      res,
      HorarioService.registrarHorario(req.body, req.user)
    );
  }

  /**
   * @name actualizarHorario
   * @description Actualizar un horario existente
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   * @returns {void}
   */
  static async actualizarHorario(req, res) {
    return FormatResponseController.manejarServicio(
      res,
      HorarioService.actualizarHorario(req.params.id, req.body, req.user)
    );
  }

  /**
   * @name eliminarHorario
   * @description Eliminar un horario específico
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   * @returns {void}
   */
  static async eliminarHorario(req, res) {
    return FormatResponseController.manejarServicio(
      res,
      HorarioService.eliminarHorario(parseInt(req.params.id), req.user)
    );
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

      // Configurar headers para descarga de Word
      res.set({
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename=horario_seccion_${id_seccion}.docx`,
        "Content-Length": buffer.length
      });

      res.send(buffer);
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