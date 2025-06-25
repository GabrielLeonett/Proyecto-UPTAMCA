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
   * @param {number} params.datos.id_seccion - ID de la sección académica
   * @param {number} params.datos.id_profesor - ID del profesor asignado
   * @param {number} params.datos.unidad_curricular_id - ID de la unidad curricular
   * @param {string} params.datos.dia_semana - Día de la semana (Lunes, Martes, etc.)
   * @param {string} params.datos.hora_inicio - Hora de inicio del horario (formato HH:MM)
   * @param {string} params.datos.aula - Aula asignada
   * @param {Object} params.usuario_accion - Información del usuario que realiza la acción
   * @param {number} params.usuario_accion.id - ID del usuario
   * @returns {Promise<Object>} Objeto con el resultado de la operación formateado
   * @throws {Error} Cuando ocurre un error en el registro
   * 
   * @example
   * const resultado = await HorarioModel.registrarHorario({
   *   datos: {
   *     id_seccion: 1,
   *     id_profesor: 5,
   *     unidad_curricular_id: 10,
   *     dia_semana: 'Lunes',
   *     hora_inicio: '08:00',
   *     aula: 'A-201'
   *   },
   *   usuario_accion: { id: 1 }
   * });
   */
  static async registrarHorario({ datos, usuario_accion }) {
    try {
      // Extracción de parámetros del objeto datos
      const { id_seccion, id_profesor, unidad_curricular_id, dia_semana, hora_inicio, aula } = datos;

      // Consulta SQL que llama al procedimiento almacenado
      const query = `CALL public.registrar_horario_completo(?, ?, ?, ?, ?, ?, ?, TRUE, NULL)`;
      
      // Parámetros para el procedimiento almacenado
      const param = [ 
        usuario_accion.id, 
        id_seccion, 
        id_profesor, 
        unidad_curricular_id, 
        dia_semana, 
        hora_inicio, 
        aula 
      ];

      // Ejecución de la consulta
      const { rows } = await db.raw(query, param);

      // Formateo de la respuesta
      const resultado = FormatResponseModel.respuestaPostgres(
        rows, 
        'Horario Registrado exitosamente', 
        'Error al registrar el horario'
      );

      return resultado;
    } catch (error) {
      // Manejo y formateo de errores
      throw FormatResponseModel.respuestaError(
        error, 
        'Error al registrar el horario'
      );
    }
  }
}