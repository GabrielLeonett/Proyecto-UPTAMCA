// Importación de la conexión a la base de datos
import db from "../db.js";

// Importación de clase para formateo de respuestas
import FormatResponseModel from "../utils/FormatResponseModel.js";

/**
 * @class CurricularModel
 * @description Modelo para gestionar las operaciones relacionadas con PNFs (Programas Nacionales de Formación)
 * y Unidades Curriculares en la base de datos.
 * Utiliza procedimientos almacenados para las operaciones de registro.
 */
export default class CurricularModel {
  /**
   * @static
   * @async
   * @method registrarPNF
   * @description Registra un nuevo Programa Nacional de Formación (PNF) en la base de datos
   * @param {Object} params - Objeto con los datos del PNF
   * @param {Object} params.datos - Datos del PNF a registrar
   * @param {string} params.datos.nombre_pnf - Nombre del PNF
   * @param {string} params.datos.descripcion - Descripción del PNF
   * @param {string} params.datos.ubicacionPNF - Ubicacion donde estara el PNF
   * @param {string} params.datos.codigoPNF - Código único del PNF
   * @param {object} usuario_accion - Objeto que contiene datos del usuario que realiza la accion
   * @returns {Promise<Object>} Objeto con el resultado de la operación
   * @property {string} message - Mensaje descriptivo del resultado
   * @property {boolean} success - Indica si la operación fue exitosa
   * @throws {string} Error si falla el registro
   */
  static async registrarPNF({ datos, usuario_accion }) {
    try {
      //Desestructuracion de los datos para el registro del pnf
      const { nombrePNF, descripcionPNF, codigoPNF, sedePNF } = datos;

      const query = `CALL public.registrar_pnf_completo(?, ?, ?, ?, ?, NULL)`;

      const param = [
        usuario_accion.id,
        nombrePNF,
        descripcionPNF,
        codigoPNF,
        sedePNF,
      ];

      const { rows } = await db.raw(query, param);

      return FormatResponseModel.respuestaPostgres(
        rows,
        "PNF registrado exitosamente."
      );
    } catch (error) {
      error.details = {
        path: "CurricularModel.registrarPNF",
      };
      throw FormatResponseModel.respuestaError(
        error,
        "Error al registrar el PNF"
      );
    }
  }

  /**
   * @static
   * @async
   * @method registrarUnidadCurricular
   * @description Registra una nueva Unidad Curricular en la base de datos
   * @param {Object} params - Objeto con los datos de la Unidad Curricular
   * @param {Object} params.datos - Datos de la Unidad Curricular
   * @param {number} params.datos.id_trayecto - ID del trayecto al que pertenece
   * @param {string} params.datos.nombre_unidad - Nombre de la unidad curricular
   * @param {string} params.datos.descripcion_unidad - Descripción de la unidad
   * @param {number} params.datos.carga_horas_unidad - Carga horaria en horas
   * @param {string} params.datos.codigo_unidad - Código único de la unidad
   * @param {object} usuario_accion - Objeto que contiene datos del usuario que realiza la accion
   * @returns {Promise<Object>} Objeto con el resultado de la operación
   * @property {string} message - Mensaje descriptivo del resultado
   * @property {boolean} success - Indica si la operación fue exitosa
   * @throws {string} Error si falla el registro
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

      const param = [
        usuario_accion.id,
        idTrayecto,
        nombreUnidadCurricular,
        descripcionUnidadCurricular,
        cargaHorasAcademicas,
        codigoUnidadCurricular,
      ];

      const { rows } = await db.raw(query, param);

      return FormatResponseModel.respuestaPostgres(
        rows,
        "Unidad Curricular registrada",
        "Error al registrar la Unidad Curricular"
      );
    } catch (error) {
      error.details = {
        path: "CurricularModel.registrarUnidadCurricular",
      };
      throw FormatResponseModel.respuestaError(
        error,
        "Error al registrar la Unidad Curricular"
      );
    }
  }

  /**
   * @static
   * @async
   * @method mostrarPNF
   * @description Obtiene todos los PNFs registrados en la base de datos
   * @returns {Promise<Object>} Objeto con el resultado de la consulta
   * @property {Array} data - Lista de todos los PNFs registrados
   * @property {boolean} success - Indica si la operación fue exitosa
   * @throws {string} Error si falla la consulta
   */
  static async mostrarPNF() {
    try {
      const { rows } = await db.raw(`SELECT * FROM pnfs`);
      return FormatResponseModel.respuestaPostgres(rows, "Estos son Los PNFs");
    } catch (error) {
      error.details = {
        path: "CurricularModel.MostrarPNF",
      };
      throw FormatResponseModel.respuestaError(
        error,
        "Error al obtener los PNFs"
      );
    }
  }

