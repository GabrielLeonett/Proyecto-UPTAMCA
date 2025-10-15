/*
Importación de la clase para el formateo de los datos que se reciben de la BD y
su procesamiento para devolver al controlador un resultado estandarizado.
*/
import FormatResponseModel from "../utils/FormatResponseModel.js";

// Importación de librería para encriptación de contraseñas
import { hashPassword, generarPassword } from "../utils/encrypted.js";

// Importación de la conexión con la base de datos
import client from "../database/pg.js";

/**
 * @class UserModel
 * @description Esta clase se encarga de interactuar con la base de datos para las operaciones relacionadas con usuarios,
 * proporcionando una capa de abstracción entre el controlador y la base de datos.
 * Maneja el formato de las respuestas para mantener consistencia en la API.
 */

export default class UserModel {
  /**
   * @static
   * @async
   * @method loginUser
   * @description Busca un usuario en la base de datos por su email y devuelve sus datos formateados.
   * Utiliza una función almacenada en la BD (MOSTRAR_USUARIO) para obtener la información.
   * @param {Object} params - Objeto que contiene los parámetros de búsqueda
   * @param {string} params.email - Email del usuario a buscar
   * @returns {Promise<Object>} Objeto formateado con el resultado de la consulta:
   *   - Si es exitoso: { state: "success", data: { usuario }, message: "Usuario Obtenido" }
   *   - Si falla: { state: "error", message: "Error al obtener el usuario", error: detalles }
   * @throws {Error} Cuando ocurre un error en la consulta a la base de datos
   */
  static async loginUser({ email }) {
    try {
      // Consulta SQL que llama a la función almacenada MOSTRAR_USUARIO
      const query = "SELECT iniciar_session(?) AS p_resultado";
      // Valores para la consulta preparada (email del usuario)
      const values = [email];

      // Ejecución de la consulta en la base de datos
      const { rows } = await db.raw(query, values);

      // Formateo de la respuesta utilizando el modelo estándar
      const resultado = FormatResponseModel.respuestaPostgres(
        rows,
        "Usuario Obtenido"
      );

      return resultado;
    } catch (error) {
      error.details = {
        path: "UserModel.loginUser",
      };
      // Formateo del error utilizando el modelo estándar
      throw FormatResponseModel.respuestaError(
        error,
        "Error al obtener el usuario"
      );
    }
  }
  /**
   * @static
   * @async
   * @method cambiarContraseña
   * @description Actualiza la contraseña de un usuario en la base de datos.
   * Utiliza una función almacenada en la BD (actualizar_contrasena_usuario) para realizar la actualización.
   * @param {Object} params - Objeto que contiene los parámetros para el cambio de contraseña
   * @param {Object} params.usuario - Objeto del usuario con su ID
   * @param {string} params.contraseña - Nueva contraseña a establecer
   * @returns {Promise<Object>} Objeto formateado con el resultado de la operación:
   *   - Si es exitoso: { state: "success", data: { resultado }, message: "Contraseña actualizada exitosamente" }
   *   - Si falla: { state: "error", message: "Error al cambiar la contraseña", error: detalles }
   * @throws {Error} Cuando ocurre un error en la consulta a la base de datos
   */
  static async cambiarContraseña({ usuario, contraseña }) {
    try {
      console.log(usuario.id, contraseña);
      // Consulta SQL que llama al procedimiento almacenado actualizar_contrasena_usuario
      const query = "CALL actualizar_contrasena_usuario(?, ?, NULL)";
      // Valores para la consulta preparada (id_usuario, nueva_contraseña)
      const passwordHash = await hashPassword(contraseña);
      const values = [usuario.id, passwordHash];

      // Ejecución de la consulta en la base de datos
      const result = await db.raw(query, values);

      // Si tu procedimiento devuelve resultados en rows, usa esta línea:
      const resultado = FormatResponseModel.respuestaPostgres(
        result.rows,
        "Contraseña actualizada exitosamente"
      );

      return resultado;
    } catch (error) {
      error.details = {
        path: "UserModel.cambiarContraseña",
        usuario_id: usuario.id,
      };

      // Formateo del error utilizando el modelo estándar
      throw FormatResponseModel.respuestaError(
        error,
        "Error al cambiar la contraseña"
      );
    }
  }
}
