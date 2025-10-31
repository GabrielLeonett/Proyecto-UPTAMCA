// Importación de la conexión a la base de datos
import pg from "../database/pg.js";

// Importación de clase para formateo de respuestas
import FormatterResponseModel from "../utils/FormatterResponseModel.js";

/**
 * @class AdminModel
 * @description Contiene los métodos para todas las operaciones relacionadas con administradores
 */
export default class AdminModel {
  /**
   * @static
   * @async
   * @method crear
   * @description Crear un nuevo administrador en el sistema
   * @param {Object} datos - Datos del administrador a crear
   * @param {number} id_usuario - ID del usuario que realiza la acción
   * @returns {Promise<Object>} Resultado de la operación
   */
  static async crear(datos, id_usuario) {
    try {
      const { cedula, nombre, apellido, email, rol } = datos;
      const query = `CALL registrar_administrador($1, $2, $3, $4, $5, $6)`;

      const params = [
        id_usuario,
        cedula,
        nombre,
        apellido,
        email,
        rol
      ];
      console.log(query, params)
      const { rows } = await pg.query(query, params);

      return FormatterResponseModel.respuestaPostgres(
        rows,
        "Administrador creado exitosamente"
      );
    } catch (error) {
      error.details = { path: "AdminModel.crear" };
      throw FormatterResponseModel.respuestaError(
        error,
        "Error en la creación del administrador"
      );
    }
  }

  /**
   * @static
   * @async
   * @method obtenerTodos
   * @description Obtener todos los administradores con soporte para parámetros de consulta
   * @param {Object} queryParams - Parámetros de consulta (paginación, filtros, ordenamiento)
   * @returns {Promise<Object>} Lista de administradores
   */
  static async obtenerTodos(queryParams = {}) {
    try {
      let query = `
        SELECT 
          id_admin,
          cedula,
          nombre,
          apellido,
          email,
          rol,
          estado,
          fecha_registro,
          ultimo_acceso,
          id_usuario_creacion,
          id_usuario_actualizacion
        FROM 
          public.administradores
        WHERE 1=1
      `;
      const params = [];

      // --- 1. Aplicar Filtros ---

      // Filtro por Rol
      if (queryParams.rol) {
        query += ` AND rol = ?`;
        params.push(queryParams.rol);
      }

      // Filtro por Estado
      if (queryParams.estado) {
        query += ` AND estado = ?`;
        params.push(queryParams.estado);
      }

      // Filtro por Cédula (búsqueda parcial)
      if (queryParams.cedula) {
        query += ` AND cedula::text LIKE ?`;
        params.push(`%${queryParams.cedula}%`);
      }

      // Filtro por Nombre (búsqueda parcial)
      if (queryParams.nombre) {
        query += ` AND nombre ILIKE ?`;
        params.push(`%${queryParams.nombre}%`);
      }

      // Filtro por Email (búsqueda parcial)
      if (queryParams.email) {
        query += ` AND email ILIKE ?`;
        params.push(`%${queryParams.email}%`);
      }

      // --- 2. Aplicar Ordenamiento ---

      if (queryParams.sort) {
        // Campos permitidos para ordenar
        const allowedSortFields = [
          "cedula",
          "nombre",
          "apellido",
          "email",
          "rol",
          "estado",
          "fecha_registro",
          "ultimo_acceso"
        ];
        const sortField = allowedSortFields.includes(queryParams.sort)
          ? queryParams.sort
          : "fecha_registro"; // Default
        const sortOrder =
          queryParams.order?.toUpperCase() === "DESC" ? "DESC" : "ASC";

        query += ` ORDER BY ${sortField} ${sortOrder}`;
      } else {
        // Ordenamiento por defecto
        query += ` ORDER BY fecha_registro DESC`;
      }

      // --- 3. Aplicar Paginación ---

      if (queryParams.limit) {
        const limit = parseInt(queryParams.limit);
        const offset = queryParams.page
          ? (parseInt(queryParams.page) - 1) * limit
          : 0;

        query += ` LIMIT ? OFFSET ?`;
        params.push(limit, offset);
      }

      // 🚀 Ejecutar la consulta con parámetros
      const { rows } = await pg.query(query, params);

      return FormatterResponseModel.respuestaPostgres(
        rows,
        "Administradores obtenidos exitosamente"
      );
    } catch (error) {
      error.details = { path: "AdminModel.obtenerTodos" };
      throw FormatterResponseModel.respuestaError(
        error,
        "Error al obtener los administradores"
      );
    }
  }

