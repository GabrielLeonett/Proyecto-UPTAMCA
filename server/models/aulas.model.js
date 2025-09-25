// Importación de librería para envío de correos electrónicos
import { enviarEmail } from "../utils/EnviarCorreos.js";

// Importación de la conexión a la base de datos
import db from "../db.js";

// Importación de clase para formateo de respuestas
import FormatResponseModel from "../utils/FormatResponseModel.js";

/**
 * @class AulaModel
 * @description Contiene los metodos para todo lo que tiene que ver con sedes
 */

export default class AulaModel {
  static async registerAula(usuario_accion, datos) {
    try {
      const { id_sede, codigo, tipo, capacidad } = datos;
      const query = `CALL registrar_aula_completo(?, ?, ?, ?, ?, NULL)`;

      const param = [usuario_accion.id, id_sede, codigo, tipo, capacidad];
      const { rows } = await db.raw(query, param);

      FormatResponseModel.respuestaPostgres(rows, "Registro exitoso del aula.");
    } catch (error) {
      throw FormatResponseModel.respuestaError(
        error,
        "Error en el registro del aula"
      );
    }
  }
}
