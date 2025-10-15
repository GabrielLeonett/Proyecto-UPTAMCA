// ===========================================================
// Importación de dependencias y conexión a la base de datos
// ===========================================================
import db from "../database/db.js";
import FormatResponseModel from "../utils/FormatResponseModel.js";

/**
 * @class CurricularModel
 * @description Modelo para gestionar las operaciones relacionadas con
 * Programas Nacionales de Formación (PNF), Unidades Curriculares,
 * Trayectos y Secciones en la base de datos.
 * Utiliza procedimientos almacenados y vistas para sus operaciones.
 */
export default class CurricularModel {
  // ===========================================================
  // MÉTODOS DE REGISTRO
  // ===========================================================

  /**
   * @static
   * @async
   * @method registrarPNF
   * @description Registra un nuevo Programa Nacional de Formación (PNF)
   * @param {Object} params - Parámetros del registro
   * @param {Object} params.datos - Datos del PNF a registrar
   * @param {string} params.datos.nombrePNF - Nombre del PNF
   * @param {string} params.datos.descripcionPNF - Descripción del PNF
   * @param {string} params.datos.codigoPNF - Código único del PNF
   * @param {string} params.datos.sedePNF - Sede donde se imparte el PNF
   * @param {Object} usuario_accion - Usuario que ejecuta la acción
   * @returns {Promise<Object>} Resultado del registro
   */
  static async registrarPNF({ datos, usuario_accion }) {
    try {
      const { nombrePNF, descripcionPNF, codigoPNF, sedePNF } = datos;

      const query = `CALL public.registrar_pnf_completo(?, ?, ?, ?, ?, NULL)`;
      const params = [
        usuario_accion.id,
        nombrePNF,
        descripcionPNF,
        codigoPNF,
        sedePNF,
      ];

      const { rows } = await db.raw(query, params);

      return FormatResponseModel.respuestaPostgres(
        rows,
        "PNF registrado exitosamente."
      );
    } catch (error) {
      error.details = { path: "CurricularModel.registrarPNF" };
      throw FormatResponseModel.respuestaError(error, "Error al registrar el PNF");
    }
  }

  /**
   * @static
   * @async
   * @method registrarUnidadCurricular
   * @description Registra una nueva Unidad Curricular
   * @param {Object} params - Parámetros del registro
   * @param {Object} params.datos - Datos de la Unidad Curricular
   * @param {number} params.datos.idTrayecto - ID del trayecto al que pertenece
   * @param {string} params.datos.nombreUnidadCurricular - Nombre de la unidad curricular
   * @param {string} params.datos.descripcionUnidadCurricular - Descripción de la unidad
   * @param {number} params.datos.cargaHorasAcademicas - Carga horaria total
   * @param {string} params.datos.codigoUnidadCurricular - Código único de la unidad
   * @param {Object} usuario_accion - Usuario que realiza la acción
   * @returns {Promise<Object>} Resultado del registro
   */
  static async registrarUnidadCurricular({ datos, usuario_accion }) {
    try {
      const {
        idTrayecto,
        nombreUnidadCurricular,
        descripcionUnidadCurricular,
        cargaHorasAcademicas,
        codigoUnidadCurricular,
      } = datos;

      const query = `CALL public.registrar_unidad_curricular_completo(?, ?, ?, ?, ?, ?, NULL)`;
      const params = [
        usuario_accion.id,
        idTrayecto,
        nombreUnidadCurricular,
        descripcionUnidadCurricular,
        cargaHorasAcademicas,
        codigoUnidadCurricular,
      ];

      const { rows } = await db.raw(query, params);

      return FormatResponseModel.respuestaPostgres(
        rows,
        "Unidad Curricular registrada exitosamente."
      );
    } catch (error) {
      error.details = { path: "CurricularModel.registrarUnidadCurricular" };
      throw FormatResponseModel.respuestaError(
        error,
        "Error al registrar la Unidad Curricular"
      );
    }
  }

  // ===========================================================
  // MÉTODOS DE CONSULTA
  // ===========================================================

  /**
   * @static
   * @async
   * @method mostrarPNF
   * @description Obtiene todos los PNFs registrados
   * @returns {Promise<Object>} Resultado de la consulta
   */
  static async mostrarPNF() {
    try {
      const { rows } = await db.raw(`SELECT * FROM public.vista_pnfs`);
      return FormatResponseModel.respuestaPostgres(rows, "Listado de PNFs obtenidos.");
    } catch (error) {
      error.details = { path: "CurricularModel.mostrarPNF" };
      throw FormatResponseModel.respuestaError(error, "Error al obtener los PNFs");
    }
  }

