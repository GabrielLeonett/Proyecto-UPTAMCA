import db from "../db.js";

export default class CurricularModel {
  static async registrarPNF({ datos }) {
    try {
      const { nombre_pnf, descripcion, poblacionPNF, codigoPNF } = datos;

      const resultado = await db.raw(
        `SELECT * FROM registrar_pnf(?, ?, ?, ?)`,
        [nombre_pnf, descripcion, poblacionPNF, codigoPNF]
      );

      // Verificar la respuesta (ajustado para el formato JSON que mencionaste antes)
      if (!resultado.rows[0] || resultado.rows.length === 0) {
        throw "No se recibió respuesta del procedimiento almacenado";
      }

      const respuesta = resultado.rows[0].registrar_pnf;

      if (respuesta.status !== "success") {
        throw respuesta.message || "Error al registrar el PNF";
      }

      return {
        message: respuesta.message,
        success: true,
      };
    } catch (error) {
      throw error || "Error al registrar el PNF";
    }
  }
}
