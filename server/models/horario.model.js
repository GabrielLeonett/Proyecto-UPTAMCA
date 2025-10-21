import pg from "../database/pg.js";
import FormatResponseModel from "../utils/FormatterResponseModel.js";

export default class HorarioModel {
  /**
   * @name obtenerPorProfesor
   * @description Obtener horarios por ID de profesor
   * @param {number} idProfesor - ID del profesor
   * @returns {Object} Respuesta formateada con los horarios del profesor
   */
  static async obtenerPorProfesor(idProfesor) {
    try {
      const { rows } = await pg.query(
        "SELECT * FROM public.clases_completas WHERE id_profesor = $1",
        [idProfesor]
      );
      return FormatResponseModel.respuestaPostgres(
        rows,
        "Horarios obtenidos exitosamente"
      );
    } catch (error) {
      throw FormatResponseModel.respuestaError(
        error,
        "Error al obtener los horarios del profesor"
      );
    }
  }

  /**
   * @name obtenerPorSeccion
   * @description Obtener horarios por ID de sección
   * @param {number} idSeccion - ID de la sección
   * @returns {Object} Respuesta formateada con los horarios de la sección
   */
  static async obtenerPorSeccion(idSeccion) {
    try {
      const { rows } = await pg.query(
        `SELECT 
          id_horario,
          id_profesor,
          nombres_profesor,
          apellidos_profesor,
          id_unidad_curricular,
          nombre_unidad_curricular,
          valor_seccion,
          id_seccion,
          valor_trayecto,
          nombre_pnf,
          nombre_turno,
          turno_hora_inicio,
          turno_hora_fin,
          codigo_aula,
          id_aula,
          hora_inicio,
          hora_fin,
          dia_semana,
          nombre_pnf
         FROM public.clases_completas 
         WHERE id_seccion = $1`,
        [idSeccion]
      );
      return FormatResponseModel.respuestaPostgres(
        rows,
        "Horarios de sección obtenidos exitosamente"
      );
    } catch (error) {
      throw FormatResponseModel.respuestaError(
        error,
        "Error al obtener los horarios de la sección"
      );
    }
  }

  /**
   * @name obtenerPorAula
   * @description Obtener horarios por ID de aula
   * @param {number} idAula - ID del aula
   * @returns {Object} Respuesta formateada con los horarios del aula
   */
  static async obtenerPorAula(idAula) {
    try {
      const { rows } = await pg.query(
        "SELECT * FROM public.clases_completas WHERE id_aula = $1",
        [idAula]
      );
      return FormatResponseModel.respuestaPostgres(
        rows,
        "Horarios de aula obtenidos exitosamente"
      );
    } catch (error) {
      throw FormatResponseModel.respuestaError(
        error,
        "Error al obtener los horarios del aula"
      );
    }
  }

  /**
   * @name obtenerProfesoresDisponibles
   * @description Obtener profesores con horas disponibles
   * @param {string} horasNecesarias - Horas necesarias en formato intervalo
   * @returns {Object} Respuesta formateada con profesores disponibles
   */
  static async obtenerProfesoresDisponibles(horasNecesarias) {
    try {
      const { rows } = await pg.query(
        `SELECT 
          id_profesor, 
          nombres, 
          apellidos, 
          disponibilidad, 
          horas_disponibles, 
          areas_de_conocimiento
         FROM public.profesores_informacion_completa
         WHERE horas_disponibles > ($1 * INTERVAL '45 minutes')`,
        [horasNecesarias]
      );
      return FormatResponseModel.respuestaPostgres(
        rows,
        "Profesores disponibles obtenidos exitosamente"
      );
    } catch (error) {
      throw FormatResponseModel.respuestaError(
        error,
        "Error al obtener profesores disponibles"
      );
    }
  }

  /**
   * @name obtenerAulasDisponibles
   * @description Obtener aulas disponibles por PNF
   * @param {string} nombrePNF - Nombre del PNF
   * @returns {Object} Respuesta formateada con aulas disponibles
   */
  static async obtenerAulasDisponibles(nombrePNF) {
    try {
      const { rows } = await pg.query(
        "SELECT id_aula, codigo_aula FROM public.sedes_completas WHERE nombre_pnf = $1",
        [nombrePNF]
      );
      return FormatResponseModel.respuestaPostgres(
        rows,
        "Aulas disponibles obtenidas exitosamente"
      );
    } catch (error) {
      throw FormatResponseModel.respuestaError(
        error,
        "Error al obtener aulas disponibles"
      );
    }
  }

  /**
   * @name crear
   * @description Crear un nuevo horario
   * @param {Object} datos - Datos del horario
   * @param {number} datos.idSeccion - ID de la sección
   * @param {number} datos.idProfesor - ID del profesor
   * @param {number} datos.idUnidadCurricular - ID de la unidad curricular
   * @param {number} datos.idAula - ID del aula
   * @param {string} datos.diaSemana - Día de la semana
   * @param {string} datos.horaInicio - Hora de inicio
   * @param {number} usuarioId - ID del usuario que realiza la acción
   * @returns {Object} Respuesta formateada del resultado
   */
  static async crear(datos, usuarioId) {
    try {
      const {
        idSeccion,
        idProfesor,
        idUnidadCurricular,
        idAula,
        diaSemana,
        horaInicio,
      } = datos;

      const { rows } = await pg.query(
        "CALL public.registrar_horario_completo($1, $2, $3, $4, $5, $6, $7, TRUE, NULL)",
        [
          usuarioId,
          idSeccion,
          idProfesor,
          idUnidadCurricular,
          idAula,
          diaSemana,
          horaInicio,
        ]
      );
      return FormatResponseModel.respuestaPostgres(
        rows,
        "Horario creado exitosamente"
      );
    } catch (error) {
      throw FormatResponseModel.respuestaError(
        error,
        "Error al crear el horario"
      );
    }
  }

  /**
   * @name actualizar
   * @description Actualizar un horario existente
   * @param {number} idHorario - ID del horario a actualizar
   * @param {Object} datos - Datos actualizados
   * @param {number} usuarioId - ID del usuario que realiza la acción
   * @returns {Object} Respuesta formateada del resultado
   */
  static async actualizar(idHorario, datos, usuarioId) {
    try {
      const { rows } = await pg.query(
        "CALL public.actualizar_horario($1, $2, $3, $4, $5, $6, $7, $8)",
        [
          usuarioId,
          idHorario,
          datos.idSeccion,
          datos.idProfesor,
          datos.idUnidadCurricular,
          datos.idAula,
          datos.diaSemana,
          datos.horaInicio,
        ]
      );
      return FormatResponseModel.respuestaPostgres(
        rows,
        "Horario actualizado exitosamente"
      );
    } catch (error) {
      throw FormatResponseModel.respuestaError(
        error,
        "Error al actualizar el horario"
      );
    }
  }

  /**
   * @name eliminar
   * @description Eliminar un horario
   * @param {number} idHorario - ID del horario a eliminar
   * @param {number} usuarioId - ID del usuario que realiza la acción
   * @returns {Object} Respuesta formateada del resultado
   */
  static async eliminar(idHorario, usuarioId) {
    try {
      const { rows } = await pg.query("CALL public.eliminar_horario($1, $2)", [
        usuarioId,
        idHorario,
      ]);
      return FormatResponseModel.respuestaPostgres(
        rows,
        "Horario eliminado exitosamente"
      );
    } catch (error) {
      throw FormatResponseModel.respuestaError(
        error,
        "Error al eliminar el horario"
      );
    }
  }
}
