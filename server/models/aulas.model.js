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
      const { id_sede, codigo, nombre, tipo, capacidad, equipamiento } = datos;
      const query = `CALL registrar_aula_completo(?, ?, ?, ?, ?, ?, ?, NULL)`;

      const params = [
        id_usuario,
        id_sede,
        codigo,
        nombre,
        tipo,
        capacidad,
        equipamiento || null,
      ];
      const { rows } = await pg.query(query, params);

      return FormatterResponseModel.respuestaPostgres(
        rows,
        "Aula creada exitosamente"
      );
    } catch (error) {
      error.details = { path: "AulaModel.crear" };
      throw FormatterResponseModel.respuestaError(
        error,
        "Error en la creación del aula"
      );
    }
  }

  /**
   * @static
   * @async
   * @method obtenerTodas
   * @description Obtener todas las aulas con soporte para parámetros de consulta
   * @param {Object} queryParams - Parámetros de consulta (paginación, filtros, ordenamiento)
   * @returns {Promise<Object>} Lista de aulas
   */
  static async obtenerTodas(queryParams = {}) {
    try {
      let query = `
        SELECT 
          a.id_aula,
          a.codigo,
          a.nombre,
          a.tipo,
          a.capacidad,
          a.equipamiento,
          a.estado,
          s.id_sede,
          s.nombre as nombre_sede,
          a.fecha_creacion,
          a.fecha_actualizacion
        FROM public.aulas a
        INNER JOIN public.sedes s ON a.id_sede = s.id_sede
        WHERE 1=1
      `;
      const params = [];

      // Aplicar filtros si están presentes
      if (queryParams.sede) {
        query += ` AND s.nombre = ?`;
        params.push(queryParams.sede);
      }

      if (queryParams.tipo) {
        query += ` AND a.tipo = ?`;
        params.push(queryParams.tipo);
      }

      if (queryParams.estado !== undefined) {
        query += ` AND a.estado = ?`;
        params.push(queryParams.estado);
      }

      // Aplicar ordenamiento
      if (queryParams.sort) {
        const allowedSortFields = [
          "nombre",
          "codigo",
          "tipo",
          "capacidad",
          "fecha_creacion",
        ];
        const sortField = allowedSortFields.includes(queryParams.sort)
          ? queryParams.sort
          : "nombre";
        const sortOrder =
          queryParams.order?.toUpperCase() === "DESC" ? "DESC" : "ASC";
        query += ` ORDER BY a.${sortField} ${sortOrder}`;
      } else {
        query += ` ORDER BY a.nombre ASC`;
      }

      // Aplicar paginación
      if (queryParams.limit) {
        const limit = parseInt(queryParams.limit);
        const offset = queryParams.page
          ? (parseInt(queryParams.page) - 1) * limit
          : 0;
        query += ` LIMIT ? OFFSET ?`;
        params.push(limit, offset);
      }

      const { rows } = await pg.query(query, params);

      return FormatterResponseModel.respuestaPostgres(
        rows,
        "Aulas obtenidas exitosamente"
      );
    } catch (error) {
      error.details = { path: "AulaModel.obtenerTodas" };
      throw FormatterResponseModel.respuestaError(
        error,
        "Error al obtener las aulas"
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
          a.codigo,
          a.nombre,
          a.tipo,
          a.capacidad,
          a.equipamiento,
          a.estado,
          s.id_sede,
          s.nombre as nombre_sede,
          a.fecha_creacion,
          a.fecha_actualizacion,
          u_creador.nombre as usuario_creador,
          u_actualizador.nombre as usuario_actualizador
        FROM public.aulas a
        INNER JOIN public.sedes s ON a.id_sede = s.id_sede
        LEFT JOIN public.usuarios u_creador ON a.id_usuario_creacion = u_creador.id_usuario
        LEFT JOIN public.usuarios u_actualizador ON a.id_usuario_actualizacion = u_actualizador.id_usuario
        WHERE a.id_aula = ?
      `;
      const params = [id_aula];

      const { rows } = await pg.query(query, params);

      return FormatterResponseModel.respuestaPostgres(
        rows,
        "Aula obtenida exitosamente"
      );
    } catch (error) {
      error.details = { path: "AulaModel.buscarPorId" };
      throw FormatterResponseModel.respuestaError(
        error,
        "Error al buscar aula por ID"
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

      // Campos permitidos para actualización
      const camposPermitidos = [
        "codigo",
        "nombre",
        "tipo",
        "capacidad",
        "equipamiento",
        "id_sede",
        "estado",
      ];

      for (const [campo, valor] of Object.entries(datos)) {
        if (camposPermitidos.includes(campo) && valor !== undefined) {
          campos.push(`${campo} = ?`);
          params.push(valor);
        }
      }

      if (campos.length === 0) {
        return FormatterResponseModel.respuestaPostgres(
          [],
          "No hay campos válidos para actualizar"
        );
      }

      // Agregar ID del aula y usuario que actualiza
      params.push(id_usuario, id_aula);

      const query = `
        UPDATE public.aulas 
        SET ${campos.join(
          ", "
        )}, fecha_actualizacion = CURRENT_TIMESTAMP, id_usuario_actualizacion = ?
        WHERE id_aula = ?
      `;

      const { rows } = await pg.query(query, params);

      return FormatterResponseModel.respuestaPostgres(
        rows,
        "Aula actualizada exitosamente"
      );
    } catch (error) {
      error.details = { path: "AulaModel.actualizar" };
      throw FormatterResponseModel.respuestaError(
        error,
        "Error al actualizar aula"
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
        SET estado = 'INACTIVO', fecha_actualizacion = CURRENT_TIMESTAMP, id_usuario_actualizacion = ?
        WHERE id_aula = ?
      `;
      const params = [id_usuario, id_aula];

      const { rows } = await pg.query(query, params);

      return FormatterResponseModel.respuestaPostgres(
        rows,
        "Aula eliminada exitosamente"
      );
    } catch (error) {
      error.details = { path: "AulaModel.eliminar" };
      throw FormatterResponseModel.respuestaError(
        error,
        "Error al eliminar aula"
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
          a.codigo,
          a.nombre,
          a.tipo,
          a.capacidad,
          a.equipamiento,
          a.estado,
          s.id_sede,
          s.nombre as nombre_sede
        FROM public.aulas a
        INNER JOIN public.sedes s ON a.id_sede = s.id_sede
        WHERE a.tipo = ? AND a.estado = 'ACTIVO'
        ORDER BY a.nombre ASC
      `;
      const params = [tipo];

      const { rows } = await pg.query(query, params);

      return FormatterResponseModel.respuestaPostgres(
        rows,
        `Aulas de tipo ${tipo} obtenidas exitosamente`
      );
    } catch (error) {
      error.details = { path: "AulaModel.filtrarPorTipo" };
      throw FormatterResponseModel.respuestaError(
        error,
        "Error al filtrar aulas por tipo"
      );
    }
  }

  /**
   * @static
   * @async
   * @method filtrarPorSede
   * @description Filtrar aulas por sede específica
   * @param {string} sede - Nombre de la sede a filtrar
   * @returns {Promise<Object>} Lista de aulas de la sede especificada
   */
  static async filtrarPorSede(sede) {
    try {
      const query = `
        SELECT 
          a.id_aula,
          a.codigo,
          a.nombre,
          a.tipo,
          a.capacidad,
          a.equipamiento,
          a.estado,
          s.id_sede,
          s.nombre as nombre_sede
        FROM public.aulas a
        INNER JOIN public.sedes s ON a.id_sede = s.id_sede
        WHERE s.nombre = ? AND a.estado = 'ACTIVO'
        ORDER BY a.nombre ASC
      `;
      const params = [sede];

      const { rows } = await pg.query(query, params);

      return FormatterResponseModel.respuestaPostgres(
        rows,
        `Aulas de la sede ${sede} obtenidas exitosamente`
      );
    } catch (error) {
      error.details = { path: "AulaModel.filtrarPorSede" };
      throw FormatterResponseModel.respuestaError(
        error,
        "Error al filtrar aulas por sede"
      );
    }
  }

  /**
   * @static
   * @async
   * @method obtenerDisponibles
   * @description Obtener aulas disponibles para un horario específico
   * @param {Object} filtros - Filtros de disponibilidad
   * @returns {Promise<Object>} Lista de aulas disponibles
   */
  static async obtenerDisponibles(filtros = {}) {
    try {
      const { fecha, hora_inicio, hora_fin, tipo, sede } = filtros;

      let query = `
        SELECT DISTINCT
          a.id_aula,
          a.codigo,
          a.nombre,
          a.tipo,
          a.capacidad,
          a.equipamiento,
          s.nombre as nombre_sede
        FROM public.aulas a
        INNER JOIN public.sedes s ON a.id_sede = s.id_sede
        WHERE a.estado = 'ACTIVO'
          AND a.id_aula NOT IN (
            SELECT ha.id_aula 
            FROM public.horarios_aulas ha
            INNER JOIN public.horarios h ON ha.id_horario = h.id_horario
            WHERE h.fecha = ? 
              AND (
                (h.hora_inicio BETWEEN ? AND ?) 
                OR (h.hora_fin BETWEEN ? AND ?)
                OR (? BETWEEN h.hora_inicio AND h.hora_fin)
                OR (? BETWEEN h.hora_inicio AND h.hora_fin)
              )
              AND h.estado = 'ACTIVO'
          )
      `;

      const params = [
        fecha,
        hora_inicio,
        hora_fin,
        hora_inicio,
        hora_fin,
        hora_inicio,
        hora_fin,
      ];

      // Aplicar filtros adicionales
      if (tipo) {
        query += ` AND a.tipo = ?`;
        params.push(tipo);
      }

      if (sede) {
        query += ` AND s.nombre = ?`;
        params.push(sede);
      }

      query += ` ORDER BY a.nombre ASC`;

      const { rows } = await pg.query(query, params);

      return FormatterResponseModel.respuestaPostgres(
        rows,
        "Aulas disponibles obtenidas exitosamente"
      );
    } catch (error) {
      error.details = { path: "AulaModel.obtenerDisponibles" };
      throw FormatterResponseModel.respuestaError(
        error,
        "Error al obtener aulas disponibles"
      );
    }
  }

  /**
   * @static
   * @async
   * @method verificarHorariosFuturos
   * @description Verificar si un aula tiene horarios asignados en el futuro
   * @param {number} id_aula - ID del aula a verificar
   * @returns {Promise<boolean>} True si tiene horarios futuros, false en caso contrario
   */
  static async verificarHorariosFuturos(id_aula) {
    try {
      const query = `
        SELECT COUNT(*) as total
        FROM public.horarios_aulas ha
        INNER JOIN public.horarios h ON ha.id_horario = h.id_horario
        WHERE ha.id_aula = ? 
          AND (h.fecha > CURRENT_DATE OR (h.fecha = CURRENT_DATE AND h.hora_inicio > CURRENT_TIME))
          AND h.estado = 'ACTIVO'
      `;
      const params = [id_aula];

      const { rows } = await pg.query(query, params);

      return rows[0]?.total > 0;
    } catch (error) {
      error.details = { path: "AulaModel.verificarHorariosFuturos" };
      throw FormatterResponseModel.respuestaError(
        error,
        "Error al verificar horarios futuros del aula"
      );
    }
  }

  /**
   * @static
   * @async
   * @method verificarDuplicado
   * @description Verificar si ya existe un aula con el mismo código o nombre
   * @param {string} codigo - Código del aula
   * @param {string} nombre - Nombre del aula
   * @returns {Promise<Object>} Información sobre duplicados
   */
  static async verificarDuplicado(codigo, nombre) {
    try {
      const query = `
        SELECT 
          id_aula,
          codigo,
          nombre,
          estado
        FROM public.aulas 
        WHERE (codigo = ? OR nombre = ?) AND estado = 'ACTIVO'
      `;
      const params = [codigo, nombre];

      const { rows } = await pg.query(query, params);

      return FormatterResponseModel.respuestaPostgres(
        rows,
        "Verificación de duplicados completada"
      );
    } catch (error) {
      error.details = { path: "AulaModel.verificarDuplicado" };
      throw FormatterResponseModel.respuestaError(
        error,
        "Error al verificar duplicados de aula"
      );
    }
  }
}
