import ValidationService from "./validation.service.js";
import NotificationService from "./notification.service.js";
import AdminModel from "../models/admin.model.js";
import FormatterResponseService from "../utils/FormatterResponseService.js";
import { loadEnv } from "../utils/utilis.js";

loadEnv();

/**
 * @class AdminService
 * @description Servicio para operaciones de negocio relacionadas con administradores
 */
export default class AdminService {
  /**
   * @static
   * @async
   * @method registrarAdmin
   * @description Registrar un nuevo administrador con validación y notificación
   * @param {Object} datos - Datos del administrador a registrar
   * @param {object} user_action - Usuario que realiza la acción
   * @returns {Object} Resultado de la operación
   */
  static async registrarAdmin(datos, user_action) {
    try {
      console.log("🔍 [registrarAdmin] Iniciando registro de administrador...");
      console.log("🏷️ Datos del admin a registrar:", datos);
      if (process.env.MODE === "DEVELOPMENT") {
        console.log("📝 Datos recibidos:", {
          datos: JSON.stringify(datos, null, 2),
          user_action: user_action,
        });
      }

      // 1. Validar datos del administrador
      console.log("✅ Validando datos del administrador...");
      const validation = ValidationService.validateAdmin(datos);

      if (!validation.isValid) {
        console.error("❌ Validación de datos fallida:", validation.errors);
        return FormatterResponseService.validationError(
          validation.errors,
          "Error de validación en registro de administrador"
        );
      }

      // 2. Validar ID de usuario
      console.log("✅ Validando ID de usuario...");
      const idValidation = ValidationService.validateId(
        user_action.id,
        "usuario"
      );

      if (!idValidation.isValid) {
        console.error("❌ Validación de ID fallida:", idValidation.errors);
        return FormatterResponseService.validationError(
          idValidation.errors,
          "ID de usuario inválido"
        );
      }

      // 3. Verificar si ya existe un administrador con la misma cédula o email
      console.log("🔎 Verificando duplicados...");
      const adminExistente = await AdminModel.buscarPorCedulaOEmail(
        datos.cedula,
        datos.email
      );

      if (adminExistente.data && adminExistente.data.length > 0) {
        const adminDuplicado = adminExistente.data[0];
        return FormatterResponseService.error(
          "Administrador ya existe",
          "Ya existe un administrador con la misma cédula o email",
          409,
          "ADMIN_DUPLICADO",
          {
            admin_existente: {
              id: adminDuplicado.id_admin,
              cedula: adminDuplicado.cedula,
              email: adminDuplicado.email,
            },
          }
        );
      }

      // 4. Crear administrador en el modelo
      console.log("👨‍💼 Creando administrador en base de datos...");
      const respuestaModel = await AdminModel.crear(datos, user_action.id);

      if (FormatterResponseService.isError(respuestaModel)) {
        return respuestaModel;
      }

      if (process.env.MODE === "DEVELOPMENT") {
        console.log("📊 Respuesta del modelo:", respuestaModel);
      }

      // 5. Enviar notificación solo a Vicerrector y SuperAdmin
      console.log("🔔 Enviando notificaciones a Vicerrector y SuperAdmin...");
      const notificationService = new NotificationService();
      await notificationService.crearNotificacionMasiva({
        titulo: "Nuevo Administrador Registrado",
        tipo: "admin_creado",
        contenido: `Se ha registrado el administrador ${datos.nombre} ${datos.apellido} (${datos.cedula}) con rol: ${datos.rol}`,
        metadatos: {
          admin_id: respuestaModel.data?.id_admin,
          admin_cedula: datos.cedula,
          admin_nombre: datos.nombre,
          admin_apellido: datos.apellido,
          admin_email: datos.email,
          admin_rol: datos.rol,
          usuario_creador: user_action.id,
          fecha_registro: new Date().toISOString(),
          url_action: `/administracion/administradores`,
        },
        roles_ids: [10, 20], // Solo Vicerrector (10) y SuperAdmin (20)
        users_ids: [user_action.id], // Usuario que creó el admin
      });

      console.log("🎉 Administrador registrado exitosamente");

      return FormatterResponseService.success(
        {
          message: "Administrador creado exitosamente",
          admin: {
            id: respuestaModel.data?.id_admin,
            cedula: datos.cedula,
            nombre: datos.nombre,
            apellido: datos.apellido,
            email: datos.email,
            rol: datos.rol,
            estado: "activo",
          },
        },
        "Administrador registrado exitosamente",
        {
          status: 201,
          title: "Administrador Creado",
        }
      );
    } catch (error) {
      console.error("💥 Error en servicio registrar administrador:", error);
      throw error;
    }
  }

