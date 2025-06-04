import db from "../db.js";

export default class HorarioModel {
  static async registrarHorario({ datos }) {
    try {
      const {id_seccion,id_profesor, unidad_curricular_id, dia_semana, hora_inicio, aula } = datos;

      const resultado = await db.raw(
        `CALL registrar_horario(?, ?, ?, ?, ?, NULL, ?, true, NULL)`,
        [id_seccion,id_profesor, unidad_curricular_id, dia_semana, hora_inicio, aula ]
      );

      // Verificar la respuesta (ajustado para el formato JSON que mencionaste antes)
      console.log(resultado.rows[0])
      if (!resultado.rows[0] || resultado.rows.length === 0) {
        throw "No se recibió respuesta del procedimiento almacenado";
      }

      const respuesta = resultado.rows[0].p_resultado;

      if (respuesta.status !== "success") {
        throw respuesta.message || "Error al registrar el Horario";
      }

      return {
        message: respuesta.message,
        success: true,
      };
    } catch (error) {
      throw error || "Error al registrar el Horario";
    }
  }
}
