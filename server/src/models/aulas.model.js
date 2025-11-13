// Importación de la conexión a la base de datos
import pg from "../database/pg.js";

// Importación de clase para formateo de respuestas
import FormatterResponseModel from "../utils/FormatterResponseModel.js";

/**
 * @class AulaModel
 * @description Contiene los métodos para todas las operaciones relacionadas con aulas
 */
export default class AulaModel {
  /**
   * @static
   * @async
   * @method crear
   * @description Crear una nueva aula en el sistema
   * @param {Object} datos - Datos del aula a crear
   * @param {number} id_usuario - ID del usuario que realiza la acción
   * @returns {Promise<Object>} Resultado de la operación
   */
  static async crear(datos, id_usuario) {
    try {
      const { id_sede, codigo, tipo, capacidad } = datos;
      const query = `CALL registrar_aula_completo($1, $2, $3, $4, $5, NULL)`;

      const params = [id_usuario, id_sede, codigo, tipo, capacidad];
      console.log("📝 Ejecutando query:", query, params);

      const { rows } = await pg.query(query, params);

      return FormatterResponseModel.respuestaPostgres(
        rows,
        "aulas:success.created_title"
      );
    } catch (error) {
      error.details = { path: "AulaModel.crear" };
      throw FormatterResponseModel.respuestaError(
        error,
        "aulas:errors.error_created"
      );
    }
  }

  /**
   * @static
   * @async
   * @method obtenerTodas
   * @description Obtener todas las aulas (a través de la vista vista_sedes_completa) con soporte para parámetros de consulta
   * @param {Object} queryParams - Parámetros de consulta (paginación, filtros, ordenamiento)
   * @returns {Promise<Object>} Lista de aulas
   */
  static async obtenerTodas(queryParams = {}) {
    try {
      let query = `
        SELECT 
          id_sede,
          nombre_sede,
          ubicacion_sede,
          google_sede,
          id_aula,
          codigo_aula,
          tipo_aula,
          capacidad_aula
        FROM 
          public.vistas_aulas
        WHERE 1=1
      `;
      const params = [];

      // --- 1. Aplicar Filtros ---

      // Filtro por ID de Sede
      if (queryParams.idSede) {
        query += ` AND id_sede = $${params.length + 1}`;
        params.push(queryParams.idSede);
      }

      // Filtro por Tipo de Aula
      if (queryParams.tipo) {
        query += ` AND tipo_aula = $${params.length + 1}`;
        params.push(queryParams.tipo);
      }

      // Filtro por Código de Aula (ILIKE para búsqueda parcial)
      if (queryParams.codigo) {
        query += ` AND codigo_aula ILIKE $${params.length + 1}`;
        params.push(`%${queryParams.codigo}%`);
      }

      // Filtro por Capacidad (ejemplo)
      if (queryParams.minCapacidad) {
        query += ` AND capacidad_aula >= $${params.length + 1}`;
        params.push(parseInt(queryParams.minCapacidad));
      }

      // --- 2. Aplicar Ordenamiento ---

      if (queryParams.sort) {
        // Campos permitidos para ordenar de la vista
        const allowedSortFields = [
          "nombre_sede",
          "codigo_aula",
          "tipo_aula",
          "capacidad_aula",
        ];
        const sortField = allowedSortFields.includes(queryParams.sort)
          ? queryParams.sort
          : "nombre_sede"; // Default
        const sortOrder =
          queryParams.order?.toUpperCase() === "DESC" ? "DESC" : "ASC";

        // El ordenamiento se aplica directamente a los campos de la vista
        query += ` ORDER BY ${sortField} ${sortOrder}`;
      } else {
        // Ordenamiento por defecto
        query += ` ORDER BY nombre_sede ASC, codigo_aula ASC`;
      }

      // --- 3. Aplicar Paginación ---

      if (queryParams.limit) {
        const limit = parseInt(queryParams.limit);
        const offset = queryParams.page
          ? (parseInt(queryParams.page) - 1) * limit
          : 0;

        query += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
        // Los parámetros de límite y offset van al final
        params.push(limit, offset);
      }

      console.log("📝 Ejecutando query:", query, params);
      const { rows } = await pg.query(query, params);

      return FormatterResponseModel.respuestaPostgres(
        rows,
        "aulas:success.retrieved_all"
      );
    } catch (error) {
      error.details = { path: "AulaModel.obtenerTodas" };
      throw FormatterResponseModel.respuestaError(
        error,
        "aulas:errors.error_retrieved_all"
      );
    }
  }