  /**
   * @static
   * @async
   * @method mostrarAdmin
   * @description Obtener todos los administradores con validación de parámetros
   * @param {Object} queryParams - Parámetros de consulta (opcional)
   * @returns {Object} Resultado de la operación
   */
  static async mostrarAdmin(queryParams = {}) {
    try {
      console.log("🔍 [mostrarAdmin] Obteniendo todos los administradores...");

      // Validar parámetros de consulta
      const allowedParams = ["page", "limit", "sort", "order", "rol", "estado"];
      const queryValidation = ValidationService.validateQueryParams(
        queryParams,
        allowedParams
      );

      if (!queryValidation.isValid) {
        return FormatterResponseService.validationError(
          queryValidation.errors,
          "Error de validación en parámetros de consulta"
        );
      }

      const respuestaModel = await AdminModel.obtenerTodos(queryParams);

      if (FormatterResponseService.isError(respuestaModel)) {
        return respuestaModel;
      }

      return FormatterResponseService.success(
        {
          administradores: respuestaModel.data,
          total: respuestaModel.data.length,
          page: parseInt(queryParams.page) || 1,
          limit: parseInt(queryParams.limit) || respuestaModel.data.length,
        },
        "Administradores obtenidos exitosamente",
        {
          status: 200,
          title: "Lista de Administradores",
        }
      );
    } catch (error) {
      console.error("💥 Error en servicio mostrar administradores:", error);
      throw error;
    }
  }

  /**
   * @static
   * @async
   * @method buscarAdmin
   * @description Buscar administradores por cédula, nombre, email o apellido
   * @param {string} busqueda - Término de búsqueda
   * @returns {Object} Resultado de la operación
   */
  static async buscarAdmin(busqueda) {
    try {
      console.log(`🔍 [buscarAdmin] Buscando administradores: ${busqueda}`);

      // Validar término de búsqueda
      if (!busqueda || typeof busqueda !== "string" || busqueda.trim().length === 0) {
        return FormatterResponseService.validationError(
          [
            {
              path: "busqueda",
              message: "El término de búsqueda es requerido",
            },
          ],
          "Error de validación en búsqueda"
        );
      }

      const busquedaLimpia = busqueda.trim();

      const respuestaModel = await AdminModel.buscar(busquedaLimpia);

      if (FormatterResponseService.isError(respuestaModel)) {
        return respuestaModel;
      }

      return FormatterResponseService.success(
        {
          administradores: respuestaModel.data,
          total: respuestaModel.data.length,
          busqueda: busquedaLimpia,
        },
        `Búsqueda de administradores completada`,
        {
          status: 200,
          title: "Resultados de Búsqueda",
        }
      );
    } catch (error) {
      console.error("💥 Error en servicio buscar administradores:", error);
      throw error;
    }
  }

  /**
   * @static
   * @async
   * @method obtenerAdminPorId
   * @description Obtener un administrador específico por ID con validación
   * @param {number} id_admin - ID del administrador a buscar
   * @returns {Object} Resultado de la operación
   */
  static async obtenerAdminPorId(id_admin) {
    try {
      console.log(`🔍 [obtenerAdminPorId] Buscando admin ID: ${id_admin}`);

      // Validar ID del administrador
      const idValidation = ValidationService.validateId(id_admin, "administrador");
      if (!idValidation.isValid) {
        return FormatterResponseService.validationError(
          idValidation.errors,
          "ID de administrador inválido"
        );
      }

      const respuestaModel = await AdminModel.buscarPorId(id_admin);

      if (FormatterResponseService.isError(respuestaModel)) {
        return respuestaModel;
      }

      if (!respuestaModel.data || respuestaModel.data.length === 0) {
        return FormatterResponseService.notFound("Administrador", id_admin);
      }

      const admin = respuestaModel.data[0];

      console.log(`✅ Administrador encontrado: ${admin.nombre} ${admin.apellido}`);

      return FormatterResponseService.success(
        {
          admin: admin,
        },
        "Administrador obtenido exitosamente",
        {
          status: 200,
          title: "Detalles del Administrador",
        }
      );
    } catch (error) {
      console.error("💥 Error en servicio obtener admin por ID:", error);
      throw error;
    }
  }

