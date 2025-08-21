// Importación de la conexión a la base de datos
import db from "../db.js";

// Importación de clase para formateo de respuestas
import FormatResponseModel from '../utils/FormatResponseModel.js'

/**
 * @class HorarioModel
 * @description Modelo para gestionar las operaciones relacionadas con horarios académicos
 * @method registrarHorario - Registra un nuevo horario en la base de datos
 */
export default class HorarioModel {
  /**
   * @static
   * @async
   * @method registrarHorario
   * @description Registra un nuevo horario académico llamando a un procedimiento almacenado
   * @param {Object} params - Objeto con parámetros de registro
   * @param {Object} params.datos - Datos del horario a registrar
   * @param {number} params.datos.idSeccion - ID de la sección académica
   * @param {number} params.datos.idProfesor - ID del profesor asignado
   * @param {number} params.datos.idUnidadCurricular - ID de la unidad curricular
   * @param {string} params.datos.diaSemana - Día de la semana (Lunes, Martes, etc.)
   * @param {string} params.datos.horaInicio - Hora de inicio del horario (formato HH:MM)
   * @param {number} params.datos.idAula - Aula asignada
   * @param {Object} params.usuario_accion - Información del usuario que realiza la acción
   * @param {number} params.usuario_accion.id - ID del usuario
   * @returns {Promise<Object>} Objeto con el resultado de la operación formateado
   * @throws {Error} Cuando ocurre un error en el registro
   * 
   * @example
   * const resultado = await HorarioModel.registrarHorario({
   *   datos: {
   *     idSeccion: 1,
   *     idProfesor: 5,
   *     idUnidadCurricular: 10,
   *     diaSemana: 'Lunes',
   *     horaInicio: '08:00',
   *     idAula: 1
   *   },
   *   usuario_accion: { id: 1 }
   * });
   */
  static async registrarHorario({ datos, usuario_accion }) {
    try {
      // Extracción de parámetros del objeto datos
      const { idSeccion, idProfesor, idUnidadCurricular, diaSemana, horaInicio, idAula}= datos;

      // Consulta SQL que llama al procedimiento almacenado
      const query = `CALL public.registrar_horario_completo(?, ?, ?, ?, ?, ?, ?, TRUE, NULL)`;
      
      // Parámetros para el procedimiento almacenado
      const param = [ 
        usuario_accion.id, 
        idSeccion, 
        idProfesor, 
        idUnidadCurricular, 
        idAula, 
        diaSemana, 
        horaInicio,
      ];

      // Ejecución de la consulta
      const { rows } = await db.raw(query, param);

      // Formateo de la respuesta
      const resultado = FormatResponseModel.respuestaPostgres(rows, 'Horario Registrado exitosamente');

      return resultado;
    } catch (error) {
      // Manejo y formateo de errores
      error.details = {
        path: 'HorarioModel.registrarHorario'
      }
      throw FormatResponseModel.respuestaError(error, 'Error al registrar el horario');
    }
  }

  /**
   * @static
   * @async
   * @method mostrarHorarios
   * @description mostrar los horarios academicos
   * @returns {Promise<Object>} Objeto con el resultado de la operación formateado
   * @throws {Error} Cuando ocurre un error en el registro
   */
  static async mostrarHorarios() {
    try {
      // Consulta SQL que llama a la vista horarios_completos
      const query = `SELECT * FROM public.horarios_completos`;

      // Ejecución de la consulta
      const { rows } = await db.raw(query);

      // Formateo de la respuesta
      const resultado = FormatResponseModel.respuestaPostgres(rows, 'Horario Registrado exitosamente');

      return resultado;
    } catch (error) {
      // Manejo y formateo de errores
      error.details = {
        path: 'HorarioModel.registrarHorario'
      }
      throw FormatResponseModel.respuestaError(error, 'Error al registrar el horario');
    }
  }
}