  /**
   * @static
   * @async
   * @method buscarPorId
   * @description Buscar un administrador específico por su ID
   * @param {number} id_admin - ID del administrador a buscar
   * @returns {Promise<Object>} Datos del administrador
   */
  static async buscarPorId(id_admin) {
    try {
      const query = `
        SELECT 
          a.id_admin,
          a.cedula,
          a.nombre,
          a.apellido,
          a.email,
          a.rol,
          a.estado,
          a.fecha_registro,
          a.ultimo_acceso,
          a.fecha_actualizacion,
          u_creador.nombre as usuario_creador,
          u_actualizador.nombre as usuario_actualizador
        FROM public.administradores a
        LEFT JOIN public.usuarios u_creador ON a.id_usuario_creacion = u_creador.id_usuario
        LEFT JOIN public.usuarios u_actualizador ON a.id_usuario_actualizacion = u_actualizador.id_usuario
        WHERE a.id_admin = ?
      `;
      const params = [id_admin];

      const { rows } = await pg.query(query, params);

      return FormatterResponseModel.respuestaPostgres(
        rows,
        "Administrador obtenido exitosamente"
      );
    } catch (error) {
      error.details = { path: "AdminModel.buscarPorId" };
      throw FormatterResponseModel.respuestaError(
        error,
        "Error al buscar administrador por ID"
      );
    }
  }

  /**
   * @static
   * @async
   * @method buscarPorCedulaOEmail
   * @description Buscar administradores por cédula o email
   * @param {string} cedula - Cédula a buscar
   * @param {string} email - Email a buscar
   * @returns {Promise<Object>} Datos del administrador encontrado
   */
  static async buscarPorCedulaOEmail(cedula, email) {
    try {
      const query = `
        SELECT 
          id_admin,
          cedula,
          nombre,
          apellido,
          email,
          rol,
          estado
        FROM public.administradores 
        WHERE (cedula = ? OR email = ?) AND estado = 'activo'
      `;
      const params = [cedula, email];

      const { rows } = await pg.query(query, params);

      return FormatterResponseModel.respuestaPostgres(
        rows,
        "Búsqueda por cédula o email completada"
      );
    } catch (error) {
      error.details = { path: "AdminModel.buscarPorCedulaOEmail" };
      throw FormatterResponseModel.respuestaError(
        error,
        "Error al buscar administrador por cédula o email"
      );
    }
  }

  /**
   * @static
   * @async
   * @method buscarPorEmail
   * @description Buscar administradores por email
   * @param {string} email - Email a buscar
   * @returns {Promise<Object>} Datos del administrador encontrado
   */
  static async buscarPorEmail(email) {
    try {
      const query = `
        SELECT 
          id_admin,
          cedula,
          nombre,
          apellido,
          email,
          rol,
          estado
        FROM public.administradores 
        WHERE email = ? AND estado = 'activo'
      `;
      const params = [email];

      const { rows } = await pg.query(query, params);

      return FormatterResponseModel.respuestaPostgres(
        rows,
        "Búsqueda por email completada"
      );
    } catch (error) {
      error.details = { path: "AdminModel.buscarPorEmail" };
      throw FormatterResponseModel.respuestaError(
        error,
        "Error al buscar administrador por email"
      );
    }
  }

  /**
   * @static
   * @async
   * @method buscar
   * @description Buscar administradores por término de búsqueda (cédula, nombre, apellido, email)
   * @param {string} termino - Término de búsqueda
   * @returns {Promise<Object>} Lista de administradores encontrados
   */
  static async buscar(termino) {
    try {
      const query = `
        SELECT 
          id_admin,
          cedula,
          nombre,
          apellido,
          email,
          rol,
          estado,
          fecha_registro
        FROM public.administradores 
        WHERE estado = 'activo'
          AND (
            cedula::text LIKE ? 
            OR nombre ILIKE ? 
            OR apellido ILIKE ? 
            OR email ILIKE ?
          )
        ORDER BY nombre, apellido ASC
      `;
      const searchTerm = `%${termino}%`;
      const params = [searchTerm, searchTerm, searchTerm, searchTerm];

      const { rows } = await pg.query(query, params);

      return FormatterResponseModel.respuestaPostgres(
        rows,
        "Búsqueda de administradores completada"
      );
    } catch (error) {
      error.details = { path: "AdminModel.buscar" };
      throw FormatterResponseModel.respuestaError(
        error,
        "Error al buscar administradores"
      );
    }
  }

