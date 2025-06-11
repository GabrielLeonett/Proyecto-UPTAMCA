import db from "../db.js";

export default class CurricularModel {
  static async registrarPNF({ datos }) {
    try {
      const { nombre_pnf, descripcion, poblacionPNF, codigoPNF } = datos;

      const resultado = await db.raw(
        `CALL registrar_pnf(?, ?, ?, ?)`,
        [nombre_pnf, descripcion, poblacionPNF, codigoPNF]
      );

      // Verificar la respuesta (ajustado para el formato JSON que mencionaste antes)
      console.log(resultado.rows[0])
      if (!resultado.rows[0] || resultado.rows.length === 0) {
        throw "No se recibió respuesta del procedimiento almacenado";
      }

      const respuesta = resultado.rows[0].p_resultado;

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

  static async registrarUnidadCurricular({ datos }) {
    try {
      const { id_trayecto,nombre_unidad,descripcion_unidad,carga_horas_unidad,codigo_unidad } = datos;

      const resultado = await db.raw(
        `CALL registrar_unidad_curricular(?, ?, ?, ?, ?, NULL)`,
        [id_trayecto,nombre_unidad,descripcion_unidad,carga_horas_unidad,codigo_unidad]
      );


      // Verificar la respuesta (ajustado para el formato JSON que mencionaste antes)
      console.log(resultado.rows[0])
      if (!resultado.rows[0] || resultado.rows.length === 0) {
        throw "No se recibió respuesta del procedimiento almacenado";
      }

      const respuesta = resultado.rows[0].p_resultado;

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
  static async mostrarPNF() {
    try {
      const resultado = await db.raw(`SELECT * FROM pnfs`);
      const respuesta = resultado.rows[0];
      return {
        data: respuesta,
        success: true,
      };
    } catch (error) {
      throw error || "Error al registrar el PNF";
    }
  }
}
