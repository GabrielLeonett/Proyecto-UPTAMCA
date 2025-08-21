import { validationHorario } from "../schemas/HorarioSchema.js";
import HorarioModel from "../models/HorarioModel.js";
import validationErrors from "../utils/validationsErrors.js";
import FormatResponseController from "../utils/FormatResponseController.js";

/**
 * @class HorarioController
 * @description Controlador para gestionar las operaciones relacionadas con horarios académicos
 *
 * Este controlador maneja:
 * - Validación de datos de entrada
 * - Interacción con el modelo de horarios
 * - Formateo de respuestas HTTP
 */
export default class HorarioController {
  /**
   * @static
   * @async
   * @method mostrarHorarios
   * @description Mostrar los horarios academicos
   * @param {Object} req - Objeto de solicitud de Express
   * @param {Object} res - Objeto de respuesta de Express
   * @throws {400} Si la validación de datos falla
   * @throws {500} Si ocurre un error en el servidor
   */
  static async mostrarHorarios(req, res) {
    try {
      // 1. Registro del horario mediante el modelo
      const respuestaModel = await HorarioModel.mostrarHorarios();

      FormatResponseController.respuestaExito(res, respuestaModel);
    } catch (error) {
      FormatResponseController.respuestaError(res, error);
    }
  }

  /**
   * @static
   * @async
   * @method registrarHorario
   * @description Endpoint para registrar un nuevo horario académico
   *
   * Flujo de operación:
   * 1. Valida los datos de entrada contra el esquema definido
   * 2. Si la validación falla, retorna errores detallados
   * 3. Si la validación es exitosa, delega al modelo el registro
   * 4. Retorna la respuesta adecuada según el resultado
   *
   * @param {Object} req - Objeto de solicitud de Express
   * @param {Object} req.body - Datos del horario a registrar
   * @param {Object} req.user - Información del usuario autenticado
   * @param {Object} res - Objeto de respuesta de Express
   *
   * @returns {Object} Respuesta JSON con:
   * - {boolean} success - Indica si la operación fue exitosa
   * - {string} message - Mensaje descriptivo del resultado
   * - {Object} [data] - Datos adicionales (opcional)
   *
   * @throws {400} Si la validación de datos falla
   * @throws {500} Si ocurre un error en el servidor
   *
   * @example
   * // Petición POST a /api/horarios
   * {
   *   "id_seccion": 1,
   *   "id_profesor": 5,
   *   "unidad_curricular_id": 10,
   *   "dia_semana": "Lunes",
   *   "hora_inicio": "08:00",
   *   "aula": "A-201"
   * }
   */
  static async registrarHorario(req, res) {
    try {
      // 1. Validación de datos de entrada
      const validaciones = validationErrors(
        validationHorario({ input: req.body })
      );

      if (validaciones !== true) {
        FormatResponseController.respuestaError(res, {
          status: 401,
          title: "Datos Erroneos",
          message: "Los datos estan errados",
          error: validaciones,
        });
      }

      // 3. Registro del horario mediante el modelo
      const respuestaModel = await HorarioModel.registrarHorario({
        datos: req.body,
        usuario_accion: req.user,
      });

      FormatResponseController.respuestaExito(res, respuestaModel);
    } catch (error) {
      FormatResponseController.respuestaError(res, error);
    }
  }
}
