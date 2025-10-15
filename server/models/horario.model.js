import db from "../database/db.js";
import FormatResponseModel from "../utils/FormatResponseModel.js";

export default class HorarioModel {
  static async obtenerHorarios() {
    const { rows } = await db.raw(`SELECT * FROM public.clases_completas`);
    return rows;
  }

  static async obtenerHorariosProfesores(idProfesor) {
    let query = `SELECT * FROM public.clases_completas`;
    if (idProfesor) {
      query += ` WHERE id_profesor = ${idProfesor}`;
    }
    const { rows } = await db.raw(query);
    return rows;
  }

  static async obtenerProfesoresParaHorario(horasNecesarias) {
    const query = `
      SELECT id_profesor, nombres, apellidos, disponibilidad, horas_disponibles, areas_de_conocimiento
      FROM public.profesores_informacion_completa
      WHERE horas_disponibles > (${horasNecesarias} * INTERVAL '45 minutes')`;
    const { rows } = await db.raw(query);
    return rows;
  }

  static async obtenerAulasParaHorario(nombrePNF) {
    const query = `
      SELECT id_aula, codigo_aula
      FROM public.sedes_completas
      WHERE nombre_pnf = ?`;
    const { rows } = await db.raw(query, [nombrePNF]);
    return rows;
  }

  static async insertarHorario(datos, usuario_accion) {
    const {
      idSeccion,
      idProfesor,
      idUnidadCurricular,
      diaSemana,
      horaInicio,
      idAula,
    } = datos;

    const query = `CALL public.registrar_horario_completo(?, ?, ?, ?, ?, ?, ?, TRUE, NULL)`;
    const params = [
      usuario_accion.id,
      idSeccion,
      idProfesor,
      idUnidadCurricular,
      idAula,
      diaSemana,
      horaInicio,
    ];

    const { rows } = await db.raw(query, params);
    return rows;
  }
  static async obtenerHorarioPorSeccion(idSeccion) {
    try {
      const horario = await db("clases_completas") // 👈 nombre real de tu vista
        .where("id_seccion", idSeccion)
        .select(
          "id_horario",
          "id_profesor",
          "nombres_profesor",
          "apellidos_profesor",
          "id_unidad_curricular",
          "nombre_unidad_curricular",
          "valor_seccion",
          "id_seccion",
          "valor_trayecto",
          "nombre_pnf",
          "nombre_turno",
          "turno_hora_inicio",
          "turno_hora_fin",
          "codigo_aula",
          "id_aula",
          "hora_inicio",
          "hora_fin",
          "dia_semana"
        );

      return horario;
    } catch (error) {
      console.error(
        "❌ Error al obtener el horario desde la vista clases_completas:",
        error
      );
      throw error;
    }
  }
}