  /**
   * @static
   * @async
   * @method buscarPorId
   * @description Buscar un aula específica por su ID
   * @param {number} id_aula - ID del aula a buscar
   * @returns {Promise<Object>} Datos del aula
   */
  static async buscarPorId(id_aula) {
    try {
      const query = `
        SELECT 
          a.id_aula,
          a.codigo_aula,
          a.tipo_aula,
          a.capacidad_aula,
          s.id_sede,
          s.nombre_sede
        FROM public.aulas a
        INNER JOIN public.sedes s ON a.id_sede = s.id_sede
        WHERE a.id_aula = $1
      `;
      const params = [id_aula];

      console.log("📝 Ejecutando query:", query, params);
      const { rows } = await pg.query(query, params);

      return FormatterResponseModel.respuestaPostgres(
        rows,
        "aulas:success.retrieved_one"
      );
    } catch (error) {
      error.details = { path: "AulaModel.buscarPorId" };
      throw FormatterResponseModel.respuestaError(
        error,
        "aulas:errors.error_retrieved_one"
      );
    }
  }

  /**
   * @static
   * @async
   * @method actualizar
   * @description Actualizar los datos de un aula existente
   * @param {number} id_aula - ID del aula a actualizar
   * @param {Object} datos - Datos actualizados del aula
   * @param {number} id_usuario - ID del usuario que realiza la acción
   * @returns {Promise<Object>} Resultado de la operación
   */
  static async actualizar(id_aula, datos, id_usuario) {
    try {
      // Construir la consulta dinámicamente basada en los campos proporcionados
      const campos = [];
      const params = [];

      // Mapeo de campos del servicio a campos de la base de datos
      const mapeoCampos = {
        codigo: "codigo_aula",
        nombre: "nombre_aula",
        tipo: "tipo_aula",
        capacidad: "capacidad_aula",
        equipamiento: "equipamiento_aula",
        id_sede: "id_sede",
        estado: "estado_aula"
      };

      for (const [campo, valor] of Object.entries(datos)) {
        if (mapeoCampos[campo] && valor !== undefined) {
          campos.push(`${mapeoCampos[campo]} = $${params.length + 1}`);
          params.push(valor);
        }
      }

      if (campos.length === 0) {
        return FormatterResponseModel.respuestaPostgres(
          [],
          "aulas:success.no_fields"
        );
      }

      // Agregar ID del aula y usuario que actualiza
      params.push(id_usuario, id_aula);

      const query = `
        UPDATE public.aulas 
        SET ${campos.join(
          ", "
        )}, fecha_actualizacion = CURRENT_TIMESTAMP, id_usuario_actualizacion = $${
        params.length
      }
        WHERE id_aula = $${params.length + 1}
      `;

      console.log("📝 Ejecutando query:", query, params);
      const { rows } = await pg.query(query, params);

      return FormatterResponseModel.respuestaPostgres(
        rows,
        "aulas:success.updated_title"
      );
    } catch (error) {
      error.details = { path: "AulaModel.actualizar" };
      throw FormatterResponseModel.respuestaError(
        error,
        "aulas:errors.error_updated"
      );
    }
  }

  /**
   * @static
   * @async
   * @method eliminar
   * @description Eliminar un aula del sistema (cambiar estado a inactivo)
   * @param {number} id_aula - ID del aula a eliminar
   * @param {number} id_usuario - ID del usuario que realiza la acción
   * @returns {Promise<Object>} Resultado de la operación
   */
  static async eliminar(id_aula, id_usuario) {
    try {
      const query = `
        UPDATE public.aulas 
        SET estado_aula = 'INACTIVO', fecha_actualizacion = CURRENT_TIMESTAMP, id_usuario_actualizacion = $1
        WHERE id_aula = $2
      `;
      const params = [id_usuario, id_aula];

      console.log("📝 Ejecutando query:", query, params);
      const { rows } = await pg.query(query, params);

      return FormatterResponseModel.respuestaPostgres(
        rows,
        "aulas:success.deleted_title"
      );
    } catch (error) {
      error.details = { path: "AulaModel.eliminar" };
      throw FormatterResponseModel.respuestaError(
        error,
        "aulas:errors.error_deleted"
      );
    }
  }

