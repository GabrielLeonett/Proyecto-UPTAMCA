import pg from "../database/pg.js";

/**
 * @class ProfesorModel
 * @description Modelo para operaciones de base de datos relacionadas con profesores
 */
export default class ProfesorModel {
  /**
   * @name crear
   * @description Crear un nuevo profesor en la base de datos
   * @param {Object} datos - Datos del profesor
   * @param {number} usuarioId - ID del usuario que realiza la acción
   * @returns {Array} Resultado de la inserción
   */
  static async crear(datos, usuarioId) {
    const {
      cedula,
      nombres,
      apellidos,
      email,
      direccion,
      telefono_movil,
      telefono_local,
      fecha_nacimiento,
      genero,
      fecha_ingreso,
      dedicacion,
      categoria,
      municipio,
      area_de_conocimiento,
      pre_grado,
      pos_grado,
      imagen
    } = datos;

    const { rows } = await pg.query(
      "CALL registrar_profesor_completo($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, NULL)",
      [
        usuarioId,
        cedula,
        nombres,
        apellidos,
        email,
        direccion,
        datos.passwordHash,
        telefono_movil,
        telefono_local || null,
        fecha_nacimiento,
        genero,
        categoria,
        dedicacion,
        pre_grado,
        pos_grado,
        area_de_conocimiento,
        imagen,
        municipio,
        fecha_ingreso,
      ]
    );
    
    return rows;
  }

  /**
   * @name obtenerTodos
   * @description Obtener todos los profesores de la base de datos
   * @returns {Array} Lista de profesores
   */
  static async obtenerTodos() {
    const { rows } = await pg.query("SELECT * FROM profesores_informacion_completa");
    return rows;
  }

  /**
   * @name obtenerConFiltros
   * @description Obtener profesores con filtros específicos
   * @param {Object} filtros - Filtros de búsqueda
   * @returns {Array} Lista de profesores filtrados
   */
  static async obtenerConFiltros(filtros) {
    const { dedicacion, categoria, ubicacion, area, fecha, genero } = filtros;

    const { rows } = await pg.query(
      "SELECT * FROM mostrar_profesor($1, $2, $3, $4, $5, $6)",
      [dedicacion, categoria, ubicacion, area, fecha, genero]
    );
    
    return rows;
  }

  /**
   * @name buscar
   * @description Buscar profesores por nombre, apellido o cédula
   * @param {string} busqueda - Término de búsqueda
   * @returns {Array} Resultados de la búsqueda
   */
  static async buscar(busqueda) {
    const { rows } = await pg.query(
      "SELECT * FROM PROFESORES_INFORMACION_COMPLETA WHERE nombres ILIKE $1 OR apellidos ILIKE $2 OR cedula ILIKE $3",
      [`%${busqueda}%`, `%${busqueda}%`, `%${busqueda}%`]
    );
    
    return rows;
  }

  /**
   * @name obtenerImagen
   * @description Obtener información de la imagen de un profesor
   * @param {number} idProfesor - ID del profesor
   * @returns {Array} Información de la imagen
   */
  static async obtenerImagen(idProfesor) {
    const { rows } = await pg.query(
      "SELECT imagen FROM users WHERE cedula = $1",
      [idProfesor]
    );
    
    return rows;
  }

  /**
   * @name obtenerPregrados
   * @description Obtener todos los pregrados
   * @returns {Array} Lista de pregrados
   */
  static async obtenerPregrados() {
    const { rows } = await pg.query(
      "SELECT id_pre_grado, nombre_pre_grado, tipo_pre_grado FROM pre_grado"
    );
    
    return rows;
  }

  /**
   * @name obtenerPosgrados
   * @description Obtener todos los posgrados
   * @returns {Array} Lista de posgrados
   */
  static async obtenerPosgrados() {
    const { rows } = await pg.query(
      "SELECT id_pos_grado, nombre_pos_grado, tipo_pos_grado FROM pos_grado"
    );
    
    return rows;
  }

  /**
   * @name obtenerAreasConocimiento
   * @description Obtener todas las áreas de conocimiento
   * @returns {Array} Lista de áreas de conocimiento
   */
  static async obtenerAreasConocimiento() {
    const { rows } = await pg.query(
      "SELECT id_area_conocimiento, nombre_area_conocimiento FROM AREAS_DE_CONOCIMIENTO"
    );
    
    return rows;
  }

