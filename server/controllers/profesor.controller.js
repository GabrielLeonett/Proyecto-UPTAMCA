import FormatResponseController from "../utils/FormatterResponseController.js";
import ProfesorService from "../services/profesor.service.js";

/**
 * @class ProfesorController
 * @description Controlador para gestionar las operaciones relacionadas con profesores
 */
export default class ProfesorController {
  /**
   * @name registrarProfesor
   * @description Registrar un nuevo profesor en el sistema
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   * @returns {void}
   */
  static async registrarProfesor(req, res) {
    try {
      const respuesta = await ProfesorService.registrarProfesor(
        req.body,
        req.file,
        req.user
      );
      FormatResponseController.respuestaExito(res, respuesta);
    } catch (error) {
      FormatResponseController.respuestaError(res, error);
    }
  }

  /**
   * @name mostrarProfesorAPI
   * @description Obtener listado de profesores en formato API
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   * @returns {void}
   */
  static async mostrarProfesorAPI(req, res) {
    try {
      const respuesta = await ProfesorService.mostrarProfesorAPI(req.query);
      FormatResponseController.respuestaExito(res, respuesta);
    } catch (error) {
      FormatResponseController.respuestaError(res, error);
    }
  }

  /**
   * @name getImageProfesorDirect
   * @description Obtener la imagen de un profesor
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   * @returns {void}
   */
  static async getImageProfesorDirect(req, res) {
    try {
      const { id_profesor } = req.params;
      const respuesta = await ProfesorService.obtenerImagenProfesor(
        parseInt(id_profesor),
        req.query
      );

      // Configurar headers para la respuesta de imagen
      res.set({
        "Content-Type": respuesta.mimeType,
        "Content-Length": respuesta.fileSize,
        "Content-Disposition": `inline; filename="${respuesta.fileName}"`,
        "Cache-Control": "public, max-age=86400",
        ETag: `"${respuesta.fileName}-${respuesta.fileSize}"`,
      });

      // Enviar el buffer de la imagen
      res.send(respuesta.buffer);
    } catch (error) {
      FormatResponseController.respuestaError(res, error);
    }
  }

  /**
   * @name mostrarProfesor
   * @description Obtener listado de profesores para interfaz web
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   * @returns {void}
   */
  static async mostrarProfesor(req, res) {
    try {
      const respuesta = await ProfesorService.mostrarProfesor(req.query);
      FormatResponseController.respuestaExito(res, respuesta);
    } catch (error) {
      FormatResponseController.respuestaError(res, error);
    }
  }

  /**
   * @name buscarProfesor
   * @description Buscar profesores según criterios específicos
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   * @returns {void}
   */
  static async buscarProfesor(req, res) {
    try {
      const respuesta = await ProfesorService.buscarProfesor(req.body);
      FormatResponseController.respuestaExito(res, respuesta);
    } catch (error) {
      FormatResponseController.respuestaError(res, error);
    }
  }

  /**
   * @name mostrarPreGrados
   * @description Obtener los pre-grados existentes
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   * @returns {void}
   */
  static async mostrarPreGrados(req, res) {
    try {
      const respuesta = await ProfesorService.mostrarPreGrados();
      FormatResponseController.respuestaExito(res, respuesta);
    } catch (error) {
      FormatResponseController.respuestaError(res, error);
    }
  }

  /**
   * @name mostrarPosGrados
   * @description Obtener los pos-grados existentes
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   * @returns {void}
   */
  static async mostrarPosGrados(req, res) {
    try {
      const respuesta = await ProfesorService.mostrarPosGrados();
      FormatResponseController.respuestaExito(res, respuesta);
    } catch (error) {
      FormatResponseController.respuestaError(res, error);
    }
  }

  /**
   * @name mostrarAreasConocimiento
   * @description Obtener las áreas de conocimiento existentes
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   * @returns {void}
   */
  static async mostrarAreasConocimiento(req, res) {
    try {
      const respuesta = await ProfesorService.mostrarAreasConocimiento();
      FormatResponseController.respuestaExito(res, respuesta);
    } catch (error) {
      FormatResponseController.respuestaError(res, error);
    }
  }

  /**
   * @name registerPreGrado
   * @description Registrar un nuevo pre-grado
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   * @returns {void}
   */
  static async registerPreGrado(req, res) {
    try {
      const respuesta = await ProfesorService.registrarPreGrado(
        req.body,
        req.user
      );
      FormatResponseController.respuestaExito(res, respuesta);
    } catch (error) {
      FormatResponseController.respuestaError(res, error);
    }
  }

  /**
   * @name registerPosGrado
   * @description Registrar un nuevo pos-grado
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   * @returns {void}
   */
  static async registerPosGrado(req, res) {
    try {
      const respuesta = await ProfesorService.registrarPosGrado(
        req.body,
        req.user
      );
      FormatResponseController.respuestaExito(res, respuesta);
    } catch (error) {
      FormatResponseController.respuestaError(res, error);
    }
  }

  /**
   * @name registerAreaConocimiento
   * @description Registrar una nueva área de conocimiento
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   * @returns {void}
   */
  static async registerAreaConocimiento(req, res) {
    try {
      const respuesta = await ProfesorService.registrarAreaConocimiento(
        req.body,
        req.user
      );
      FormatResponseController.respuestaExito(res, respuesta);
    } catch (error) {
      FormatResponseController.respuestaError(res, error);
    }
  }

  /**
   * @name registrarDisponibilidad
   * @description Registrar disponibilidad docente
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   * @returns {void}
   */
  static async registrarDisponibilidad(req, res) {
    try {
      const respuesta = await ProfesorService.registrarDisponibilidad(
        req.body,
        req.user
      );
      FormatResponseController.respuestaExito(res, respuesta);
    } catch (error) {
      FormatResponseController.respuestaError(res, error);
    }
  }

  /**
   * @name actualizarProfesor
   * @description Actualizar información de un profesor
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   * @returns {void}
   */
  static async actualizarProfesor(req, res) {
    try {
      const respuesta = await ProfesorService.actualizarProfesor(
        req.body,
        req.user
      );
      FormatResponseController.respuestaExito(res, respuesta);
    } catch (error) {
      FormatResponseController.respuestaError(res, error);
    }
  }

  /**
   * @name destituirProfesor
   * @description Destituir/eliminar un profesor
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   * @returns {void}
   */
  static async destituirProfesor(req, res) {
    try {
      const respuesta = await ProfesorService.destituirProfesor(
        req.body,
        req.user
      );
      FormatResponseController.respuestaExito(res, respuesta);
    } catch (error) {
      FormatResponseController.respuestaError(res, error);
    }
  }
}