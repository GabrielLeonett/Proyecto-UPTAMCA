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
   * @param {string} params.datos.nombre_pnf - Nombre del PNF
   * @param {string} params.datos.descripcion_pnf - Descripción del PNF
   * @param {string} params.datos.codigo_pnf - Código único del PNF
   * @param {string} params.datos.sede_pnf - Sede donde se imparte el PNF
   * @param {number} usuario_accion - Usuario que ejecuta la acción
   * @returns {Promise<Object>} Resultado del registro
   */
  static async registrarPNF(datos, usuario_accion) {
    try {
      console.log("Datos para registrar PNF:", datos);
      const {
        nombre_pnf,
        descripcion_pnf,
        codigo_pnf,
        duracion_trayectos_pnf,
        sede_pnf,
      } = datos;

      const query = `CALL public.registrar_pnf_completo($1, $2, $3, $4, $5, $6, NULL)`;
      const params = [
        usuario_accion,
        nombre_pnf,
        descripcion_pnf,
        codigo_pnf,
        sede_pnf,
        duracion_trayectos_pnf,
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
        datos.codigo_pnf || null,
        datos.nombre_pnf || null,
        datos.descripcion_pnf || null,
        datos.duracion_trayectos || null,
        datos.poblacion_estudiantil_pnf || null,
        datos.id_sede || null,
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
   * @param {string} params.datos.nombre_unidad_curricular - Nombre de la unidad curricular
   * @param {string} params.datos.descripcion_unidad_curricular - Descripción de la unidad
   * @param {number} params.datos.carga_horas_academicas - Carga horaria total
   * @param {string} params.datos.codigo_unidad_curricular - Código único de la unidad
   * @param {Array<number>} params.datos.areas_conocimiento - Array de IDs de áreas de conocimiento
   * @param {number} usuario_accion - Usuario que realiza la acción
   * @returns {Promise<Object>} Resultado del registro
   */
  static async registrarUnidadCurricular(idTrayecto, datos, usuario_accion) {
    try {
      console.log("Datos para registrar Unidad Curricular:", idTrayecto ,datos);
      const {
        nombre_unidad_curricular,
        codigo_unidad_curricular,
        tipo_unidad,
        descripcion_unidad_curricular,
        carga_horas_academicas,
        creditos,
        semanas,
        areas_conocimiento = [],
        lineas_investigacion = [],
        sinoptico = null,
        id_linea_investigacion = null,
        hte = 0,
        hse = 0,
        hta = 0,
        hsa = 0,
        hti = 0,
        hsi = 0,
      } = datos;

      // Validar que areas_conocimiento sea un array
      if (!Array.isArray(areas_conocimiento)) {
        throw new Error("El parámetro areas_conocimiento debe ser un array");
      }

      // Validar que lineas_investigacion sea un array
      if (!Array.isArray(lineas_investigacion)) {
        throw new Error("El parámetro lineas_investigacion debe ser un array");
      }

      // Convertir areas_conocimiento a array de números
      const areasConocimientoArray = areas_conocimiento.map((area) =>
        Number(area.id_area_conocimiento || area)
      );

      // Convertir lineas_investigacion a array de números
      // Maneja tanto objetos como IDs directos
      const lineasInvestigacionArray = lineas_investigacion.map((linea) =>
        Number(linea.id_linea_investigacion || linea)
      );

      // Si el array está vacío, lo convertimos a NULL para PostgreSQL
      const lineasInvestigacionParam =
        lineasInvestigacionArray.length > 0 ? lineasInvestigacionArray : null;

      // --- Consulta a la Función Almacenada ---
      const query = `CALL registrar_unidad_curricular_completo(
      $1,  -- p_usuario_accion
      $2,  -- p_id_trayecto
      $3,  -- p_nombre_unidad_curricular
      $4,  -- p_descripcion_unidad_curricular
      $5,  -- p_carga_horas
      $6,  -- p_codigo_unidad
      $7,  -- p_areas_conocimiento (integer[])
      $8,  -- p_lineas_investigacion (integer[]) - AHORA EN POSICIÓN CORRECTA
      $9,  -- p_sinoptico (text)
      $10, -- p_id_linea_investigacion (bigint)
      $11, -- p_creditos (smallint)
      $12, -- p_semanas (smallint)
      $13, -- p_tipo_unidad (character varying)
      $14, -- p_hte (numeric)
      $15, -- p_hse (numeric)
      $16, -- p_hta (numeric)
      $17, -- p_hsa (numeric)
      $18, -- p_hti (numeric)
      $19, -- p_hsi (numeric)
      $20  -- p_resultado (OUT parameter)
    )`;

      // --- Array de Parámetros ---
      const params = [
        usuario_accion, // $1
        idTrayecto, // $2
        nombre_unidad_curricular, // $3
        descripcion_unidad_curricular, // $4
        carga_horas_academicas, // $5
        codigo_unidad_curricular, // $6
        areasConocimientoArray, // $7
        lineasInvestigacionParam, // $8 - AHORA EN POSICIÓN CORRECTA
        sinoptico, // $9
        id_linea_investigacion, // $10
        creditos, // $11
        semanas, // $12
        tipo_unidad, // $13
        hte, // $14
        hse, // $15
        hta, // $16
        hsa, // $17
        hti, // $18
        hsi, // $19
        null, // $20 - Para el parámetro OUT
      ];

      console.log("Parámetros para el procedimiento:", params);

      // Ejecutar el procedimiento
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
   * @method registrarLineasInvestigacion
   * @description Registra una nueva Línea de Investigación
   * @param {Object} datos - Datos de la Línea de Investigación
   * @param {string} datos.nombre_linea_investigacion - Nombre de la línea de investigación
   * @param {string} [datos.descripcion] - Descripción de la línea (opcional)
   * @param {boolean} [datos.activo=true] - Estado activo de la línea (opcional, por defecto true)
   * @param {number} [id_trayecto] - ID del trayecto asociado (opcional)
   * @param {number} usuario_accion - Usuario que realiza la acción
   * @returns {Promise<Object>} Resultado del registro
   */
  static async registrarLineasInvestigacion(datos, usuario_accion) {
    try {
      const {
        nombre_linea_investigacion,
        descripcion = null,
        id_trayecto = null,
      } = datos;

      const query = `CALL public.registrar_linea_investigacion($1, $2, $3, $4, NULL)`;
      const params = [
        usuario_accion,
        nombre_linea_investigacion,
        descripcion,
        id_trayecto,
      ];

      console.log(
        "Parámetros para el procedimiento de línea de investigación:",
        params
      );

      const { rows } = await pg.query(query, params);

      return FormatterResponseModel.respuestaPostgres(
        rows,
        "Línea de investigación registrada exitosamente."
      );
    } catch (error) {
      error.details = { path: "CurricularModel.registrarLineasInvestigacion" };
      throw FormatterResponseModel.respuestaError(
        error,
        "Error al registrar la Línea de Investigación"
      );
    }
  }

  /**
   * @static
   * @async
   * @method mostrarLineasInvestigacion
   * @description Obtiene las líneas de investigación (con opción de filtrar por trayecto)
   * @param {number} [id_trayecto] - ID del trayecto asociado (opcional)
   * @returns {Promise<Object>} Resultado de la consulta
   */
  static async mostrarLineasInvestigacion(id_trayecto = null) {
    try {
      let query;
      let params = [];

      if (id_trayecto) {
        // Si se proporciona un trayecto, obtener líneas asociadas a ese trayecto a través del PNF
        query = `
        SELECT 
          li.id_linea_investigacion,
          li.nombre_linea_investigacion,
          li.descripcion,
          li.activo,
          li.id_pnf,
          li.created_at,
          li.updated_at,
          t.id_trayecto,
          p.nombre_pnf
        FROM lineas_investigacion li
        LEFT JOIN trayectos t ON li.id_pnf = t.id_pnf
        LEFT JOIN pnfs p ON li.id_pnf = p.id_pnf
        WHERE t.id_trayecto = $1
        ORDER BY li.nombre_linea_investigacion
      `;
        params = [id_trayecto];
      } else {
        // Si no se proporciona trayecto, obtener todas las líneas
        query = `
        SELECT 
          li.id_linea_investigacion,
          li.nombre_linea_investigacion,
          li.descripcion,
          li.activo,
          li.id_pnf,
          li.created_at,
          li.updated_at,
          p.nombre_pnf
        FROM lineas_investigacion li
        LEFT JOIN pnfs p ON li.id_pnf = p.id_pnf
        ORDER BY li.nombre_linea_investigacion
      `;
      }

      console.log("🔍 Ejecutando consulta de líneas de investigación:", {
        query,
        params,
      });

      const { rows } = await pg.query(query, params);

      return FormatterResponseModel.respuestaPostgres(
        rows,
        id_trayecto
          ? "Líneas de investigación obtenidas exitosamente para el trayecto especificado"
          : "Todas las líneas de investigación obtenidas exitosamente"
      );
    } catch (error) {
      error.details = { path: "CurricularModel.mostrarLineasInvestigacion" };
      throw FormatterResponseModel.respuestaError(
        error,
        "Error al obtener las líneas de investigación"
      );
    }
  }
  /**
   * @static
   * @async
   * @method actualizarUnidadCurricular
   * @description Actualizar una Unidad Curricular usando el procedimiento almacenado completo
   * @param {number} id_unidad_curricular - ID de la unidad curricular
   * @param {Object} datos - Datos de actualización
   * @param {string} [datos.codigo_unidad_curricular] - Nuevo código de la unidad
   * @param {string} [datos.nombre_unidad_curricular] - Nuevo nombre de la unidad
   * @param {string} [datos.descripcion_unidad_curricular] - Nueva descripción
   * @param {number} [datos.carga_horas_academicas] - Nuevas horas de clase
   * @param {number} [datos.id_trayecto] - Nuevo ID del trayecto
   * @param {boolean} [datos.activo] - Nuevo estado activo/inactivo
   * @param {Array<number>} [datos.areas_conocimiento] - Array de IDs de áreas de conocimiento
   * @param {Array<number>} [datos.lineas_investigacion] - Array de IDs de líneas de investigación
   * @param {string} [datos.tipo_unidad] - Tipo de unidad (Taller, Proyecto, Asignatura, Seminario, Curso)
   * @param {number} [datos.creditos] - Número de créditos
   * @param {number} [datos.semanas] - Duración en semanas
   * @param {number} [datos.hte] - Horas Teóricas Presenciales
   * @param {number} [datos.hse] - Horas Semipresenciales
   * @param {number} [datos.hta] - Horas Trabajo Autónomo
   * @param {number} [datos.hsa] - Horas Servicio/Seminario
   * @param {number} [datos.hti] - Horas Tutoría/Taller
   * @param {number} [datos.hsi] - Horas Seminario Investigación
   * @param {number} usuarioId - ID del usuario que realiza la acción
   * @returns {Object} Resultado de la operación
   */
  static async actualizarUnidadCurricular(
    id_unidad_curricular,
    datos,
    usuarioId
  ) {
    try {
      console.log("📊 [Model] Actualizando unidad curricular:", {
        id_unidad_curricular,
        datos,
        usuarioId,
      });

      // Extraer todos los campos posibles con valores por defecto
      const {
        id_trayecto,
        codigo_unidad_curricular,
        nombre_unidad_curricular,
        descripcion_unidad_curricular,
        carga_horas_academicas,
        activo,
        areas_conocimiento,
        lineas_investigacion,
        tipo_unidad,
        creditos,
        semanas,
        sinoptico,
        hte,
        hse,
        hta,
        hsa,
        hti,
        hsi,
      } = datos;

      // Validar que areas_conocimiento sea un array
      if (areas_conocimiento && !Array.isArray(areas_conocimiento)) {
        console.log(areas_conocimiento);
        throw new Error("El parámetro areas_conocimiento debe ser un array");
      }

      // Validar que lineas_investigacion sea un array
      if (lineas_investigacion && !Array.isArray(lineas_investigacion)) {
        console.log(lineas_investigacion);
        throw new Error("El parámetro lineas_investigacion debe ser un array");
      }

      // Convertir areas_conocimiento a array de números
      const areasConocimientoArray =
        areas_conocimiento?.map((area) =>
          Number(area.id_area_conocimiento || area)
        ) || null;

      // Convertir lineas_investigacion a array de números
      const lineasInvestigacionArray =
        lineas_investigacion?.map((linea) =>
          Number(linea.id_linea_investigacion || linea)
        ) || null;

      // Query actualizada con todos los parámetros
      const query = `
        CALL actualizar_unidad_curricular_completo(
          $1,   -- p_resultado (OUT)
          $2,   -- p_usuario_accion
          $3,   -- p_id_unidad_curricular
          $4,   -- p_id_trayecto
          $5,   -- p_codigo_unidad
          $6,   -- p_nombre_unidad_curricular
          $7,   -- p_descripcion_unidad_curricular
          $8,   -- p_horas_clase
          $9,   -- p_activo
          $10,  -- p_areas_conocimiento
          $11,  -- p_lineas_investigacion
          $12,  -- p_tipo_unidad
          $13,  -- p_creditos
          $14,  -- p_semanas
          $15,  -- p_sinoptico
          $16,  -- p_hte
          $17,  -- p_hse
          $18,  -- p_hta
          $19,  -- p_hsa
          $20,  -- p_hti
          $21   -- p_hsi
        )
      `;

      // Parámetros completos en el orden correcto
      const valores = [
        null, // $1 - p_resultado (OUT parameter)
        usuarioId, // $2 - p_usuario_accion
        id_unidad_curricular, // $3 - p_id_unidad_curricular
        id_trayecto || null, // $4 - p_id_trayecto
        codigo_unidad_curricular || null, // $5 - p_codigo_unidad
        nombre_unidad_curricular || null, // $6 - p_nombre_unidad_curricular
        descripcion_unidad_curricular || null, // $7 - p_descripcion_unidad_curricular
        carga_horas_academicas !== undefined
          ? Number(carga_horas_academicas)
          : null, // $8 - p_horas_clase
        activo !== undefined ? Boolean(activo) : null, // $9 - p_activo
        areasConocimientoArray, // $10 - p_areas_conocimiento
        lineasInvestigacionArray, // $11 - p_lineas_investigacion
        tipo_unidad || null, // $12 - p_tipo_unidad
        creditos !== undefined ? Number(creditos) : null, // $13 - p_creditos
        semanas !== undefined ? Number(semanas) : null, // $14 - p_semanas
        sinoptico || null, // $15 - p_sinoptico
        hte !== undefined ? Number(hte) : null, // $16 - p_hte
        hse !== undefined ? Number(hse) : null, // $17 - p_hse
        hta !== undefined ? Number(hta) : null, // $18 - p_hta
        hsa !== undefined ? Number(hsa) : null, // $19 - p_hsa
        hti !== undefined ? Number(hti) : null, // $20 - p_hti
        hsi !== undefined ? Number(hsi) : null, // $21 - p_hsi
      ];

      console.log("🔍 [Model] Parámetros enviados al procedimiento:", {
        id_unidad_curricular,
        usuario_accion: usuarioId,
        id_trayecto: id_trayecto,
        codigo_unidad: codigo_unidad_curricular,
        nombre_unidad_curricular: nombre_unidad_curricular,
        horas_clase: carga_horas_academicas,
        tipo_unidad: tipo_unidad,
        creditos: creditos,
        semanas: semanas,
        total_areas: areasConocimientoArray?.length,
        total_lineas: lineasInvestigacionArray?.length,
        distribucion_horas: {
          hte: hte,
          hse: hse,
          hta: hta,
          hsa: hsa,
          hti: hti,
          hsi: hsi,
        },
      });

      const { rows } = await pg.query(query, valores);

      return FormatterResponseModel.respuestaPostgres(
        rows,
        "Unidad Curricular actualizada exitosamente."
      );
    } catch (error) {
      console.error("💥 Error en modelo actualizar unidad curricular:", error);
      error.details = {
        path: "CurricularModel.actualizarUnidadCurricular",
        id_unidad_curricular,
        usuarioId,
      };
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
   * @description Obtiene todos los PNFs registrados con filtros opcionales
   * @param {Object} filters - Filtros opcionales
   * @param {number} filters.id_sede - Filtrar por sede
   * @param {boolean} filters.activo - Filtrar por estado activo/inactivo
   * @param {boolean} filters.tiene_coordinador - Filtrar por PNFs con coordinador
   * @param {string} filters.search - Búsqueda por nombre o código
   * @param {string} filters.searchID - Búsqueda por id_pnf
   * @returns {Promise<Object>} Resultado de la consulta
   */
  static async mostrarPNF(filters = {}) {
    try {
      let whereConditions = [];
      let queryParams = [];
      let paramCount = 0;

      // Construir condiciones WHERE dinámicamente con parámetros preparados
      if (filters.id_sede) {
        paramCount++;
        whereConditions.push(`id_sede = $${paramCount}`);
        queryParams.push(filters.id_sede);
      }

      if (filters.activo !== undefined) {
        paramCount++;
        whereConditions.push(`activo = $${paramCount}`);
        queryParams.push(filters.activo);
      }

      if (filters.tiene_coordinador !== undefined) {
        // Corrección: usar alias para evitar conflicto de nombres
        if (filters.tiene_coordinador) {
          whereConditions.push(
            `EXISTS (SELECT 1 FROM coordinadores c WHERE c.id_pnf = vista_pnfs.id_pnf)`
          );
        } else {
          whereConditions.push(
            `NOT EXISTS (SELECT 1 FROM coordinadores c WHERE c.id_pnf = vista_pnfs.id_pnf)`
          );
        }
      }

      if (filters.search) {
        paramCount++;
        whereConditions.push(
          `(nombre_pnf ILIKE $${paramCount} OR codigo_pnf ILIKE $${paramCount})`
        );
        queryParams.push(`%${filters.search}%`);
      }

      if (filters.searchID) {
        paramCount++;
        whereConditions.push(`id_pnf = $${paramCount}`);
        queryParams.push(filters.searchID); // Sin % porque es búsqueda exacta de ID
      }

      // Construir la consulta final
      const whereClause =
        whereConditions.length > 0
          ? `WHERE ${whereConditions.join(" AND ")}`
          : "";

      const query = `
      SELECT * FROM public.vista_pnfs
      ${whereClause}
      ORDER BY nombre_pnf ASC
    `;

      console.log("🔍 Query ejecutada:", query);
      console.log("📊 Parámetros:", queryParams);

      const { rows } = await pg.query(query, queryParams);

      return FormatterResponseModel.respuestaPostgres(
        rows,
        "Listado de PNFs obtenidos exitosamente."
      );
    } catch (error) {
      error.details = {
        path: "CurricularModel.mostrarPNF",
        filters: filters,
      };
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
   * @param {string} [codigo_pnf] - Código del PNF para filtrar (opcional)
   * @returns {Promise<Object>} Resultado de la consulta
   */
  static async mostrarTrayectos(codigo_pnf) {
    try {
      let rows;
      if (codigo_pnf) {
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
          [codigo_pnf]
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
   * @param {string} codigo_pnf - Código del PNF para filtrar
   * @param {string|number} valorTrayecto - Valor del trayecto para filtrar
   * @returns {Promise<Object>} Resultado de la consulta
   */
  static async mostrarSeccionesByPnfAndValueTrayecto(
    codigo_pnf,
    valorTrayecto
  ) {
    try {
      console.log("📊 [Model] Obteniendo secciones...", {
        codigo_pnf,
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
        [codigo_pnf, valorTrayecto]
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
        codigo_pnf,
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
   * @param {string} codigo_pnf - Código del PNF para filtrar
   * @param {string|number} valorTrayecto - Valor del trayecto para filtrar
   * @returns {Promise<Object>} Resultado de la consulta
   */
  static async mostrarSeccionesByPnfAndValueUnidadCurricular(
    codigo_pnf,
    valorTrayecto
  ) {
    try {
      console.log("📊 [Model] Obteniendo unidades curriculares...", {
        codigo_pnf,
        valorTrayecto,
      });

      const { rows } = await pg.query(
        `
      SELECT 
        uc.nombre_unidad_curricular,
        uc.codigo_unidad,
        uc.horas_clase,
        uc.descripcion_unidad_curricular,
        tr.valor_trayecto as trayecto_valor,
        p.codigo_pnf,
        p.nombre_pnf
      FROM unidades_curriculares uc
      INNER JOIN trayectos tr ON uc.id_trayecto = tr.id_trayecto
      INNER JOIN pnfs p ON tr.id_pnf = p.id_pnf
      WHERE p.codigo_pnf = $1 AND tr.valor_trayecto = $2
      ORDER BY uc.id_unidad_curricular ASC;
      `,
        [codigo_pnf, valorTrayecto]
      );
      console.log(
        "Se filtro por el siguiente codigo PNF: " +
          codigo_pnf +
          " y su trayecto:" +
          valorTrayecto
      );
      console.log(rows);

      console.log(`📊 [Model] ${rows.length} unidades curriculares obtenidas`);

      return FormatterResponseModel.respuestaPostgres(
        rows,
        "Secciones obtenidas correctamente."
      );
    } catch (error) {
      console.error("❌ Error en modelo mostrar unidades curriculares:", error);
      error.details = {
        path: "CurricularModel.mostrarSeccionesByPnfAndValueUnidadCurricular",
        codigo_pnf,
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
        SELECT * FROM public.vista_unidades_con_areas
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

  /**
   * @static
   * @async
   * @method obtenerUnidadCurricularPorId
   * @description
   * @param {number} id
   * @returns {Promise<Object>} Resultado de la consulta
   */
  static async obtenerUnidadCurricularPorId(id) {
    try {
      const { rows } = await pg.query(
        `
        SELECT * FROM public.vista_unidades_con_areas
        WHERE id_unidad_curricular = $1
        `,
        [id]
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
  /**
   * @static
   * @async
   * @method eliminarUnidadCurricular
   * @description Elimina físicamente una unidad curricular y todos sus registros relacionados
   * @param {number} id_usuario - ID del usuario que ejecuta la acción
   * @param {number} id_unidad_curricular - ID de la unidad curricular a eliminar
   * @returns {Promise<Object>} Resultado de la operación
   */
  static async eliminarUnidadCurricular(id_usuario, id_unidad_curricular) {
    try {
      const query = `
      CALL eliminar_unidad_curricular_fisicamente($1, $2, NULL);
    `;

      const { rows } = await pg.query(query, [
        id_usuario,
        id_unidad_curricular,
      ]);

      return FormatterResponseModel.respuestaPostgres(
        rows,
        "Unidad curricular eliminada correctamente."
      );
    } catch (error) {
      error.details = {
        path: "CurricularModel.eliminarUnidadCurricular",
        id_usuario: id_usuario,
        id_unidad_curricular: id_unidad_curricular,
      };
      throw FormatterResponseModel.respuestaError(
        error,
        "Error al eliminar la unidad curricular"
      );
    }
  }

  /**
   * @static
   * @async
   * @method eliminarPnf
   * @description Elimina físicamente un PNF y todos sus registros relacionados
   * @param {number} id_usuario - ID del usuario que ejecuta la acción
   * @param {number} id_pnf - ID del PNF a eliminar
   * @returns {Promise<Object>} Resultado de la operación
   */
  static async eliminarPnf(id_usuario, id_pnf) {
    try {
      const query = `
      CALL activar_desactivar_pnf(NULL,$1, $2, 'DESACTIVAR');
    `;

      const { rows } = await pg.query(query, [id_usuario, id_pnf]);

      return FormatterResponseModel.respuestaPostgres(
        rows,
        "PNF eliminado correctamente."
      );
    } catch (error) {
      error.details = {
        path: "CurricularModel.eliminarPnf",
        id_usuario: id_usuario,
        id_pnf: id_pnf,
      };
      throw FormatterResponseModel.respuestaError(
        error,
        "Error al eliminar el PNF"
      );
    }
  }

  /**
   * @static
   * @async
   * @method reactivarPnf
   * @description Reactiva un PNF y sus trayectos relacionados
   * @param {number} id_usuario - ID del usuario que ejecuta la acción
   * @param {number} id_pnf - ID del PNF a reactivar
   * @returns {Promise<Object>} Resultado de la operación
   */
  static async reactivarPnf(id_usuario, id_pnf) {
    try {
      const query = `
      CALL activar_desactivar_pnf(NULL,$1, $2, 'ACTIVAR');
    `;

      const { rows } = await pg.query(query, [id_usuario, id_pnf]);

      return FormatterResponseModel.respuestaPostgres(
        rows,
        "PNF reactivado correctamente."
      );
    } catch (error) {
      error.details = {
        path: "CurricularModel.reactivarPnf",
        id_usuario: id_usuario,
        id_pnf: id_pnf,
      };
      throw FormatterResponseModel.respuestaError(
        error,
        "Error al reactivar el PNF"
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