  /**
   * @static
   * @async
   * @method actualizarAdmin
   * @description Actualizar un administrador existente con validación y notificación
   * @param {number} id_admin - ID del administrador a actualizar
   * @param {Object} datos - Datos actualizados del administrador
   * @param {object} user_action - Usuario que realiza la acción
   * @returns {Object} Resultado de la operación
   */
  static async actualizarAdmin(id_admin, datos, user_action) {
    try {
      console.log(`🔍 [actualizarAdmin] Actualizando admin ID: ${id_admin}`);

      // Validar ID del administrador
      const idValidation = ValidationService.validateId(id_admin, "administrador");
      if (!idValidation.isValid) {
        return FormatterResponseService.validationError(
          idValidation.errors,
          "ID de administrador inválido"
        );
      }

      // Validar datos parciales del administrador
      const validation = ValidationService.validatePartialAdmin(datos);
      if (!validation.isValid) {
        return FormatterResponseService.validationError(
          validation.errors,
          "Error de validación en actualización de administrador"
        );
      }

      // Validar ID de usuario
      const userValidation = ValidationService.validateId(
        user_action.id,
        "usuario"
      );
      if (!userValidation.isValid) {
        return FormatterResponseService.validationError(
          userValidation.errors,
          "ID de usuario inválido"
        );
      }

      // Verificar que el administrador existe
      const adminExistente = await AdminModel.buscarPorId(id_admin);
      if (
        FormatterResponseService.isError(adminExistente) ||
        !adminExistente.data ||
        adminExistente.data.length === 0
      ) {
        return FormatterResponseService.notFound("Administrador", id_admin);
      }

      const adminActual = adminExistente.data[0];

      // Verificar duplicados si se está actualizando cédula o email
      if (datos.cedula || datos.email) {
        const adminDuplicado = await AdminModel.buscarPorCedulaOEmail(
          datos.cedula || adminActual.cedula,
          datos.email || adminActual.email
        );

        if (adminDuplicado.data && adminDuplicado.data.length > 0) {
          const adminDupe = adminDuplicado.data.find(admin => admin.id_admin !== id_admin);
          if (adminDupe) {
            return FormatterResponseService.error(
              "Administrador ya existe",
              "Ya existe otro administrador con la misma cédula o email",
              409,
              "ADMIN_DUPLICADO",
              {
                admin_existente: {
                  id: adminDupe.id_admin,
                  cedula: adminDupe.cedula,
                  email: adminDupe.email,
                },
              }
            );
          }
        }
      }

      // Actualizar administrador
      const respuestaModel = await AdminModel.actualizar(
        id_admin,
        datos,
        user_action.id
      );

      if (FormatterResponseService.isError(respuestaModel)) {
        return respuestaModel;
      }

      // Enviar notificación solo a Vicerrector y SuperAdmin
      const notificationService = new NotificationService();
      await notificationService.crearNotificacionMasiva({
        titulo: "Administrador Actualizado",
        tipo: "admin_actualizado",
        contenido: `Se han actualizado los datos del administrador ${datos.nombre || adminActual.nombre} ${datos.apellido || adminActual.apellido}`,
        metadatos: {
          admin_id: id_admin,
          admin_cedula: datos.cedula || adminActual.cedula,
          admin_nombre: datos.nombre || adminActual.nombre,
          admin_apellido: datos.apellido || adminActual.apellido,
          campos_actualizados: Object.keys(datos),
          usuario_actualizador: user_action.id,
          fecha_actualizacion: new Date().toISOString(),
          url_action: `/administracion/administradores/${id_admin}`,
        },
        roles_ids: [10, 20], // Solo Vicerrector (10) y SuperAdmin (20)
        users_ids: [user_action.id], // Usuario que actualizó el admin
      });

      console.log("✅ Administrador actualizado exitosamente");

      return FormatterResponseService.success(
        {
          message: "Administrador actualizado exitosamente",
          admin_id: id_admin,
          cambios: Object.keys(datos),
        },
        "Administrador actualizado exitosamente",
        {
          status: 200,
          title: "Administrador Actualizado",
        }
      );
    } catch (error) {
      console.error("💥 Error en servicio actualizar administrador:", error);
      throw error;
    }
  }