  /**
   * @static
   * @async
   * @method actualizar
   * @description Actualizar los datos de un administrador existente
   * @param {number} id_admin - ID del administrador a actualizar
   * @param {Object} datos - Datos actualizados del administrador
   * @param {number} id_usuario - ID del usuario que realiza la acción
   * @returns {Promise<Object>} Resultado de la operación
   */
  static async actualizar(id_admin, datos, id_usuario) {
    try {
      // Construir la consulta dinámicamente basada en los campos proporcionados
      const campos = [];
      const params = [];

      // Campos permitidos para actualización
      const camposPermitidos = [
        "cedula",
        "nombre",
        "apellido",
        "email",
        "rol",
        "estado"
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

      // Agregar ID del administrador y usuario que actualiza
      params.push(id_usuario, id_admin);

      const query = `
        UPDATE public.administradores 
        SET ${campos.join(
          ", "
        )}, fecha_actualizacion = CURRENT_TIMESTAMP, id_usuario_actualizacion = ?
        WHERE id_admin = ?
      `;

      const { rows } = await pg.query(query, params);

      return FormatterResponseModel.respuestaPostgres(
        rows,
        "Administrador actualizado exitosamente"
      );
    } catch (error) {
      error.details = { path: "AdminModel.actualizar" };
      throw FormatterResponseModel.respuestaError(
        error,
        "Error al actualizar administrador"
      );
    }
  }

  /**
   * @static
   * @async
   * @method actualizarPerfil
   * @description Actualizar el perfil del administrador autenticado
   * @param {number} id_admin - ID del administrador
   * @param {Object} datos - Datos actualizados del perfil
   * @returns {Promise<Object>} Resultado de la operación
   */
  static async actualizarPerfil(id_admin, datos) {
    try {
      // Construir la consulta dinámicamente basada en los campos proporcionados
      const campos = [];
      const params = [];

      // Campos permitidos para actualización de perfil
      const camposPermitidos = ["nombre", "apellido", "email"];

      for (const [campo, valor] of Object.entries(datos)) {
        if (camposPermitidos.includes(campo) && valor !== undefined) {
          campos.push(`${campo} = ?`);
          params.push(valor);
        }
      }

      if (campos.length === 0) {
        return FormatterResponseModel.respuestaPostgres(
          [],
          "No hay campos válidos para actualizar en el perfil"
        );
      }

      // Agregar ID del administrador
      params.push(id_admin);

      const query = `
        UPDATE public.administradores 
        SET ${campos.join(
          ", "
        )}, fecha_actualizacion = CURRENT_TIMESTAMP
        WHERE id_admin = ?
      `;

      const { rows } = await pg.query(query, params);

      return FormatterResponseModel.respuestaPostgres(
        rows,
        "Perfil actualizado exitosamente"
      );
    } catch (error) {
      error.details = { path: "AdminModel.actualizarPerfil" };
      throw FormatterResponseModel.respuestaError(
        error,
        "Error al actualizar perfil"
      );
    }
  }

  /**
   * @static
   * @async
   * @method desactivar
   * @description Desactivar un administrador del sistema (cambiar estado a inactivo)
   * @param {number} id_admin - ID del administrador a desactivar
   * @param {number} id_usuario - ID del usuario que realiza la acción
   * @returns {Promise<Object>} Resultado de la operación
   */
  static async desactivar(id_admin, id_usuario) {
    try {
      const query = `
        UPDATE public.administradores 
        SET estado = 'inactivo', fecha_actualizacion = CURRENT_TIMESTAMP, id_usuario_actualizacion = ?
        WHERE id_admin = ?
      `;
      const params = [id_usuario, id_admin];

      const { rows } = await pg.query(query, params);

      return FormatterResponseModel.respuestaPostgres(
        rows,
        "Administrador desactivado exitosamente"
      );
    } catch (error) {
      error.details = { path: "AdminModel.desactivar" };
      throw FormatterResponseModel.respuestaError(
        error,
        "Error al desactivar administrador"
      );
    }
  }

  /**
   * @static
   * @async
   * @method cambiarRol
   * @description Cambiar el rol de un administrador
   * @param {number} id_admin - ID del administrador
   * @param {string} nuevo_rol - Nuevo rol a asignar
   * @param {number} id_usuario - ID del usuario que realiza la acción
   * @returns {Promise<Object>} Resultado de la operación
   */
  static async cambiarRol(id_admin, nuevo_rol, id_usuario) {
    try {
      const query = `
        UPDATE public.administradores 
        SET rol = ?, fecha_actualizacion = CURRENT_TIMESTAMP, id_usuario_actualizacion = ?
        WHERE id_admin = ?
      `;
      const params = [nuevo_rol, id_usuario, id_admin];

      const { rows } = await pg.query(query, params);

      return FormatterResponseModel.respuestaPostgres(
        rows,
        "Rol de administrador cambiado exitosamente"
      );
    } catch (error) {
      error.details = { path: "AdminModel.cambiarRol" };
      throw FormatterResponseModel.respuestaError(
        error,
        "Error al cambiar rol de administrador"
      );
    }
  }

  /**
   * @static
   * @async
   * @method filtrarPorRol
   * @description Filtrar administradores por rol específico
   * @param {string} rol - Rol a filtrar
   * @returns {Promise<Object>} Lista de administradores del rol especificado
   */
  static async filtrarPorRol(rol) {
    try {
      const query = `
        SELECT 
          id_admin,
          cedula,
          nombre,
          apellido,
          email,
          rol,
          estado,
          fecha_registro
        FROM public.administradores 
        WHERE rol = ? AND estado = 'activo'
        ORDER BY nombre, apellido ASC
      `;
      const params = [rol];

      const { rows } = await pg.query(query, params);

      return FormatterResponseModel.respuestaPostgres(
        rows,
        `Administradores con rol ${rol} obtenidos exitosamente`
      );
    } catch (error) {
      error.details = { path: "AdminModel.filtrarPorRol" };
      throw FormatterResponseModel.respuestaError(
        error,
        "Error al filtrar administradores por rol"
      );
    }
  }

  /**
   * @static
   * @async
   * @method filtrarPorEstado
   * @description Filtrar administradores por estado específico
   * @param {string} estado - Estado a filtrar (activo/inactivo)
   * @returns {Promise<Object>} Lista de administradores del estado especificado
   */
  static async filtrarPorEstado(estado) {
    try {
      const query = `
        SELECT 
          id_admin,
          cedula,
          nombre,
          apellido,
          email,
          rol,
          estado,
          fecha_registro
        FROM public.administradores 
        WHERE estado = ?
        ORDER BY nombre, apellido ASC
      `;
      const params = [estado];

      const { rows } = await pg.query(query, params);

      return FormatterResponseModel.respuestaPostgres(
        rows,
        `Administradores ${estivo}s obtenidos exitosamente`
      );
    } catch (error) {
      error.details = { path: "AdminModel.filtrarPorEstado" };
      throw FormatterResponseModel.respuestaError(
        error,
        "Error al filtrar administradores por estado"
      );
    }
  }

  /**
   * @static
   * @async
   * @method contarPorRolYEstado
   * @description Contar administradores por rol y estado
   * @param {string} rol - Rol a contar
   * @param {string} estado - Estado a contar
   * @returns {Promise<Object>} Número de administradores que cumplen con los criterios
   */
  static async contarPorRolYEstado(rol, estado) {
    try {
      const query = `
        SELECT COUNT(*) as total
        FROM public.administradores 
        WHERE rol = ? AND estado = ?
      `;
      const params = [rol, estado];

      const { rows } = await pg.query(query, params);

      return FormatterResponseModel.respuestaPostgres(
        rows,
        "Conteo de administradores completado"
      );
    } catch (error) {
      error.details = { path: "AdminModel.contarPorRolYEstado" };
      throw FormatterResponseModel.respuestaError(
        error,
        "Error al contar administradores por rol y estado"
      );
    }
  }

  /**
   * @static
   * @async
   * @method actualizarUltimoAcceso
   * @description Actualizar la fecha del último acceso del administrador
   * @param {number} id_admin - ID del administrador
   * @returns {Promise<Object>} Resultado de la operación
   */
  static async actualizarUltimoAcceso(id_admin) {
    try {
      const query = `
        UPDATE public.administradores 
        SET ultimo_acceso = CURRENT_TIMESTAMP
        WHERE id_admin = ?
      `;
      const params = [id_admin];

      const { rows } = await pg.query(query, params);

      return FormatterResponseModel.respuestaPostgres(
        rows,
        "Último acceso actualizado"
      );
    } catch (error) {
      error.details = { path: "AdminModel.actualizarUltimoAcceso" };
      throw FormatterResponseModel.respuestaError(
        error,
        "Error al actualizar último acceso"
      );
    }
  }
}