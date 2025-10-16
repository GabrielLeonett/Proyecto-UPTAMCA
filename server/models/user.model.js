/*
Importación de la clase para el formateo de los datos que se reciben de la BD y
su procesamiento para devolver al controlador un resultado estandarizado.
*/
import FormatResponseModel from "../utils/FormatterResponseModel.js";

// Importación de la conexión con la base de datos
import client from "../database/pg.js";

/**
 * @class UserModel
 * @description Esta clase se encarga exclusivamente de interactuar con la base de datos.
 * Solo contiene operaciones CRUD y consultas directas a la BD.
 */
export default class UserModel {
  /**
   * @static
   * @async
   * @method loginUser
   * @description Busca un usuario en la base de datos por su email
   * @param {string} email - Email del usuario a buscar
   * @returns {Promise<Object>} Resultado de la consulta a la base de datos
   */
  static async loginUser(email) {
    try {
      // Opción 1: Si usas parámetros nombrados con :
      const query = "SELECT iniciar_session($1) AS p_resultado";

      const { rows } = await client.query(query, [email]);

      return FormatResponseModel.respuestaPostgres(rows, "Usuario Obtenido");
    } catch (error) {
      error.details = {
        path: "UserModel.loginUser",
      };
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
   * @description Actualiza la contraseña de un usuario en la base de datos
   * @param {number} usuarioId - ID del usuario
   * @param {string} passwordHash - Contraseña hasheada
   * @returns {Promise<Object>} Resultado de la operación en la base de datos
   */
  static async cambiarContraseña(usuarioId, passwordHash) {
    try {
      const query = "CALL actualizar_contrasena_usuario(?, ?, NULL)";
      const values = [usuarioId, passwordHash];

      const result = await client.raw(query, values);

      return FormatResponseModel.respuestaPostgres(
        result.rows,
        "Contraseña actualizada exitosamente"
      );
    } catch (error) {
      error.details = {
        path: "UserModel.cambiarContraseña",
        usuario_id: usuarioId,
      };
      throw FormatResponseModel.respuestaError(
        error,
        "Error al cambiar la contraseña"
      );
    }
  }

  /**
   * @static
   * @async
   * @method obtenerUsuarioPorId
   * @description Obtiene un usuario por su ID
   * @param {number} id - ID del usuario
   * @returns {Promise<Object>} Datos del usuario
   */
  static async obtenerUsuarioPorId(id) {
    try {
      const query = "SELECT * FROM users WHERE id = ?";
      const values = [id];

      const { rows } = await client.raw(query, values);

      return FormatResponseModel.respuestaPostgres(rows, "Usuario obtenido");
    } catch (error) {
      error.details = {
        path: "UserModel.obtenerUsuarioPorId",
      };
      throw FormatResponseModel.respuestaError(
        error,
        "Error al obtener el usuario"
      );
    }
  }

  /**
   * @static
   * @async
   * @method actualizarUltimoLogin
   * @description Actualiza la fecha del último login del usuario
   * @param {number} usuarioId - ID del usuario
   * @returns {Promise<Object>} Resultado de la operación
   */
  static async actualizarUltimoLogin(usuarioId) {
    try {
      const query = "UPDATE usuarios SET ultimo_login = NOW() WHERE id = ?";
      const values = [usuarioId];

      const result = await client.raw(query, values);

      return FormatResponseModel.respuestaPostgres(
        result.rows,
        "Último login actualizado"
      );
    } catch (error) {
      error.details = {
        path: "UserModel.actualizarUltimoLogin",
      };
      throw FormatResponseModel.respuestaError(
        error,
        "Error al actualizar último login"
      );
    }
  }
}