  /**
   * @static
   * @async
   * @method mostrarTrayectos
   * @description Obtiene todos los trayectos con el PNF al que pertenecen
   * @returns {Promise<Object>} Objeto con el resultado de la consulta
   * @property {Array} data - Lista de todos los PNFs registrados
   * @property {boolean} success - Indica si la operación fue exitosa
   * @throws {string} Error si falla la consulta
   */
  static async mostrarTrayectos(codigoPNF) {
    try {
      if (codigoPNF !== undefined && codigoPNF !== "") {
        const { rows } = await db.raw(
          `SELECT 
                t.id_trayecto, 
                t.poblacion_estudiantil, 
                t.valor_trayecto, 
                p.nombre_pnf,
                p.id_pnf
            FROM 
                trayectos t
            JOIN 
                pnfs p ON t.id_pnf = p.id_pnf
            WHERE 
                p.codigo_pnf = ?`,
          [codigoPNF]
        );
        return FormatResponseModel.respuestaPostgres(
          rows,
          "Estos son Los PNFs"
        );
      } else {
        const { rows } = await db.raw(
          `SELECT 
              t.id_trayecto, 
              t.poblacion_estudiantil, 
              t.valor_trayecto, 
              pnfs.nombre_pnf 
          FROM 
            trayectos t 
          JOIN 
            pnfs 
          ON 
              t.id_pnf = pnfs.id_pnf`
        );
        return FormatResponseModel.respuestaPostgres(
          rows,
          "Estos son Los PNFs"
        );
      }
    } catch (error) {
      error.details = {
        path: "CurricularModel.mostrarTrayecto",
      };
      throw FormatResponseModel.respuestaError(
        error,
        "Error al obtener los PNFs"
      );
    }
  }

  /**
   * @static
   * @async
   * @method mostrarSecciones
   * @description Obtiene todos las secciones del trayecto al que pertenecen
   * @returns {Promise<Object>} Objeto con el resultado de la consulta
   * @property {Array} data - Lista de todos los PNFs registrados
   * @property {boolean} success - Indica si la operación fue exitosa
   * @throws {string} Error si falla la consulta
   */
  static async mostrarSecciones(trayecto) {
    try {
      const { rows } = await db.raw(
        `	SELECT 
              s.id_seccion,
              s.valor_seccion,
              s.cupos_disponibles,
              t.nombre_turno
          FROM 
              secciones s
          JOIN 
				      turnos t ON s.id_turno = t.id_turno
          WHERE 
              s.id_trayecto = ?
			    ORDER BY s.id_seccion ASC;`,
        [trayecto]
      );
      return FormatResponseModel.respuestaPostgres(rows, "Estos son Los PNFs");
    } catch (error) {
      error.details = {
        path: "CurricularModel.mostrarTrayecto",
      };
      throw FormatResponseModel.respuestaError(
        error,
        "Error al obtener los PNFs"
      );
    }
  }

  /**
   * @static
   * @async
   * @method mostrarUnidadesCurriculares
   * @description Obtiene todos las secciones del trayecto al que pertenecen
   * @returns {Promise<Object>} Objeto con el resultado de la consulta
   * @property {Array} data - Lista de todos los PNFs registrados
   * @property {boolean} success - Indica si la operación fue exitosa
   * @throws {string} Error si falla la consulta
   */
  static async mostrarUnidadesCurriculares(trayecto) {
    try {
      const { rows } = await db.raw(
        `	SELECT 
              id_unidad_curricular,
              horas_clase,
              nombre_unidad_curricular
          FROM 
              unidades_curriculares
          WHERE
              id_trayecto = ?
			    ORDER BY id_unidad_curricular ASC;`,
        [trayecto]
      );
      return FormatResponseModel.respuestaPostgres(rows, "Estos son Los PNFs");
    } catch (error) {
      error.details = {
        path: "CurricularModel.mostrarTrayecto",
      };
      throw FormatResponseModel.respuestaError(
        error,
        "Error al obtener los PNFs"
      );
    }
  }

  /**
   * @static
   * @async
   * @method CrearSecciones
   * @description Crear las secciones para un trayecto de forma automatica
   * @returns {Promise<Object>} Objeto con el resultado de la consulta
   * @property {Array} data - Lista de todos los PNFs registrados
   * @property {boolean} success - Indica si la operación fue exitosa
   * @throws {string} Error si falla la consulta
   */
  static async CrearSecciones(datos) {
    const { idTrayecto, poblacionEstudiantil } = datos;
    try {
      const { rows } = await db.raw(
        `CALL public.distribuir_estudiantes_secciones(?, ?,NULL)`,
        [idTrayecto, poblacionEstudiantil]
      );
      return FormatResponseModel.respuestaPostgres(
        rows,
        `Estos es el resultado de la creacion de las secciones para el trayecto: ${idTrayecto}`
      );
    } catch (error) {
      error.details = {
        path: "CurricularModel.CrearSecciones",
      };
      throw FormatResponseModel.respuestaError(
        error,
        "Error al obtener los PNFs"
      );
    }
  }

  /**
   * @static
   * @async
   * @method asignacionTurnoSeccion
   * @description Crear las secciones para un trayecto de forma automatica
   * @param {object} usuario_accion Objeto que contiene los datos del usuario
   * @param {object} datos Objeto que contiene los datos para hacer la asignacion
   * @returns {Promise<Object>} Objeto con el resultado de la consulta
   * @throws {string} Error si falla la consulta
   */
  static async asignacionTurnoSeccion(usuario_accion, datos) {
    const { idSeccion, idTurno } = datos;
    try {
      const { rows } = await db.raw(
        `CALL public.asignar_turno_seccion(?, ?, ?,NULL)`,
        [usuario_accion.id, idSeccion, idTurno]
      );
      return FormatResponseModel.respuestaPostgres(
        rows,
        `Se asigno correctamente el turno a la sección.`
      );
    } catch (error) {
      error.details = {
        path: "CurricularModel.asignacionTurnoSeccion",
      };
      throw FormatResponseModel.respuestaError(
        error,
        "Error al obtener los PNFs"
      );
    }
  }
}
