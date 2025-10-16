import pg from "../database/pg.js";
import FormatterResponseModel from "../utils/FormatterResponseModel.js";
import generateReport from "../utils/generateReport.js";

/**
 * @class ProfesorModel
 * @description Modelo para operaciones de base de datos relacionadas con profesores
 */
export default class ProfesorModel {
  /**
   * @private
   * @method ejecutarQuery
   * @description Método genérico para ejecutar consultas con manejo uniforme de errores y formato de respuesta.
   */
  static async ejecutarQuery(query, params = [], titulo = "Operación completada") {
    try {
      console.debug("🔍 [DEBUG] Ejecutando query:", query, " | Parámetros:", params);
      const { rows } = await pg.query(query, params);
      return FormatterResponseModel.respuestaPostgres(rows, titulo);
    } catch (error) {
      console.error("💥 [ERROR ProfesorModel]:", error);

      generateReport({
        status: 500,
        state: "error",
        title: "Error en ProfesorModel",
        message: error.message,
        query,
        params,
        ...(error?.code && { code: error.code }),
        ...(error?.detail && { detail: error.detail }),
        ...(error?.stack && { stack: error.stack }),
      });

      return FormatterResponseModel.respuestaError(
        null,
        "Error al ejecutar la consulta del modelo"
      );
    }
  }

  // ======================================================
  // 🔹 CREACIÓN
  // ======================================================
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
      imagen,
      passwordHash
    } = datos;

    const query = `
      CALL registrar_profesor_completo(
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,
        $13,$14,$15,$16,$17,$18,$19,NULL
      )
    `;
    const params = [
      usuarioId, cedula, nombres, apellidos, email, direccion,
      passwordHash, telefono_movil, telefono_local || null, fecha_nacimiento,
      genero, categoria, dedicacion, pre_grado, pos_grado,
      area_de_conocimiento, imagen, municipio, fecha_ingreso
    ];

    return this.ejecutarQuery(query, params, "Profesor registrado correctamente");
  }

  // ======================================================
  // 🔹 CONSULTAS
  // ======================================================
  static async obtenerTodos() {
    return this.ejecutarQuery("SELECT * FROM profesores_informacion_completa", [], "Lista de profesores obtenida");
  }

  static async obtenerConFiltros(filtros) {
    const { dedicacion, categoria, ubicacion, area, fecha, genero } = filtros;
    const query = "SELECT * FROM mostrar_profesor($1, $2, $3, $4, $5, $6)";
    const params = [dedicacion, categoria, ubicacion, area, fecha, genero];
    return this.ejecutarQuery(query, params, "Profesores filtrados correctamente");
  }

  static async buscar(busqueda) {
    const query = `
      SELECT * FROM PROFESORES_INFORMACION_COMPLETA 
      WHERE nombres ILIKE $1 OR apellidos ILIKE $2 OR cedula ILIKE $3
    `;
    const params = [`%${busqueda}%`, `%${busqueda}%`, `%${busqueda}%`];
    return this.ejecutarQuery(query, params, "Búsqueda de profesores realizada");
  }

  static async obtenerImagen(cedula) {
    return this.ejecutarQuery(
      "SELECT imagen FROM users WHERE cedula = $1",
      [cedula],
      "Imagen del profesor obtenida"
    );
  }

  static async obtenerPregrados() {
    return this.ejecutarQuery(
      "SELECT id_pre_grado, nombre_pre_grado, tipo_pre_grado FROM pre_grado",
      [],
      "Pregrados obtenidos"
    );
  }

  static async obtenerPosgrados() {
    return this.ejecutarQuery(
      "SELECT id_pos_grado, nombre_pos_grado, tipo_pos_grado FROM pos_grado",
      [],
      "Posgrados obtenidos"
    );
  }

  static async obtenerAreasConocimiento() {
    return this.ejecutarQuery(
      "SELECT id_area_conocimiento, nombre_area_conocimiento FROM areas_de_conocimiento",
      [],
      "Áreas de conocimiento obtenidas"
    );
  }

  // ======================================================
  // 🔹 INSERCIÓN DE CATÁLOGOS
  // ======================================================
  static async crearPregrado(datos, usuarioId) {
    const { nombre, tipo } = datos;
    return this.ejecutarQuery(
      "CALL registrar_pre_grado($1, $2, $3, NULL)",
      [usuarioId, nombre, tipo],
      "Pregrado creado exitosamente"
    );
  }

  static async crearPosgrado(datos, usuarioId) {
    const { nombre, tipo } = datos;
    return this.ejecutarQuery(
      "CALL registrar_pos_grado($1, $2, $3, NULL)",
      [usuarioId, nombre, tipo],
      "Posgrado creado exitosamente"
    );
  }

  static async crearAreaConocimiento(datos, usuarioId) {
    const { area_conocimiento } = datos;
    return this.ejecutarQuery(
      "CALL registrar_area_conocimiento($1, $2, NULL)",
      [usuarioId, area_conocimiento],
      "Área de conocimiento creada"
    );
  }

  static async crearDisponibilidad(datos, usuarioId) {
    const { id_profesor, dia_semana, hora_inicio, hora_fin } = datos;
    return this.ejecutarQuery(
      "CALL registrar_disponibilidad_docente_completo($1, $2, $3, $4, $5, NULL)",
      [usuarioId, id_profesor, dia_semana, hora_inicio, hora_fin],
      "Disponibilidad registrada"
    );
  }

  // ======================================================
  // 🔹 ACTUALIZACIÓN Y ELIMINACIÓN
  // ======================================================
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

    const query = `
      CALL actualizar_profesor_completo_o_parcial(
        NULL, $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,
        $11,$12,$13,$14,$15,$16,$17,$18,$19
      )
    `;
    const params = [
      usuarioId, id_profesor, nombres, apellidos, email, direccion,
      password, telefono_movil, telefono_local, fecha_nacimiento,
      genero, nombre_categoria, nombre_dedicacion, pre_grado, pos_grado,
      area_de_conocimiento, imagen, municipio, fecha_ingreso
    ];

    return this.ejecutarQuery(query, params, "Profesor actualizado correctamente");
  }

  static async eliminar(datos, usuarioId) {
    const { id_profesor, tipo_accion, razon, observaciones, fecha_efectiva } = datos;
    const query = "CALL eliminar_destituir_profesor(NULL, $1, $2, $3, $4, $5, $6)";
    const params = [usuarioId, id_profesor, tipo_accion, razon, observaciones, fecha_efectiva];
    return this.ejecutarQuery(query, params, "Profesor eliminado o destituido");
  }
}
