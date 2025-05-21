import { db } from "../db.js";

export default class UserModel {
  static async registerUser({
    id,
    nombres,
    email,
    password,
    direccion,
    telefono_movil,
    telefono_local,
    fecha_nacimiento,
    genero,
  }) {
    try {
      const query = `
                SELECT REGISTRA_USUARIOS(
                    $1, $2, $3, $4, $5, $6, $7, $8, $9
                ) AS result
            `;

      const values = [
        id,
        nombres,
        email,
        direccion,
        password,
        telefono_movil,
        telefono_local,
        fecha_nacimiento,
        genero,
      ];

      const result = await db.query(query, values);
      const jsonResult = result.rows[0].result;

      return jsonResult;
    } catch (error) {
      console.error("Error al registrar usuario:", error);
      throw error;
    }
  }

  static async loginUser({ email, password }) {
    try {
      const query = "SELECT MOSTRAR_USER($1,$2)";
      const values = [email, password];

      const result = await db.query(query, values);
      const jsonResult = result.rows[0].mostrar_user;

      if(jsonResult.status != 'success') throw jsonResult.message;
      
      return jsonResult;
    } catch (error) {
      console.error("Error al logear usuario:", error);
      throw error;
    }
  }
}
