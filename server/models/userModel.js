import db from "../db.js";

export default class UserModel {
  static async loginUser({ email }) {
    try {
      const query = "SELECT * FROM mostrar_usuarios(?);";
      const values = [email];

      const result = await db.raw(query, values);
      const jsonResult = result.rows[0]?.mostrar_usuarios;


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
