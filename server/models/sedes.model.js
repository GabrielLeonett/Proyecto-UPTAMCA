import pg from "../database/pg.js";

/**
 * @class SedeModel
 * @description Modelo para operaciones de base de datos relacionadas con sedes
 */
export default class SedeModel {
  /**
   * @name crear
   * @description Crear una nueva sede en la base de datos
   * @param {Object} datos - Datos de la sede
   * @param {string} datos.nombreSede - Nombre de la sede
   * @param {string} datos.UbicacionSede - Ubicación de la sede
   * @param {string} datos.GoogleSede - Enlace de Google Maps
   * @param {number} usuarioId - ID del usuario que realiza la acción
   * @returns {Array} Resultado de la inserción
   */
  static async crear(datos, usuarioId) {
    const { nombreSede, UbicacionSede, GoogleSede } = datos;

    // Obtener próximo ID
    const idResult = await pg.query("SELECT COUNT(*) + 1 AS id FROM sedes");
    const idSede = idResult.rows[0].id;

    // Insertar sede
    const { rows } = await pg.query(
      "CALL public.registrar_sede_completo($1, $2, $3, $4, $5, NULL)",
      [usuarioId, idSede, nombreSede, UbicacionSede, GoogleSede]
    );
    
    return rows;
  }

  /**
   * @name obtenerTodas
   * @description Obtener todas las sedes de la base de datos
   * @returns {Array} Lista de sedes
   */
  static async obtenerTodas() {
    const { rows } = await pg.query(
      "SELECT id_sede, nombre_sede, ubicacion_sede, google_sede FROM sedes"
    );
    return rows;
  }

  /**
   * @name obtenerPorId
   * @description Obtener una sede específica por ID
   * @param {number} idSede - ID de la sede
   * @returns {Array} Datos de la sede
   */
  static async obtenerPorId(idSede) {
    const { rows } = await pg.query(
      "SELECT id_sede, nombre_sede, ubicacion_sede, google_sede FROM sedes WHERE id_sede = $1",
      [idSede]
    );
    return rows;
  }

  /**
   * @name actualizar
   * @description Actualizar una sede existente
   * @param {number} idSede - ID de la sede a actualizar
   * @param {Object} datos - Datos actualizados
   * @param {string} datos.nombreSede - Nuevo nombre de la sede
   * @param {string} datos.ubicacionSede - Nueva ubicación
   * @param {string} datos.googleSede - Nuevo enlace de Google Maps
   * @param {number} usuarioId - ID del usuario que realiza la acción
   * @returns {Array} Resultado de la actualización
   */
  static async actualizar(idSede, datos, usuarioId) {
    const { nombreSede, ubicacionSede, googleSede } = datos;
    
    const { rows } = await pg.query(
      "CALL public.actualizar_sede($1, $2, $3, $4, $5)",
      [usuarioId, idSede, nombreSede, ubicacionSede, googleSede]
    );
    return rows;
  }

  /**
   * @name eliminar
   * @description Eliminar una sede
   * @param {number} idSede - ID de la sede a eliminar
   * @param {number} usuarioId - ID del usuario que realiza la acción
   * @returns {Array} Resultado de la eliminación
   */
  static async eliminar(idSede, usuarioId) {
    const { rows } = await pg.query(
      "CALL public.eliminar_sede($1, $2)",
      [usuarioId, idSede]
    );
    return rows;
  }
}