  /**
   * @static
   * @async
   * @method desactivarAdmin
   * @description Desactivar un administrador con validación y notificación
   * @param {number} id_admin - ID del administrador a desactivar
   * @param {object} user_action - Usuario que realiza la acción
   * @returns {Object} Resultado de la operación
   */
  static async desactivarAdmin(id_admin, user_action) {
    try {
      console.log(`🔍 [desactivarAdmin] Desactivando admin ID: ${id_admin}`);

      // Validar ID del administrador
      const idValidation = ValidationService.validateId(id_admin, "administrador");
      if (!idValidation.isValid) {
        return FormatterResponseService.validationError(
          idValidation.errors,
          "ID de administrador inválido"
        );
      }

      // Validar ID de usuario
      const userValidation = ValidationService.validateId(
        user_action.id,
        "usuario"
      );
      if (!userValidation.isValid) {
        return FormatterResponseService.validationError(
          userValidation.errors,
          "ID de usuario inválido"
        );
      }

      // Verificar que el administrador existe
      const adminExistente = await AdminModel.buscarPorId(id_admin);
      if (
        FormatterResponseService.isError(adminExistente) ||
        !adminExistente.data ||
        adminExistente.data.length === 0
      ) {
        return FormatterResponseService.notFound("Administrador", id_admin);
      }

      const admin = adminExistente.data[0];

      // No permitir desactivarse a sí mismo
      if (parseInt(id_admin) === parseInt(user_action.id)) {
        return FormatterResponseService.error(
          "Acción no permitida",
          "No puedes desactivar tu propia cuenta",
          403,
          "SELF_DEACTIVATION_NOT_ALLOWED"
        );
      }

      // No permitir desactivar al último SuperAdmin
      if (admin.rol === "SuperAdmin") {
        const superAdminsActivos = await AdminModel.contarPorRolYEstado("SuperAdmin", "activo");
        if (superAdminsActivos.data <= 1) {
          return FormatterResponseService.error(
            "Acción no permitida",
            "No se puede desactivar al último SuperAdmin del sistema",
            403,
            "LAST_SUPERADMIN_NOT_ALLOWED"
          );
        }
      }

      // Desactivar administrador
      const respuestaModel = await AdminModel.desactivar(id_admin, user_action.id);

      if (FormatterResponseService.isError(respuestaModel)) {
        return respuestaModel;
      }

      // Enviar notificación solo a Vicerrector y SuperAdmin
      const notificationService = new NotificationService();
      await notificationService.crearNotificacionMasiva({
        titulo: "Administrador Desactivado",
        tipo: "admin_desactivado",
        contenido: `Se ha desactivado la cuenta del administrador ${admin.nombre} ${admin.apellido} (Rol: ${admin.rol})`,
        metadatos: {
          admin_id: id_admin,
          admin_cedula: admin.cedula,
          admin_nombre: admin.nombre,
          admin_apellido: admin.apellido,
          admin_rol: admin.rol,
          usuario_ejecutor: user_action.id,
          fecha_desactivacion: new Date().toISOString(),
          url_action: `/administracion/administradores`,
        },
        roles_ids: [10, 20], // Solo Vicerrector (10) y SuperAdmin (20)
        users_ids: [user_action.id], // Usuario que desactivó el admin
      });

      console.log("✅ Administrador desactivado exitosamente");

      return FormatterResponseService.success(
        {
          message: "Administrador desactivado exitosamente",
          admin: {
            id: id_admin,
            cedula: admin.cedula,
            nombre: admin.nombre,
            apellido: admin.apellido,
            estado: "inactivo",
          },
        },
        "Administrador desactivado exitosamente",
        {
          status: 200,
          title: "Administrador Desactivado",
        }
      );
    } catch (error) {
      console.error("💥 Error en servicio desactivar administrador:", error);
      throw error;
    }
  }

