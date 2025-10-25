// ===========================================================
// Importación de dependencias y conexión a la base de datos
// ===========================================================
import pg from "../database/pg.js";
import FormatterResponseModel from "../utils/FormatterResponseModel.js";

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
   * @param {number} usuario_accion - Usuario que ejecuta la acción
   * @returns {Promise<Object>} Resultado del registro
   */
  static async registrarPNF(datos, usuario_accion) {
    try {
      console.log("Datos para registrar PNF:", datos);
      const {
        nombrePNF,
        descripcionPNF,
        codigoPNF,
        duracionTrayectosPNF,
        sedePNF,
      } = datos;

      const query = `CALL public.registrar_pnf_completo($1, $2, $3, $4, $5, $6, NULL)`;
      const params = [
        usuario_accion,
        nombrePNF,
        descripcionPNF,
        codigoPNF,
        sedePNF,
        duracionTrayectosPNF,
      ];

      const { rows } = await pg.query(query, params);

      return FormatterResponseModel.respuestaPostgres(
        rows,
        "PNF registrado exitosamente."
      );
    } catch (error) {
      error.details = { path: "CurricularModel.registrarPNF" };
      throw FormatterResponseModel.respuestaError(
        error,
        "Error al registrar el PNF"
      );
    }
  }
  /**
   * @static
   * @async
   * @method actualizarPNF
   * @description Actualizar un PNF existente usando el procedimiento almacenado
   * @param {number} idPNF - ID del PNF
   * @param {Object} datos - Datos actualizados
   * @param {number} usuarioId - ID del usuario que realiza la acción
   * @returns {Object} Resultado de la operación
   */
  static async actualizarPNF(idPNF, datos, usuarioId) {
    try {
      const query = `
      CALL actualizar_pnf_completo_o_parcial(
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
      )
    `;

      const valores = [
        null, // p_resultado (OUT parameter)
        usuarioId,
        idPNF,
        datos.codigoPNF || null,
        datos.nombrePNF || null,
        datos.descripcionPNF || null,
        datos.duracionTrayectosPNF || null,
        datos.poblacionEstudiantilPNF || null,
        datos.sedePNF || null,
        datos.activo || null,
      ];

      const { rows } = await pg.query(query, valores);

      return FormatterResponseModel.respuestaPostgres(
        rows,
        "PNF actualizado exitosamente."
      );
    } catch (error) {
      error.details = { path: "CurricularModel.actualizarPNF" };
      throw FormatterResponseModel.respuestaError(
        error,
        "Error al actualizar el PNF"
      );
    }
  }

  /**
   * @static
   * @async
   * @method actualizarDescripcionTrayecto
   * @description Actualizar la descripción de un trayecto usando el procedimiento almacenado
   * @param {number} idTrayecto - ID del trayecto
   * @param {string} descripcion - Nueva descripción
   * @param {number} usuarioId - ID del usuario que realiza la acción
   * @returns {Object} Resultado de la operación
   */
  static async actualizarDescripcionTrayecto(
    idTrayecto,
    descripcion,
    usuarioId
  ) {
    try {
      console.log("📊 [Model] Actualizando descripción del trayecto:", {
        idTrayecto,
        usuarioId,
      });

      const query = `
        CALL actualizar_descripcion_trayecto($1, $2, $3, $4)
      `;

      const valores = [
        null, // p_resultado (OUT parameter)
        usuarioId,
        idTrayecto,
        descripcion,
      ];

      const { rows } = await pg.query(query, valores);

      return FormatterResponseModel.respuestaPostgres(
        rows,
        "Unidad Curricular registrada exitosamente."
      );
    } catch (error) {
      error.details = { path: "CurricularModel.registrarUnidadCurricular" };
      throw FormatterResponseModel.respuestaError(
        error,
        "Error al registrar la Unidad Curricular"
      );
    }
  }

  /**
   * @static
   * @async
   * @method registrarUnidadCurricular
   * @description Registra una nueva Unidad Curricular
   * @param {Object} params - Parámetros del registro
   * @param {Object} params.datos - Datos de la Unidad Curricular
   * @param {number} idTrayecto - ID del trayecto al que pertenece
   * @param {string} params.datos.nombreUnidadCurricular - Nombre de la unidad curricular
   * @param {string} params.datos.descripcionUnidadCurricular - Descripción de la unidad
   * @param {number} params.datos.cargaHorasAcademicas - Carga horaria total
   * @param {string} params.datos.codigoUnidadCurricular - Código único de la unidad
   * @param {number} usuario_accion - Usuario que realiza la acción
   * @returns {Promise<Object>} Resultado del registro
   */
  static async registrarUnidadCurricular(idTrayecto, datos, usuario_accion) {
    try {
      console.log("Datos para registrar Unidad Curricular:", datos);
      const {
        nombreUnidadCurricular,
        descripcionUnidadCurricular,
        cargaHorasAcademicas,
        codigoUnidadCurricular,
      } = datos;

      const query = `CALL public.registrar_unidad_curricular_completo($1, $2, $3, $4, $5, $6, NULL)`;
      const params = [
        usuario_accion,
        idTrayecto,
        nombreUnidadCurricular,
        descripcionUnidadCurricular,
        cargaHorasAcademicas,
        codigoUnidadCurricular,
      ];

      const { rows } = await pg.query(query, params);

      return FormatterResponseModel.respuestaPostgres(
        rows,
        "Unidad Curricular registrada exitosamente."
      );
    } catch (error) {
      error.details = { path: "CurricularModel.registrarUnidadCurricular" };
      throw FormatterResponseModel.respuestaError(
        error,
        "Error al registrar la Unidad Curricular"
      );
    }
  }
  /**
   * @static
   * @async
   * @method actualizarUnidadCurricular
   * @description Actualizar una Unidad Curricular usando el procedimiento almacenado
   * @param {number} idUnidadCurricular - ID de la unidad curricular
   * @param {Object} datos - Datos de actualización
   * @param {string} [datos.codigo_unidad] - Nuevo código de la unidad
   * @param {string} [datos.nombre_unidad_curricular] - Nuevo nombre de la unidad
   * @param {string} [datos.descripcion_unidad_curricular] - Nueva descripción
   * @param {number} [datos.horas_clase] - Nuevas horas de clase
   * @param {number} [datos.id_trayecto] - Nuevo ID del trayecto
   * @param {number} usuarioId - ID del usuario que realiza la acción
   * @returns {Object} Resultado de la operación
   */
  static async actualizarUnidadCurricular(
    idUnidadCurricular,
    datos,
    usuarioId
  ) {
    try {
      console.log("📊 [Model] Actualizando unidad curricular:", {
        idUnidadCurricular,
        datos,
        usuarioId,
      });

      const query = `
        CALL actualizar_unidad_curricular_completa_o_parcial(
          $1, $2, $3, $4, $5, $6, $7, $8
        )
      `;

      const valores = [
        null, // p_resultado (OUT parameter)
        usuarioId,
        idUnidadCurricular,
        datos.codigo_unidad || null,
        datos.nombre_unidad_curricular || null,
        datos.descripcion_unidad_curricular || null,
        datos.horas_clase || null,
        datos.id_trayecto || null,
      ];

      const { rows } = await pg.query(query, valores);

      return FormatterResponseModel.respuestaPostgres(
        rows,
        "Unidad Curricular actualizada exitosamente."
      );
    } catch (error) {
      console.error("💥 Error en modelo actualizar unidad curricular:", error);
      error.details = { path: "CurricularModel.actualizarUnidadCurricular" };
      throw FormatterResponseModel.respuestaError(
        error,
        "Error al actualizar la Unidad Curricular"
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
      const { rows } = await pg.query(`SELECT * FROM public.vista_pnfs`);
      return FormatterResponseModel.respuestaPostgres(
        rows,
        "Listado de PNFs obtenidos."
      );
    } catch (error) {
      error.details = { path: "CurricularModel.mostrarPNF" };
      throw FormatterResponseModel.respuestaError(
        error,
        "Error al obtener los PNFs"
      );
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
        ({ rows } = await pg.query(
          `
          SELECT 
            t.id_trayecto, 
            t.poblacion_estudiantil, 
            t.valor_trayecto,
            t.descripcion_trayecto, 
            p.nombre_pnf,
            p.id_pnf,
            p.codigo_pnf
          FROM trayectos t
          JOIN pnfs p ON t.id_pnf = p.id_pnf
          WHERE p.codigo_pnf = $1 AND t.activo = true AND p.activo = true
          ORDER BY t.valor_trayecto ASC`,
          [codigoPNF]
        ));
      } else {
        ({ rows } = await pg.query(`
          SELECT 
            t.id_trayecto, 
            t.poblacion_estudiantil, 
            t.valor_trayecto,
            t.descripcion_trayecto, 
            p.nombre_pnf,
            p.id_pnf,
            p.codigo_pnf
          FROM trayectos t
          JOIN pnfs p ON t.id_pnf = p.id_pnf
          WHERE t.activo = true AND p.activo = true
          ORDER BY p.nombre_pnf, t.valor_trayecto ASC
        `));
      }
      console.log("📊 [Model] Trayectos obtenidos:", rows);

      return FormatterResponseModel.respuestaPostgres(
        rows,
        "Trayectos obtenidos correctamente."
      );
    } catch (error) {
      error.details = { path: "CurricularModel.mostrarTrayectos" };
      throw FormatterResponseModel.respuestaError(
        error,
        "Error al obtener los trayectos"
      );
    }
  }

  /**
   * @static
   * @async
   * @method mostrarSeccionesByPnfAndValueTrayecto
   * @description Obtiene secciones por PNF y valor de trayecto
   * @param {string} codigoPNF - Código del PNF para filtrar
   * @param {string|number} valorTrayecto - Valor del trayecto para filtrar
   * @returns {Promise<Object>} Resultado de la consulta
   */
  static async mostrarSeccionesByPnfAndValueTrayecto(codigoPNF, valorTrayecto) {
    try {
      console.log("📊 [Model] Obteniendo secciones...", {
        codigoPNF,
        valorTrayecto,
      });

      const { rows } = await pg.query(
        `
      SELECT 
        s.id_seccion,
        s.valor_seccion,
        s.cupos_disponibles,
        t.nombre_turno,
        s.id_trayecto,
        tr.valor_trayecto as trayecto_valor,
        p.codigo_pnf,
        p.nombre_pnf
      FROM secciones s
      LEFT JOIN turnos t ON s.id_turno = t.id_turno
      INNER JOIN trayectos tr ON s.id_trayecto = tr.id_trayecto
      INNER JOIN pnfs p ON tr.id_pnf = p.id_pnf
      WHERE p.codigo_pnf = $1 AND tr.valor_trayecto = $2
      ORDER BY s.valor_seccion ASC;
      `,
        [codigoPNF, valorTrayecto]
      );

      console.log(`📊 [Model] ${rows.length} secciones obtenidas`);

      return FormatterResponseModel.respuestaPostgres(
        rows,
        "Secciones obtenidas correctamente."
      );
    } catch (error) {
      console.error("❌ Error en modelo mostrar secciones:", error);
      error.details = {
        path: "CurricularModel.mostrarSeccionesByPnfAndValueTrayecto",
        codigoPNF,
        valorTrayecto,
      };
      throw FormatterResponseModel.respuestaError(
        error,
        "Error al obtener las secciones"
      );
    }
  }

  /**
   * @static
   * @async
   * @method mostrarSeccionesByPnfAndValueUnidadCurricular
   * @description Obtiene unidades curriculares por PNF y valor de trayecto
   * @param {string} codigoPNF - Código del PNF para filtrar
   * @param {string|number} valorTrayecto - Valor del trayecto para filtrar
   * @returns {Promise<Object>} Resultado de la consulta
   */
  static async mostrarSeccionesByPnfAndValueUnidadCurricular(
    codigoPNF,
    valorTrayecto
  ) {
    try {
      console.log("📊 [Model] Obteniendo unidades curriculares...", {
        codigoPNF,
        valorTrayecto,
      });

      const { rows } = await pg.query(
        `
      SELECT 
        uc.nombre_unidad_curricular,
        uc.codigo_unidad,
        uc.horas_clase,
        tr.valor_trayecto as trayecto_valor,
        p.codigo_pnf,
        p.nombre_pnf
      FROM unidades_curriculares uc
      INNER JOIN trayectos tr ON uc.id_trayecto = tr.id_trayecto
      INNER JOIN pnfs p ON tr.id_pnf = p.id_pnf
      WHERE p.codigo_pnf = $1 AND tr.valor_trayecto = $2
      ORDER BY uc.id_unidad_curricular ASC;
      `,
        [codigoPNF, valorTrayecto]
      );
      console.log(
        "Se filtro por el siguiente codigo PNF: " +
          codigoPNF +
          " y su trayecto:" +
          valorTrayecto
      );
      console.log(rows)

      console.log(`📊 [Model] ${rows.length} unidades curriculares obtenidas`);

      return FormatterResponseModel.respuestaPostgres(
        rows,
        "Secciones obtenidas correctamente."
      );
    } catch (error) {
      console.error("❌ Error en modelo mostrar unidades curriculares:", error);
      error.details = {
        path: "CurricularModel.mostrarSeccionesByPnfAndValueUnidadCurricular",
        codigoPNF,
        valorTrayecto,
      };
      throw FormatterResponseModel.respuestaError(
        error,
        "Error al obtener las unidades curriculares"
      );
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
      const { rows } = await pg.query(
        `
        SELECT 
          s.id_seccion,
          s.valor_seccion,
          s.cupos_disponibles,
          t.nombre_turno,
          s.id_trayecto
        FROM secciones s
        LEFT JOIN turnos t ON s.id_turno = t.id_turno
        WHERE s.id_trayecto = $1
        ORDER BY s.valor_seccion ASC;
        `,
        [trayecto]
      );

      return FormatterResponseModel.respuestaPostgres(
        rows,
        "Secciones obtenidas correctamente."
      );
    } catch (error) {
      error.details = { path: "CurricularModel.mostrarSecciones" };
      throw FormatterResponseModel.respuestaError(
        error,
        "Error al obtener las secciones"
      );
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
      const { rows } = await pg.query(
        `
        SELECT 
          id_unidad_curricular,
          horas_clase,
          nombre_unidad_curricular, 
          descripcion_unidad_curricular,
          codigo_unidad,
          id_trayecto
        FROM unidades_curriculares
        WHERE id_trayecto = $1
        ORDER BY nombre_unidad_curricular ASC;
        `,
        [trayecto]
      );

      return FormatterResponseModel.respuestaPostgres(
        rows,
        "Unidades curriculares obtenidas correctamente."
      );
    } catch (error) {
      error.details = { path: "CurricularModel.mostrarUnidadesCurriculares" };
      throw FormatterResponseModel.respuestaError(
        error,
        "Error al obtener las unidades curriculares"
      );
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
   * @param {number} idTrayecto - ID del trayecto
   * @param {Object} datos - Datos para la creación
   * @param {number} datos.poblacionEstudiantil - Cantidad de estudiantes
   * @param {Object} usuario_accion - Usuario que realiza la acción
   * @returns {Promise<Object>} Resultado de la creación
   */
  static async CrearSecciones(idTrayecto, datos) {
    try {
      const { poblacionEstudiantil } = datos;
      const query = `CALL public.distribuir_estudiantes_secciones($1, $2, NULL)`;
      const params = [idTrayecto, poblacionEstudiantil];

      const { rows } = await pg.query(query, params);

      return FormatterResponseModel.respuestaPostgres(
        rows,
        `Secciones creadas correctamente para el trayecto ${idTrayecto}.`
      );
    } catch (error) {
      error.details = { path: "CurricularModel.CrearSecciones" };
      throw FormatterResponseModel.respuestaError(
        error,
        "Error al crear las secciones"
      );
    }
  }

  /**
   * @static
   * @async
   * @method asignacionTurnoSeccion
   * @description Asigna un turno a una sección específica
   * @param {number} idSeccion - ID de la sección
   * @param {number} idTurno - ID del turno
   * @param {Object} usuario_accion - Usuario que ejecuta la acción
   * @returns {Promise<Object>} Resultado de la asignación
   */
  static async asignacionTurnoSeccion(idSeccion, idTurno, usuario_accion) {
    try {
      console.log(
        "idSeccion:",
        idSeccion,
        "idTurno:",
        idTurno,
        "usuario_accion:",
        usuario_accion.id
      );
      const query = `CALL public.asignar_turno_seccion($1, $2, $3, NULL)`;
      const params = [usuario_accion.id, idSeccion, idTurno];

      const { rows } = await pg.query(query, params);

      return FormatterResponseModel.respuestaPostgres(
        rows,
        "Turno asignado correctamente a la sección."
      );
    } catch (error) {
      console.log(error);
      error.details = { path: "CurricularModel.asignacionTurnoSeccion" };
      throw FormatterResponseModel.respuestaError(
        error,
        "Error al asignar el turno a la sección"
      );
    }
  }

  /**
   * @static
   * @async
   * @method mostrarTurnos
   * @description Obtiene todos los turnos disponibles
   * @returns {Promise<Object>} Resultado de la consulta
   */
  static async mostrarTurnos() {
    try {
      const { rows } = await pg.query(`
        SELECT 
          id_turno,
          nombre_turno,
          descripcion_turno
        FROM turnos
        ORDER BY id_turno ASC;
      `);

      return FormatterResponseModel.respuestaPostgres(
        rows,
        "Turnos obtenidos correctamente."
      );
    } catch (error) {
      error.details = { path: "CurricularModel.mostrarTurnos" };
      throw FormatterResponseModel.respuestaError(
        error,
        "Error al obtener los turnos"
      );
    }
  }
}
