// Funcion para generar reportes en caso de errores internos
import generateReport from "./generateReport.js";

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

  /**
   * @static
   * @method respuestaError
   * @description Formatea y LANZA una respuesta de error estándar
   * @param {Object|Array|null} [rows=null] - Datos de error de la BD
   * @param {string} [title='Error'] - Título descriptivo del error
   * @throws {Object} Error formateado para propagación automática
   */
  static respuestaError(rows = null, title = "Error") {
    try {
      const resultado = rows ? this.validacionesComunes(rows) : {};

      // Si el resultado ya tiene estructura de error, lanzarlo directamente
      if (resultado.status === "error" || resultado.state === "error") {
        throw {
          status: resultado.status_code || resultado.status || 400,
          state: "error",
          title: resultado.title || title,
          message: resultado.message || "Error en la operación",
          error: {
            code:
              resultado.error?.code ||
              resultado.codigo_error ||
              "UNKNOWN_ERROR",
            details: resultado.error?.details || resultado.details || {},
            timestamp: new Date().toISOString(),
          },
        };
      }

      // Si no tiene estructura esperada, podría ser un error de PostgreSQL
      if (
        resultado.status === undefined &&
        resultado.status_code === undefined
      ) {
        // Es probablemente un error crudo de PostgreSQL
        throw {
          status: 500,
          state: "error",
          title: "Error de Base de Datos",
          message: "Error en la operación de base de datos",
          error: {
            code: "DATABASE_ERROR",
            details: {
              originalError: resultado,
              postgresCode: resultado.code,
              postgresMessage: resultado.message,
            },
            timestamp: new Date().toISOString(),
          },
        };
      }

      // Caso por defecto - lanzar error formateado
      throw {
        status: resultado.status_code || 400,
        state: "error",
        title: title,
        message: resultado.message || "Error en la operación",
        error: {
          code: resultado.codigo_error || "OPERATION_ERROR",
          details: resultado.details || {},
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      console.error("💥 Error crítico en respuestaError:", error);

      // Generar reporte del error interno
      generateReport({
        status: 500,
        state: "critical",
        title: "Error en el formateador de errores del modelo",
        message: error.message,
        stack: error.stack,
        originalError: error,
        timestamp: new Date().toISOString(),
        ...(error?.code && { code: error.code }),
        ...(error?.details && { details: error.details }),
      });

      // Lanzar error interno formateado
      throw {
        status: 500,
        state: "error",
        title: "Error interno en el servidor",
        message:
          "Lo sentimos, ha ocurrido un error interno. Por favor, intente más tarde.",
        error: {
          code: "INTERNAL_FORMATTER_ERROR",
          details: {
            originalError:
              process.env.MODE === "DEVELOPMENT" ? error.message : undefined,
          },
          timestamp: new Date().toISOString(),
        },
      };
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

  /**
   * @static
   * @method respuestaPostgres
   * @description Método inteligente que determina automáticamente el tipo de respuesta a formatear
   * @param {Object|Array} rows - Respuesta cruda de PostgreSQL
   * @param {string} [titleSuccess='Completado'] - Título para respuestas exitosas
   * @param {string} [titleError='Error'] - Título para respuestas de error
   * @returns {Object} Respuesta formateada según el tipo de resultado
   * @throws {Error} Si la respuesta indica un error explícito
   */
  static respuestaPostgres(rows, titleSuccess = "Completado") {
    try {
      const resultado = this.validacionesComunes(rows);

  static async obtenerConFiltros(filtros) {
    const { dedicacion, categoria, ubicacion, area, fecha, genero } = filtros;
    const query = "SELECT * FROM mostrar_profesor($1, $2, $3, $4, $5, $6)";
    const params = [dedicacion, categoria, ubicacion, area, fecha, genero];
    return this.ejecutarQuery(query, params, "Profesores filtrados correctamente");
  }

      return {
        status: resultado.status_code || 200,
        state: "success",
        title: titleSuccess,
        message: resultado.message || "Se obtuvieron los datos",
        data: resultado,
      };
    } catch (error) {
      throw error;
    }
  }
}