  /**
   * @static
   * @async
   * @method cambiarRolAdmin
   * @description Cambiar el rol de un administrador con validación y notificación
   * @param {number} id_admin - ID del administrador
   * @param {string} nuevoRol - Nuevo rol a asignar
   * @param {object} user_action - Usuario que realiza la acción
   * @returns {Object} Resultado de la operación
   */
  static async cambiarRolAdmin(id_admin, nuevoRol, user_action) {
    try {
      console.log(`🔍 [cambiarRolAdmin] Cambiando rol del admin ID: ${id_admin} a ${nuevoRol}`);

      // Validar ID del administrador
      const idValidation = ValidationService.validateId(id_admin, "administrador");
      if (!idValidation.isValid) {
        return FormatterResponseService.validationError(
          idValidation.errors,
          "ID de administrador inválido"
        );
      }

      // Validar nuevo rol
      const rolesValidos = ["SuperAdmin", "Vicerrector", "Director General de Gestión Curricular", "Coordinador"];
      if (!nuevoRol || !rolesValidos.includes(nuevoRol)) {
        return FormatterResponseService.validationError(
          [
            {
              path: "rol",
              message: `Rol inválido. Los roles válidos son: ${rolesValidos.join(", ")}`,
            },
          ],
          "Error de validación en cambio de rol"
        );
      }

      // Validar ID de usuario
      const userValidation = ValidationService.validateId(
        user_action.id,
        "usuario"
      );
      if (!userValidation.isValid) {
        return FormatterResponseService.validationError(
          userValidation.errors,
          "ID de usuario inválido"
        );
      }

      // Verificar que el administrador existe
      const adminExistente = await AdminModel.buscarPorId(id_admin);
      if (
        FormatterResponseService.isError(adminExistente) ||
        !adminExistente.data ||
        adminExistente.data.length === 0
      ) {
        return FormatterResponseService.notFound("Administrador", id_admin);
      }

      const admin = adminExistente.data[0];

      // No permitir cambiar el rol de sí mismo
      if (parseInt(id_admin) === parseInt(user_action.id)) {
        return FormatterResponseService.error(
          "Acción no permitida",
          "No puedes cambiar tu propio rol",
          403,
          "SELF_ROLE_CHANGE_NOT_ALLOWED"
        );
      }

      // Verificar si es el último SuperAdmin y quiere cambiar su rol
      if (admin.rol === "SuperAdmin" && nuevoRol !== "SuperAdmin") {
        const superAdminsActivos = await AdminModel.contarPorRolYEstado("SuperAdmin", "activo");
        if (superAdminsActivos.data <= 1) {
          return FormatterResponseService.error(
            "Acción no permitida",
            "No se puede cambiar el rol del último SuperAdmin del sistema",
            403,
            "LAST_SUPERADMIN_ROLE_CHANGE_NOT_ALLOWED"
          );
        }
      }

      // Cambiar rol
      const respuestaModel = await AdminModel.cambiarRol(id_admin, nuevoRol, user_action.id);

      if (FormatterResponseService.isError(respuestaModel)) {
        return respuestaModel;
      }

      // Enviar notificación solo a Vicerrector y SuperAdmin
      const notificationService = new NotificationService();
      await notificationService.crearNotificacionMasiva({
        titulo: "Rol de Administrador Cambiado",
        tipo: "admin_rol_cambiado",
        contenido: `Se ha cambiado el rol de ${admin.nombre} ${admin.apellido} de "${admin.rol}" a "${nuevoRol}"`,
        metadatos: {
          admin_id: id_admin,
          admin_cedula: admin.cedula,
          admin_nombre: admin.nombre,
          admin_apellido: admin.apellido,
          rol_anterior: admin.rol,
          rol_nuevo: nuevoRol,
          usuario_ejecutor: user_action.id,
          fecha_cambio: new Date().toISOString(),
          url_action: `/administracion/administradores/${id_admin}`,
        },
        roles_ids: [10, 20], // Solo Vicerrector (10) y SuperAdmin (20)
        users_ids: [user_action.id], // Usuario que cambió el rol
      });

      console.log("✅ Rol de administrador cambiado exitosamente");

      return FormatterResponseService.success(
        {
          message: "Rol de administrador cambiado exitosamente",
          admin: {
            id: id_admin,
            cedula: admin.cedula,
            nombre: admin.nombre,
            apellido: admin.apellido,
            rol_anterior: admin.rol,
            rol_nuevo: nuevoRol,
          },
        },
        "Rol de administrador cambiado exitosamente",
        {
          status: 200,
          title: "Rol Cambiado",
        }
      );
    } catch (error) {
      console.error("💥 Error en servicio cambiar rol de administrador:", error);
      throw error;
    }
  }

