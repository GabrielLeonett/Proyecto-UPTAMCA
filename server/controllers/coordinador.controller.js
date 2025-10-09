import CoordinadorModel from "../models/coordinador.model.js";
import { validationPartialCoordinador } from "../schemas/CoordinadorSchema.js";
import validationErrors from "../utils/validationsErrors.js";
import FormatResponseController from "../utils/FormatResponseController.js";

/**
 * Controlador para gestionar todas las operaciones relacionadas con coordinadores
 *
 * @class CoordinadorController
 * @description Contiene los métodos para asignar, listar y gestionar coordinadores
 */
export default class CoordinadorController {
  /**
   * Asigna un profesor como coordinador de un PNF
   *
   * @static
   * @async
   * @method asignarCoordinador
   * @param {Object} req - Objeto de solicitud de Express
   * @param {Object} res - Objeto de respuesta de Express
   * @returns {Promise<Object>} Respuesta JSON con el resultado de la operación
   *
   * @throws {400} Si la validación de datos falla
   * @throws {500} Si ocurre un error en el servidor
   *
   * @example
   * // Ejemplo de body requerido:
   * {
   *   "cedula_profesor": 12345678,
   *   "id_pnf": 1
   * }
   */
  static async asignarCoordinador(req, res) {
    try {
      const { cedula_profesor, id_pnf } = req.body;
      const usuario_accion = req.user; // Asumiendo que el usuario viene del middleware de autenticación

      // Validar datos requeridos
      if (!cedula_profesor || !id_pnf) {
        return FormatResponseController.respuestaError(res, {
          status: 400,
          title: "Datos Incompletos",
          message: "Los campos cedula_profesor e id_pnf son requeridos",
          error: {
            cedula_profesor: cedula_profesor ? "Válido" : "Requerido",
            id_pnf: id_pnf ? "Válido" : "Requerido",
          },
        });
      }

      // Validación de datos usando el esquema definido
      const validaciones = validationErrors(
        validationPartialCoordinador({
          cedula_profesor,
          id_pnf,
        })
      );

      if (validaciones !== true) {
        return FormatResponseController.respuestaError(res, {
          status: 400,
          title: "Datos Erroneos",
          message: "Los datos para asignar el coordinador son incorrectos",
          error: validaciones,
        });
      }

      // Asignar coordinador en la base de datos
      const result = await CoordinadorModel.asignarCoordinador({
        cedula_profesor,
        id_pnf,
        usuario_accion,
      });

      FormatResponseController.respuestaExito(res, result);
    } catch (error) {
      console.error("Error en asignarCoordinador:", error);

      // Manejar errores específicos
      if (error.message.includes("ya es coordinador")) {
        return FormatResponseController.respuestaError(res, {
          status: 400,
          title: "Asignación Duplicada",
          message: error.message,
          error: "COORDINADOR_DUPLICADO",
        });
      }

      if (error.message.includes("no existe")) {
        return FormatResponseController.respuestaError(res, {
          status: 404,
          title: "Recurso No Encontrado",
          message: error.message,
          error: "RECURSO_NO_ENCONTRADO",
        });
      }

      FormatResponseController.respuestaError(res, {
        status: 500,
        title: "Error del Servidor",
        message: "Ocurrió un error al asignar el coordinador",
        error: error.message,
      });
    }
  }

  /**
   * Obtiene el listado de todos los coordinadores
   *
   * @static
   * @async
   * @method listarCoordinadores
   * @param {Object} req - Objeto de solicitud de Express
   * @param {Object} res - Objeto de respuesta de Express
   * @returns {Promise<Object>} Respuesta JSON con la lista de coordinadores
   *
   * @throws {500} Si ocurre un error en el servidor
   *
   * @example
   * // Ejemplo de query params opcionales:
   * GET /coordinadores?pnf_id=1&estatus=activo
   */
  static async listarCoordinadores(req, res) {
    try {
      const { pnf_id, estatus } = req.query;

      const filtros = {};
      if (pnf_id) filtros.pnf_id = parseInt(pnf_id);
      if (estatus) filtros.estatus = estatus;

      const result = await CoordinadorModel.listarCoordinadores(filtros);

      FormatResponseController.respuestaExito(res, result);
    } catch (error) {
      console.error("Error en listarCoordinadores:", error);

      FormatResponseController.respuestaError(res, {
        status: 500,
        title: "Error del Servidor",
        message: "Ocurrió un error al obtener los coordinadores",
        error: error.message,
      });
    }
  }

  /**
   * Obtiene los detalles de un coordinador específico
   *
   * @static
   * @async
   * @method obtenerCoordinador
   * @param {Object} req - Objeto de solicitud de Express
   * @param {Object} res - Objeto de respuesta de Express
   * @returns {Promise<Object>} Respuesta JSON con los detalles del coordinador
   *
   * @throws {404} Si el coordinador no existe
   * @throws {500} Si ocurre un error en el servidor
   *
   * @example
   * // Ejemplo de ruta:
   * GET /coordinadores/12345678
   */
  static async obtenerCoordinador(req, res) {
    try {
      const { cedula } = req.params;

      if (!cedula) {
        return FormatResponseController.respuestaError(res, {
          status: 400,
          title: "Datos Incompletos",
          message: "La cédula del coordinador es requerida",
          error: {
            cedula: "Requerido",
          },
        });
      }

      // Buscar coordinador por cédula
      const coordinadores = await CoordinadorModel.listarCoordinadores();

      const coordinador = coordinadores.data.find(
        (coord) => coord.cedula === parseInt(cedula)
      );

      if (!coordinador) {
        return FormatResponseController.respuestaError(res, {
          status: 404,
          title: "Coordinador No Encontrado",
          message: "No se encontró el coordinador con la cédula especificada",
          error: "COORDINADOR_NO_ENCONTRADO",
        });
      }

      FormatResponseController.respuestaExito(res, {
        message: "Coordinador obtenido exitosamente",
        data: coordinador,
      });
    } catch (error) {
      console.error("Error en obtenerCoordinador:", error);

      FormatResponseController.respuestaError(res, {
        status: 500,
        title: "Error del Servidor",
        message: "Ocurrió un error al obtener el coordinador",
        error: error.message,
      });
    }
  }
}