  /**
   * @static
   * @async
   * @method mostrarTrayectos
   * @description Obtiene trayectos y su relación con el PNF
   * @param {string} [codigoPNF] - Código del PNF para filtrar (opcional)
   * @returns {Promise<Object>} Resultado de la consulta
   */
  static async mostrarTrayectos(codigoPNF) {
    try {
      let rows;
      if (codigoPNF) {
        ({ rows } = await db.raw(
          `
          SELECT 
            t.id_trayecto, 
            t.poblacion_estudiantil, 
            t.valor_trayecto, 
            p.nombre_pnf,
            p.id_pnf
          FROM trayectos t
          JOIN pnfs p ON t.id_pnf = p.id_pnf
          WHERE p.codigo_pnf = ?`,
          [codigoPNF]
        ));
      } else {
        ({ rows } = await db.raw(`
          SELECT 
            t.id_trayecto, 
            t.poblacion_estudiantil, 
            t.valor_trayecto, 
            p.nombre_pnf 
          FROM trayectos t
          JOIN pnfs p ON t.id_pnf = p.id_pnf
        `));
      }

      return FormatResponseModel.respuestaPostgres(rows, "Trayectos obtenidos correctamente.");
    } catch (error) {
      error.details = { path: "CurricularModel.mostrarTrayectos" };
      throw FormatResponseModel.respuestaError(error, "Error al obtener los trayectos");
    }
  }

  /**
   * @static
   * @async
   * @method mostrarSecciones
   * @description Obtiene las secciones pertenecientes a un trayecto
   * @param {number} trayecto - ID del trayecto
   * @returns {Promise<Object>} Resultado de la consulta
   */
  static async mostrarSecciones(trayecto) {
    try {
      const { rows } = await db.raw(
        `
        SELECT 
          s.id_seccion,
          s.valor_seccion,
          s.cupos_disponibles,
          t.nombre_turno
        FROM secciones s
        JOIN turnos t ON s.id_turno = t.id_turno
        WHERE s.id_trayecto = ?
        ORDER BY s.id_seccion ASC;
        `,
        [trayecto]
      );

      return FormatResponseModel.respuestaPostgres(rows, "Secciones obtenidas correctamente.");
    } catch (error) {
      error.details = { path: "CurricularModel.mostrarSecciones" };
      throw FormatResponseModel.respuestaError(error, "Error al obtener las secciones");
    }
  }

  /**
   * @static
   * @async
   * @method mostrarUnidadesCurriculares
   * @description Obtiene las unidades curriculares asociadas a un trayecto
   * @param {number} trayecto - ID del trayecto
   * @returns {Promise<Object>} Resultado de la consulta
   */
  static async mostrarUnidadesCurriculares(trayecto) {
    try {
      const { rows } = await db.raw(
        `
        SELECT 
          id_unidad_curricular,
          horas_clase,
          nombre_unidad_curricular, 
          descripcion_unidad_curricular,
          codigo_unidad
        FROM unidades_curriculares
        WHERE id_trayecto = ?
        ORDER BY id_unidad_curricular ASC;
        `,
        [trayecto]
      );

      return FormatResponseModel.respuestaPostgres(
        rows,
        "Unidades curriculares obtenidas correctamente."
      );
    } catch (error) {
      error.details = { path: "CurricularModel.mostrarUnidadesCurriculares" };
      throw FormatResponseModel.respuestaError(error, "Error al obtener las unidades curriculares");
    }
  }

  // ===========================================================
  // MÉTODOS DE ASIGNACIÓN Y GESTIÓN
  // ===========================================================

  /**
   * @static
   * @async
   * @method CrearSecciones
   * @description Crea automáticamente las secciones de un trayecto según la población estudiantil
   * @param {Object} datos - Datos para la creación
   * @param {number} datos.idTrayecto - ID del trayecto
   * @param {number} datos.poblacionEstudiantil - Cantidad de estudiantes
   * @returns {Promise<Object>} Resultado de la creación
   */
  static async CrearSecciones(datos) {
    try {
      const { idTrayecto, poblacionEstudiantil } = datos;
      const { rows } = await db.raw(
        `CALL public.distribuir_estudiantes_secciones(?, ?, NULL)`,
        [idTrayecto, poblacionEstudiantil]
      );

      return FormatResponseModel.respuestaPostgres(
        rows,
        `Secciones creadas correctamente para el trayecto ${idTrayecto}.`
      );
    } catch (error) {
      error.details = { path: "CurricularModel.CrearSecciones" };
      throw FormatResponseModel.respuestaError(error, "Error al crear las secciones");
    }
  }

  /**
   * @static
   * @async
   * @method asignacionTurnoSeccion
   * @description Asigna un turno a una sección específica
   * @param {Object} usuario_accion - Usuario que ejecuta la acción
   * @param {Object} datos - Datos de asignación
   * @param {number} datos.idSeccion - ID de la sección
   * @param {number} datos.idTurno - ID del turno
   * @returns {Promise<Object>} Resultado de la asignación
   */
  static async asignacionTurnoSeccion(usuario_accion, datos) {
    try {
      const { idSeccion, idTurno } = datos;
      const { rows } = await db.raw(
        `CALL public.asignar_turno_seccion(?, ?, ?, NULL)`,
        [usuario_accion.id, idSeccion, idTurno]
      );

      return FormatResponseModel.respuestaPostgres(
        rows,
        "Turno asignado correctamente a la sección."
      );
    } catch (error) {
      error.details = { path: "CurricularModel.asignacionTurnoSeccion" };
      throw FormatResponseModel.respuestaError(error, "Error al asignar el turno a la sección");
    }
  }
}