  /**
   * @static
   * @async
   * @method getProfile
   * @description Obtener el perfil del administrador autenticado
   * @param {object} user - Usuario autenticado
   * @returns {Object} Resultado de la operación
   */
  static async getProfile(user) {
    try {
      console.log(`🔍 [getProfile] Obteniendo perfil del admin ID: ${user.id}`);

      // Validar ID de usuario
      const userValidation = ValidationService.validateId(user.id, "usuario");
      if (!userValidation.isValid) {
        return FormatterResponseService.validationError(
          userValidation.errors,
          "ID de usuario inválido"
        );
      }

      const respuestaModel = await AdminModel.buscarPorId(user.id);

      if (FormatterResponseService.isError(respuestaModel)) {
        return respuestaModel;
      }

      if (!respuestaModel.data || respuestaModel.data.length === 0) {
        return FormatterResponseService.notFound("Administrador", user.id);
      }

      const admin = respuestaModel.data[0];

      // Filtrar información sensible
      const profileInfo = {
        id: admin.id_admin,
        cedula: admin.cedula,
        nombre: admin.nombre,
        apellido: admin.apellido,
        email: admin.email,
        rol: admin.rol,
        estado: admin.estado,
        fecha_registro: admin.fecha_registro,
        ultimo_acceso: admin.ultimo_acceso,
      };

      console.log(`✅ Perfil obtenido: ${admin.nombre} ${admin.apellido}`);

      return FormatterResponseService.success(
        {
          profile: profileInfo,
        },
        "Perfil obtenido exitosamente",
        {
          status: 200,
          title: "Mi Perfil",
        }
      );
    } catch (error) {
      console.error("💥 Error en servicio obtener perfil:", error);
      throw error;
    }
  }

  /**
   * @static
   * @async
   * @method updateProfile
   * @description Actualizar el perfil del administrador autenticado
   * @param {object} user - Usuario autenticado
   * @param {Object} datos - Datos actualizados del perfil
   * @returns {Object} Resultado de la operación
   */
  static async updateProfile(user, datos) {
    try {
      console.log(`🔍 [updateProfile] Actualizando perfil del admin ID: ${user.id}`);

      // Validar ID de usuario
      const userValidation = ValidationService.validateId(user.id, "usuario");
      if (!userValidation.isValid) {
        return FormatterResponseService.validationError(
          userValidation.errors,
          "ID de usuario inválido"
        );
      }

      // Validar datos permitidos para actualización de perfil
      const camposPermitidos = ["nombre", "apellido", "email"];
      const datosFiltrados = {};
      
      for (const campo of camposPermitidos) {
        if (datos[campo] !== undefined) {
          datosFiltrados[campo] = datos[campo];
        }
      }

      if (Object.keys(datosFiltrados).length === 0) {
        return FormatterResponseService.validationError(
          [
            {
              path: "datos",
              message: "No se proporcionaron datos válidos para actualizar",
            },
          ],
          "Error de validación en actualización de perfil"
        );
      }

      // Validar datos del perfil
      const validation = ValidationService.validatePartialAdmin(datosFiltrados);
      if (!validation.isValid) {
        return FormatterResponseService.validationError(
          validation.errors,
          "Error de validación en actualización de perfil"
        );
      }

      // Verificar duplicados de email
      if (datosFiltrados.email) {
        const adminDuplicado = await AdminModel.buscarPorEmail(datosFiltrados.email);
        if (adminDuplicado.data && adminDuplicado.data.length > 0) {
          const adminDupe = adminDuplicado.data.find(admin => admin.id_admin !== user.id);
          if (adminDupe) {
            return FormatterResponseService.error(
              "Email ya existe",
              "Ya existe otro administrador con el mismo email",
              409,
              "EMAIL_DUPLICADO",
              {
                admin_existente: {
                  id: adminDupe.id_admin,
                  email: adminDupe.email,
                },
              }
            );
          }
        }
      }

      // Actualizar perfil
      const respuestaModel = await AdminModel.actualizarPerfil(user.id, datosFiltrados);

      if (FormatterResponseService.isError(respuestaModel)) {
        return respuestaModel;
      }

      console.log("✅ Perfil actualizado exitosamente");

      return FormatterResponseService.success(
        {
          message: "Perfil actualizado exitosamente",
          cambios: Object.keys(datosFiltrados),
        },
        "Perfil actualizado exitosamente",
        {
          status: 200,
          title: "Perfil Actualizado",
        }
      );
    } catch (error) {
      console.error("💥 Error en servicio actualizar perfil:", error);
      throw error;
    }
  }