  /**
   * @name crearPregrado
   * @description Crear un nuevo pregrado
   * @param {Object} datos - Datos del pregrado
   * @param {number} usuarioId - ID del usuario que realiza la acción
   * @returns {Array} Resultado de la inserción
   */
  static async crearPregrado(datos, usuarioId) {
    const { nombre, tipo } = datos;

    const { rows } = await pg.query(
      "CALL registrar_pre_grado($1, $2, $3, NULL)",
      [usuarioId, nombre, tipo]
    );
    
    return rows;
  }

  /**
   * @name crearPosgrado
   * @description Crear un nuevo posgrado
   * @param {Object} datos - Datos del posgrado
   * @param {number} usuarioId - ID del usuario que realiza la acción
   * @returns {Array} Resultado de la inserción
   */
  static async crearPosgrado(datos, usuarioId) {
    const { nombre, tipo } = datos;

    const { rows } = await pg.query(
      "CALL registrar_pos_grado($1, $2, $3, NULL)",
      [usuarioId, nombre, tipo]
    );
    
    return rows;
  }

  /**
   * @name crearAreaConocimiento
   * @description Crear una nueva área de conocimiento
   * @param {Object} datos - Datos del área de conocimiento
   * @param {number} usuarioId - ID del usuario que realiza la acción
   * @returns {Array} Resultado de la inserción
   */
  static async crearAreaConocimiento(datos, usuarioId) {
    const { area_conocimiento } = datos;

    const { rows } = await pg.query(
      "CALL registrar_area_conocimiento($1, $2, NULL)",
      [usuarioId, area_conocimiento]
    );
    
    return rows;
  }

  /**
   * @name crearDisponibilidad
   * @description Crear disponibilidad docente
   * @param {Object} datos - Datos de la disponibilidad
   * @param {number} usuarioId - ID del usuario que realiza la acción
   * @returns {Array} Resultado de la inserción
   */
  static async crearDisponibilidad(datos, usuarioId) {
    const { id_profesor, dia_semana, hora_inicio, hora_fin } = datos;

    const { rows } = await pg.query(
      "CALL registrar_disponibilidad_docente_completo($1, $2, $3, $4, $5, NULL)",
      [usuarioId, id_profesor, dia_semana, hora_inicio, hora_fin]
    );
    
    return rows;
  }

  /**
   * @name actualizar
   * @description Actualizar un profesor existente
   * @param {Object} datos - Datos actualizados
   * @param {number} usuarioId - ID del usuario que realiza la acción
   * @returns {Array} Resultado de la actualización
   */
  static async actualizar(datos, usuarioId) {
    const {
      id_profesor,
      nombres,
      apellidos,
      email,
      direccion,
      password,
      telefono_movil,
      telefono_local,
      fecha_nacimiento,
      genero,
      nombre_categoria,
      nombre_dedicacion,
      pre_grado,
      pos_grado,
      area_de_conocimiento,
      imagen,
      municipio,
      fecha_ingreso,
    } = datos;

    const { rows } = await pg.query(
      `CALL actualizar_profesor_completo_o_parcial(
        NULL, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19
      )`,
      [
        usuarioId,
        id_profesor,
        nombres,
        apellidos,
        email,
        direccion,
        password,
        telefono_movil,
        telefono_local,
        fecha_nacimiento,
        genero,
        nombre_categoria,
        nombre_dedicacion,
        pre_grado,
        pos_grado,
        area_de_conocimiento,
        imagen,
        municipio,
        fecha_ingreso,
      ]
    );
    
    return rows;
  }

  /**
   * @name eliminar
   * @description Eliminar/destituir un profesor
   * @param {Object} datos - Datos de la eliminación
   * @param {number} usuarioId - ID del usuario que realiza la acción
   * @returns {Array} Resultado de la eliminación
   */
  static async eliminar(datos, usuarioId) {
    const { id_profesor, tipo_accion, razon, observaciones, fecha_efectiva } = datos;

    const { rows } = await pg.query(
      "CALL eliminar_destituir_profesor(NULL, $1, $2, $3, $4, $5, $6)",
      [usuarioId, id_profesor, tipo_accion, razon, observaciones, fecha_efectiva]
    );
    
    return rows;
  }
}