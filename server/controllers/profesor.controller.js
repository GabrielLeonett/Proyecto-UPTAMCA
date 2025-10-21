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
    return FormatResponseController.manejarServicio(
      res,
      ProfesorService.registrarProfesor(req.body, req.file, req.user)
    );
  }

  /**
   * @name mostrarProfesorAPI
   * @description Obtener listado de profesores en formato API
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   * @returns {void}
   */
  static async mostrarProfesorAPI(req, res) {
    return FormatResponseController.manejarServicio(
      res,
      ProfesorService.obtenerConFiltros(req.query)
    );
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
      const { id } = req.params;
      const respuesta = await ProfesorService.obtenerImagenProfesor(
        id,
        req.query
      );

      console.log( respuesta)
      // Configurar headers para la respuesta de imagen
      res.set({
        "Content-Type": respuesta.mimeType,
        "Content-Length": respuesta.fileSize,
        "Content-Disposition": `inline; filename="${respuesta.fileName}"`,
        "Cache-Control": "public, max-age=86400",
        ETag: `"${respuesta.fileName}-${respuesta.fileSize}"`,
      });

      // Enviar el buffer de la imagen
      res.send(respuesta.data);
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
    return FormatResponseController.manejarServicio(
      res,
      ProfesorService.obtenerTodos(req.query)
    );
  }

  /**
   * @name buscarProfesor
   * @description Buscar profesores según criterios específicos
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   * @returns {void}
   */
  static async buscarProfesor(req, res) {
    return FormatResponseController.manejarServicio(
      res,
      ProfesorService.buscar(req.body)
    );
  }

  /**
   * @name mostrarPreGrados
   * @description Obtener los pre-grados existentes
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   * @returns {void}
   */
  static async mostrarPreGrados(req, res) {
    return FormatResponseController.manejarServicio(
      res,
      ProfesorService.obtenerPregrados()
    );
  }

  /**
   * @name mostrarPosGrados
   * @description Obtener los pos-grados existentes
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   * @returns {void}
   */
  static async mostrarPosGrados(req, res) {
    return FormatResponseController.manejarServicio(
      res,
      ProfesorService.obtenerPosgrados()
    );
  }

  /**
   * @name mostrarAreasConocimiento
   * @description Obtener las áreas de conocimiento existentes
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   * @returns {void}
   */
  static async mostrarAreasConocimiento(req, res) {
    return FormatResponseController.manejarServicio(
      res,
      ProfesorService.obtenerAreasConocimiento()
    );
  }

  /**
   * @name registerPreGrado
   * @description Registrar un nuevo pre-grado
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   * @returns {void}
   */
  static async registerPreGrado(req, res) {
    return FormatResponseController.manejarServicio(
      res,
      ProfesorService.crearPregrado(req.body, req.user)
    );
  }

  /**
   * @name registerPosGrado
   * @description Registrar un nuevo pos-grado
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   * @returns {void}
   */
  static async registerPosGrado(req, res) {
    return FormatResponseController.manejarServicio(
      res,
      ProfesorService.crearPosgrado(req.body, req.user)
    );
  }

  /**
   * @name registerAreaConocimiento
   * @description Registrar una nueva área de conocimiento
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   * @returns {void}
   */
  static async registerAreaConocimiento(req, res) {
    return FormatResponseController.manejarServicio(
      res,
      ProfesorService.crearAreaConocimiento(req.body, req.user)
    );
  }

  /**
   * @name registrarDisponibilidad
   * @description Registrar disponibilidad docente
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   * @returns {void}
   */
  static async registrarDisponibilidad(req, res) {
    return FormatResponseController.manejarServicio(
      res,
      ProfesorService.registrarDisponibilidad(req.params.id, req.body, req.user)
    );
  }

  /**
   * @name actualizarProfesor
   * @description Actualizar información de un profesor
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   * @returns {void}
   */
  static async actualizarProfesor(req, res) {
    return FormatResponseController.manejarServicio(
      res,
      ProfesorService.actualizarProfesor(req.body, req.user)
    );
  }

  /**
   * @name destituirProfesor
   * @description Destituir/eliminar un profesor
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   * @returns {void}
   */
  static async destituirProfesor(req, res) {
    return FormatResponseController.manejarServicio(
      res,
      ProfesorService.destituirProfesor(req.body, req.user)
    );
  }
}
