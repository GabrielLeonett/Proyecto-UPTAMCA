import db from "../db.js";

export default class UserModel {
  static async registerUser({id,nombres, apellidos, email, password, direccion, telefono_movil, telefono_local, fecha_nacimiento, genero,}) {
    try {
      const query = `CALL registrar_usuario(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL);`;
      const params = [id, nombres, apellidos, email, direccion, password, telefono_movil, telefono_local, fecha_nacimiento, genero];
      
      // Ejecutar con transacción
      const result = await db.transaction(async (trx) => {
        const { rows } = await trx.raw(query, params);
        return rows[0];
      });

      // Procesar resultado
      let output;
      try {
        output =
          typeof result?.p_resultado === "string"
            ? JSON.parse(result.p_resultado)
            : result.p_resultado || result;
      } catch (e) {
        output = result;
      }

      // Retornar objeto con status y mensaje
      return {
        status: output?.status || "success",
        message: output?.message || "Usuario registrado correctamente",
      };
    } catch (error) {
      console.error("Error al registrar usuario:", error);
      return {
        status: "error",
        message: error.message || "Error al registrar usuario",
      };
    }
  }

  static async loginUser({ email }) {
    try {
      const query = "SELECT MOSTRAR_USER(?)";
      const values = [email];

      const result = await db.query(query, values);
      const jsonResult = result.rows[0]?.mostrar_user;

      if (!jsonResult || jsonResult.status !== "success") {
        throw new Error(jsonResult?.message || "Error en autenticación");
      }

      return {
        status: "success",
        message: "Usuario autenticado correctamente",
        data: jsonResult,
      };
    } catch (error) {
      console.error("Error al logear usuario:", error);
      return {
        status: "error",
        message: error.message || "Error en autenticación",
      };
    }
  }
}
