import pg from "../database/pg.js";

export default class HorarioModel {
  /**
   * @name obtenerTodos
   * @description Obtener todos los horarios de la vista
   * @returns {Array} Lista de horarios
   */
  static async obtenerTodos() {
    const { rows } = await pg.query("SELECT * FROM public.clases_completas");
    return rows;
  }

  /**
   * @name obtenerPorProfesor
   * @description Obtener horarios por ID de profesor
   * @param {number} idProfesor - ID del profesor
   * @returns {Array} Lista de horarios del profesor
   */
  static async obtenerPorProfesor(idProfesor) {
    const { rows } = await pg.query(
      "SELECT * FROM public.clases_completas WHERE id_profesor = $1",
      [idProfesor]
    );
    return rows;
  }

  /**
   * @name obtenerPorSeccion
   * @description Obtener horarios por ID de sección
   * @param {number} idSeccion - ID de la sección
   * @returns {Array} Lista de horarios de la sección
   */
  static async obtenerPorSeccion(idSeccion) {
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
        dia_semana
       FROM public.clases_completas 
       WHERE id_seccion = $1`,
      [idSeccion]
    );
    return rows;
  }

  /**
   * @name obtenerPorAula
   * @description Obtener horarios por ID de aula
   * @param {number} idAula - ID del aula
   * @returns {Array} Lista de horarios del aula
   */
  static async obtenerPorAula(idAula) {
    const { rows } = await pg.query(
      "SELECT * FROM public.clases_completas WHERE id_aula = $1",
      [idAula]
    );
    return rows;
  }

  /**
   * @name obtenerProfesoresDisponibles
   * @description Obtener profesores con horas disponibles
   * @param {string} horasNecesarias - Horas necesarias en formato intervalo
   * @returns {Array} Lista de profesores disponibles
   */
  static async obtenerProfesoresDisponibles(horasNecesarias) {
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
    return rows;
  }

  /**
   * @name obtenerAulasDisponibles
   * @description Obtener aulas disponibles por PNF
   * @param {string} nombrePNF - Nombre del PNF
   * @returns {Array} Lista de aulas disponibles
   */
  static async obtenerAulasDisponibles(nombrePNF) {
    const { rows } = await pg.query(
      "SELECT id_aula, codigo_aula FROM public.sedes_completas WHERE nombre_pnf = $1",
      [nombrePNF]
    );
    return rows;
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
   * @returns {Array} Resultado de la inserción
   */
  static async crear(datos, usuarioId) {
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
      [usuarioId, idSeccion, idProfesor, idUnidadCurricular, idAula, diaSemana, horaInicio]
    );
    return rows;
  }

  /**
   * @name actualizar
   * @description Actualizar un horario existente
   * @param {number} idHorario - ID del horario a actualizar
   * @param {Object} datos - Datos actualizados
   * @param {number} usuarioId - ID del usuario que realiza la acción
   * @returns {Array} Resultado de la actualización
   */
  static async actualizar(idHorario, datos, usuarioId) {
    // Ejemplo de implementación - ajustar según procedimiento almacenado real
    const { rows } = await pg.query(
      "CALL public.actualizar_horario($1, $2, $3, $4, $5, $6, $7, $8)",
      [usuarioId, idHorario, datos.idSeccion, datos.idProfesor, datos.idUnidadCurricular, datos.idAula, datos.diaSemana, datos.horaInicio]
    );
    return rows;
  }

  /**
   * @name eliminar
   * @description Eliminar un horario
   * @param {number} idHorario - ID del horario a eliminar
   * @param {number} usuarioId - ID del usuario que realiza la acción
   * @returns {Array} Resultado de la eliminación
   */
  static async eliminar(idHorario, usuarioId) {
    const { rows } = await pg.query(
      "CALL public.eliminar_horario($1, $2)",
      [usuarioId, idHorario]
    );
    return rows;
  }
}