  /**
   * @static
   * @async
   * @method filtrarPorTipo
   * @description Filtrar aulas por tipo específico
   * @param {string} tipo - Tipo de aula a filtrar
   * @returns {Promise<Object>} Lista de aulas del tipo especificado
   */
  static async filtrarPorTipo(tipo) {
    try {
      const query = `
        SELECT 
          a.id_aula,
          a.codigo_aula,
          a.tipo_aula,
          a.capacidad_aula,
          s.id_sede,
          s.nombre_sede
        FROM public.aulas a
        INNER JOIN public.sedes s ON a.id_sede = s.id_sede
        WHERE a.tipo_aula = $1 AND a.estado_aula = 'ACTIVO'
        ORDER BY a.codigo_aula ASC
      `;
      const params = [tipo];

      console.log("📝 Ejecutando query:", query, params);
      const { rows } = await pg.query(query, params);

      return FormatterResponseModel.respuestaPostgres(
        rows,
        "aulas:success.filtered_by_type",
        { tipo }
      );
    } catch (error) {
      error.details = { path: "AulaModel.filtrarPorTipo" };
      throw FormatterResponseModel.respuestaError(
        error,
        "aulas:errors.error_filtered_by_type"
      );
    }
  }

  /**
   * @static
   * @async
   * @method filtrarPorSede
   * @description Filtrar aulas por sede específica
   * @param {string} sede - ID de la sede a filtrar
   * @returns {Promise<Object>} Lista de aulas de la sede especificada
   */
  static async filtrarPorSede(sede) {
    try {
      const query = `
        SELECT 
          a.id_aula,
          a.codigo_aula,
          a.tipo_aula,
          a.capacidad_aula,
          s.id_sede,
          s.nombre_sede
        FROM public.aulas a
        INNER JOIN public.sedes s ON a.id_sede = s.id_sede
        WHERE s.id_sede = $1 AND a.estado_aula = 'ACTIVO'
      `;
      const params = [sede];

      console.log("📝 Ejecutando query:", query, params);
      const { rows } = await pg.query(query, params);

      return FormatterResponseModel.respuestaPostgres(
        rows,
        "aulas:success.filtered_by_campus",
        { sede }
      );
    } catch (error) {
      error.details = { path: "AulaModel.filtrarPorSede" };
      throw FormatterResponseModel.respuestaError(
        error,
        "aulas:errors.error_filtered_by_campus"
      );
    }
  }

  /**
   * @static
   * @async
   * @method obtenerAulasPorPnf
   * @description Obtener aulas disponibles para un horario específico
   * @param {number} codigoPNF - Filtros de disponibilidad
   * @returns {Promise<Object>} Lista de aulas disponibles
   */
  static async obtenerAulasPorPnf(codigoPNF) {
    try {
      const query = `
        SELECT 
          a.id_aula,
          a.codigo_aula,
          a.tipo_aula,
          a.capacidad_aula,
          s.id_sede,
          s.nombre_sede
        FROM public.aulas a
        INNER JOIN public.sedes s ON a.id_sede = s.id_sede
        WHERE a.estado_aula = 'ACTIVO'
        -- Agrega aquí los joins y condiciones específicas para PNF
        ORDER BY a.codigo_aula ASC
      `;
      const params = [codigoPNF];

      console.log("📝 Ejecutando query:", query, params);
      const { rows } = await pg.query(query, params);

      return FormatterResponseModel.respuestaPostgres(
        rows,
        "aulas:success.retrieved_by_pnf"
      );
    } catch (error) {
      error.details = { path: "AulaModel.obtenerAulasPorPnf" };
      throw FormatterResponseModel.respuestaError(
        error,
        "aulas:errors.error_retrieved_by_pnf"
      );
    }
  }

  /**
   * @static
   * @async
   * @method verificarHorariosFuturos
   * @description Verificar si el aula tiene horarios futuros asignados
   * @param {number} id_aula - ID del aula a verificar
   * @returns {Promise<boolean>} True si tiene horarios futuros, false en caso contrario
   */
  static async verificarHorariosFuturos(id_aula) {
    try {
      const query = `
        SELECT EXISTS(
          SELECT 1 FROM public.horarios 
          WHERE id_aula = $1 
          AND fecha_hora_inicio > CURRENT_TIMESTAMP
          AND estado = 'ACTIVO'
        ) as tiene_horarios_futuros
      `;
      const params = [id_aula];

      console.log("📝 Ejecutando query:", query, params);
      const { rows } = await pg.query(query, params);

      return rows[0]?.tiene_horarios_futuros || false;
    } catch (error) {
      error.details = { path: "AulaModel.verificarHorariosFuturos" };
      throw FormatterResponseModel.respuestaError(
        error,
        "Error al verificar horarios futuros del aula"
      );
    }
  }
}