  /**
   * @static
   * @async
   * @method obtenerAdminsPorRol
   * @description Obtener administradores filtrados por rol
   * @param {string} rol - Rol a filtrar
   * @returns {Object} Resultado de la operación
   */
  static async obtenerAdminsPorRol(rol) {
    try {
      console.log(`🔍 [obtenerAdminsPorRol] Filtrando admins por rol: ${rol}`);

      // Validar rol
      const rolesValidos = ["SuperAdmin", "Vicerrector", "Director General de Gestión Curricular", "Coordinador"];
      if (!rol || !rolesValidos.includes(rol)) {
        return FormatterResponseService.validationError(
          [
            {
              path: "rol",
              message: `Rol inválido. Los roles válidos son: ${rolesValidos.join(", ")}`,
            },
          ],
          "Error de validación en filtro por rol"
        );
      }

      const respuestaModel = await AdminModel.filtrarPorRol(rol);

      if (FormatterResponseService.isError(respuestaModel)) {
        return respuestaModel;
      }

      return FormatterResponseService.success(
        {
          administradores: respuestaModel.data,
          total: respuestaModel.data.length,
          rol: rol,
        },
        `Administradores con rol ${rol} obtenidos exitosamente`,
        {
          status: 200,
          title: `Administradores - ${rol}`,
        }
      );
    } catch (error) {
      console.error("💥 Error en servicio obtener admins por rol:", error);
      throw error;
    }
  }

  /**
   * @static
   * @async
   * @method obtenerAdminsPorEstado
   * @description Obtener administradores filtrados por estado
   * @param {string} estado - Estado a filtrar (activo/inactivo)
   * @returns {Object} Resultado de la operación
   */
  static async obtenerAdminsPorEstado(estado) {
    try {
      console.log(`🔍 [obtenerAdminsPorEstado] Filtrando admins por estado: ${estado}`);

      // Validar estado
      const estadosValidos = ["activo", "inactivo"];
      if (!estado || !estadosValidos.includes(estado)) {
        return FormatterResponseService.validationError(
          [
            {
              path: "estado",
              message: `Estado inválido. Los estados válidos son: ${estadosValidos.join(", ")}`,
            },
          ],
          "Error de validación en filtro por estado"
        );
      }

      const respuestaModel = await AdminModel.filtrarPorEstado(estado);

      if (FormatterResponseService.isError(respuestaModel)) {
        return respuestaModel;
      }

      return FormatterResponseService.success(
        {
          administradores: respuestaModel.data,
          total: respuestaModel.data.length,
          estado: estado,
        },
        `Administradores ${estado}s obtenidos exitosamente`,
        {
          status: 200,
          title: `Administradores - ${estado}`,
        }
      );
    } catch (error) {
      console.error("💥 Error en servicio obtener admins por estado:", error);
      throw error;
    }
  }
}