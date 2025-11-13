import AdminModel from "../models/admin.model.js";
import ValidationService from "./validation.service.js";
import NotificationService from "./notification.service.js";
import ImagenService from "./imagen.service.js";
import EmailService from "./email.service.js";
import FormatterResponseService from "../utils/FormatterResponseService.js";
import { loadEnv, parseJSONField } from "../utils/utilis.js";
import { generarPassword, hashPassword } from "../utils/encrypted.js";

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
   */
  static async registrarAdmin(datos, imagen, user_action, mensajesEmail) {
    const imagenService = new ImagenService("administradores");
    let imagenPath = null;

    try {
      console.log("👤 Iniciando registro de administrador...");

      if (process.env.MODE === "DEVELOPMENT") {
        console.log("📝 Datos recibidos:", {
          datos: JSON.stringify(datos, null, 2),
          user_action: user_action,
        });
      }

      // 1. Procesar datos
      const roles = parseJSONField(datos.roles, "Roles");
      datos = { ...datos, cedula: parseInt(datos.cedula), roles };

      // 2. Validar datos del administrador
      console.log("Validando datos del administrador...");
      const validation = ValidationService.validateAdmins(datos);

      if (!validation.isValid) {
        console.error("❌ Validación de datos fallida:", validation.errors);
        return FormatterResponseService.validationError(
          validation.errors,
          "admins:validation.data_invalid"
        );
      }

      // 3. Validar ID de usuario
      console.log("Validando ID de usuario...");
      const idValidation = ValidationService.validateId(
        user_action.id,
        "general:validation.id_invalid"
      );

      if (!idValidation.isValid) {
        console.error("❌ Validación de ID fallida:", idValidation.errors);
        return FormatterResponseService.validationError(idValidation.errors);
      }

      // 4. Validar y procesar imagen
      if (imagen && imagen.originalname) {
        console.log("Validando imagen...");
        const validationImage = await imagenService.validateImage(
          imagen.originalname,
          {
            maxWidth: 1920,
            maxHeight: 1080,
            maxSize: 5 * 1024 * 1024,
            quality: 85,
            format: "webp",
          }
        );

        if (!validationImage.isValid) {
          return FormatterResponseService.validationError(
            [{ field: "imagen", message: validationImage.error }],
            "admins:validation.image_invalid"
          );
        }

        imagenPath = await imagenService.processAndSaveImage(
          imagen.originalname,
          {
            maxWidth: 1920,
            maxHeight: 1080,
            quality: 85,
            format: "webp",
          }
        );
      }

      // 5. Validar email
      console.log("Validando email...");
      const emailService = new EmailService();
      const validationEmail = await emailService.verificarEmailConAPI(
        datos.email
      );

      if (!validationEmail.existe) {
        return FormatterResponseService.error(
          400,
          "EMAIL_INVALID",
          "admins:errors.email_invalid",
          { email: datos.email }
        );
      }

      // 6. Generar contraseña
      console.log("Generando contraseña...");
      const contrasenia = await generarPassword();
      const hash = await hashPassword(contrasenia);

      // 7. Crear administrador en BD
      console.log("Creando administrador en base de datos...");
      const respuestaModel = await AdminModel.crear(
        {
          ...datos,
          imagen: imagenPath ? imagenPath.fileName : null,
          password: hash,
        },
        user_action.id
      );

      if (FormatterResponseService.isError(respuestaModel)) {
        return respuestaModel;
      }

      // 8. Enviar email de bienvenida
      console.log("Enviando email de bienvenida...");
      const Correo = {
      asunto: mensajesEmail.subject,
      html: this.buildWelcomeAdminEmailHTML(mensajesEmail, datos.email, contrasenia)
    };

      await emailService.enviarEmail({
        Destinatario: datos.email,
        Correo: Correo,
        verificarEmail: false,
      });

      // 9. Enviar notificaciones
      console.log("Enviando notificaciones...");
      const notificationService = new NotificationService();

      // Notificación individual al nuevo admin
      await notificationService.crearNotificacionIndividual({
        titulo: "admins:notifications.welcome_title",
        tipo: "admin_registro_exitoso",
        user_id: datos.cedula,
        contenido: "admins:notifications.welcome_content",
        metadatos: {
          admin_cedula: datos.cedula,
          admin_nombre: `${datos.nombre} ${datos.apellido}`,
          admin_rol: datos.rol,
          fecha_registro: new Date().toISOString(),
          url_action: `/administracion/administradores`,
        },
      });

      // Notificación masiva a otros administradores
      await notificationService.crearNotificacionMasiva({
        tipo: "admin_creado",
        titulo: "admins:notifications.admin_created_title",
        contenido: "admins:notifications.admin_created_content",
        metadatos: {
          admin_cedula: datos.cedula,
          admin_nombre: `${datos.nombre} ${datos.apellido}`,
          admin_email: datos.email,
          admin_rol: datos.rol,
          usuario_creador: user_action.id,
          usuario_creador_nombre: user_action.nombre || user_action.username,
          fecha_registro: new Date().toISOString(),
          url_action: `/administracion/administradores`,
        },
        roles_ids: [10, 20], // Vicerrector, SuperAdmin
        users_ids: [user_action.id],
      });

      console.log("✅ Administrador registrado exitosamente");

      return FormatterResponseService.success(
        {
          admin: {
            cedula: datos.cedula,
            nombre: datos.nombre,
            apellido: datos.apellido,
            email: datos.email,
            rol: datos.rol,
            imagen: imagenPath,
            estado: "activo",
          },
        },
        "admins:success.created",
        "admins:titles.created",
        {
          status: 201,
          title: "Administrador Creado",
        }
      );
    } catch (error) {
      console.error("💥 Error en servicio registrar administrador:", error);
      if (imagenPath != null) {
        imagenService.deleteImage(imagenPath.fileName);
      }
      throw error;
    }
  }

  /**
   * @static
   * @method buildWelcomeAdminEmailHTML
   * @description Construye el HTML del email de bienvenida
   */
  static buildWelcomeAdminEmailHTML(mensajes, email, contrasenia) {
    return `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2 style="color: #2c3e50;">${mensajes.body}</h2>
        <p>${mensajes.credentials}</p>
        <div style="background-color: #f8f9fa; padding: 15px; border-left: 4px solid #3498db; margin: 15px 0;">
          <p><strong>${mensajes.username}</strong> ${email}</p>
          <p><strong>${mensajes.temp_password}</strong> ${contrasenia}</p>
        </div>
        <p><strong>${mensajes.instructions}</strong></p>
        <ul>
          <li>${mensajes.instruction_1}</li>
          <li>${mensajes.instruction_2}</li>
          <li>${mensajes.instruction_3}</li>
        </ul>
      </div>
      <div style="display: flex; flex-direction: row; justify-content: center; align-items: center; width: 100%;">
        <a href="${process.env.ORIGIN_FRONTEND}/inicio-sesion" style="display: inline-block; background-color: #1C75BA; color: white; 
                  padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-bottom: 20px;">
            ${mensajes.login_button}
        </a>
      </div>
  `;
  }

  /**
   * @static
   * @async
   * @method mostrarAdmin
   */
  static async mostrarAdmin(queryParams = {}) {
    try {
      console.log("📋 Obteniendo lista de administradores...");

      if (process.env.MODE === "DEVELOPMENT") {
        console.log("🔍 Parámetros de consulta:", queryParams);
      }

      // 1. Validar parámetros de consulta
      console.log("Validando parámetros de consulta...");
      const allowedParams = ["page", "limit", "sort", "order", "rol", "estado"];
      const queryValidation = ValidationService.validateQueryParams(
        queryParams,
        allowedParams
      );

      if (!queryValidation.isValid) {
        console.error(
          "❌ Validación de parámetros fallida:",
          queryValidation.errors
        );
        return FormatterResponseService.validationError(queryValidation.errors);
      }

      // 2. Obtener administradores del modelo
      console.log("Obteniendo administradores de base de datos...");
      const respuestaModel = await AdminModel.obtenerTodos(queryParams);

      if (FormatterResponseService.isError(respuestaModel)) {
        return respuestaModel;
      }

      if (process.env.MODE === "DEVELOPMENT") {
        console.log("📊 Respuesta del modelo:", respuestaModel);
      }

      console.log(
        `✅ Se obtuvieron ${respuestaModel.data.length} administradores`
      );
      return FormatterResponseService.success(
        {
          administradores: respuestaModel.data,
          total: respuestaModel.data.length,
          page: parseInt(queryParams.page) || 1,
          limit: parseInt(queryParams.limit) || respuestaModel.data.length,
        },
        "admins:success.retrieved_all",
        "admins:titles.list_retrieved",
        {
          status: 200,
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
   * @method obtenerAdminPorId
   */
  static async obtenerAdminPorId(id_admin) {
    try {
      console.log(`🔍 Buscando administrador con ID: ${id_admin}`);

      // 1. Validar ID del administrador
      console.log("Validando ID del administrador...");
      const idValidation = ValidationService.validateId(id_admin, "admin");
      if (!idValidation.isValid) {
        console.error("❌ Validación de ID fallida:", idValidation.errors);
        return FormatterResponseService.validationError(idValidation.errors);
      }

      // 2. Buscar administrador en el modelo
      console.log("Buscando administrador en base de datos...");
      const respuestaModel = await AdminModel.buscarPorId(id_admin);

      if (FormatterResponseService.isError(respuestaModel)) {
        return respuestaModel;
      }

      if (!respuestaModel.data || respuestaModel.data.length === 0) {
        console.error(`❌ Administrador con ID ${id_admin} no encontrado`);
        return FormatterResponseService.notFound(id_admin);
      }

      const admin = respuestaModel.data[0];

      if (process.env.MODE === "DEVELOPMENT") {
        console.log("📊 Administrador encontrado:", admin);
      }

      console.log(
        `✅ Administrador encontrado: ${admin.nombre} ${admin.apellido}`
      );
      return FormatterResponseService.success(
        {
          admin: admin,
        },
        "admins:success.retrieved_one",
        "admins:titles.details_retrieved",
        {
          status: 200,
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
   */
  static async actualizarAdmin(id_admin, datos, user_action) {
    try {
      console.log(`🔄 Actualizando administrador con ID: ${id_admin}`);
      console.log("📝 Datos a actualizar:", datos);

      if (process.env.MODE === "DEVELOPMENT") {
        console.log("👤 Usuario ejecutor:", user_action);
      }

      // 1. Validar ID del administrador
      console.log("Validando ID del administrador...");
      const idValidation = ValidationService.validateId(id_admin, "admin");
      if (!idValidation.isValid) {
        console.error("❌ Validación de ID fallida:", idValidation.errors);
        return FormatterResponseService.validationError(idValidation.errors);
      }

      // 2. Validar datos parciales del administrador
      console.log("Validando datos del administrador...");
      const validation = ValidationService.validatePartialAdmin(datos);
      if (!validation.isValid) {
        console.error("❌ Validación de datos fallida:", validation.errors);
        return FormatterResponseService.validationError(validation.errors);
      }

      // 3. Validar ID de usuario
      console.log("Validando ID de usuario...");
      const userValidation = ValidationService.validateId(
        user_action.id,
        "usuario"
      );
      if (!userValidation.isValid) {
        console.error(
          "❌ Validación de usuario fallida:",
          userValidation.errors
        );
        return FormatterResponseService.validationError(userValidation.errors);
      }

      // 4. Verificar que el administrador existe
      console.log("Verificando existencia del administrador...");
      const adminExistente = await AdminModel.buscarPorId(id_admin);
      if (
        FormatterResponseService.isError(adminExistente) ||
        !adminExistente.data ||
        adminExistente.data.length === 0
      ) {
        console.error(`❌ Administrador con ID ${id_admin} no encontrado`);
        return FormatterResponseService.notFound(id_admin);
      }

      const adminActual = adminExistente.data[0];

      // 5. Verificar duplicados
      console.log("Verificando duplicados...");
      if (datos.cedula || datos.email) {
        const adminDuplicado = await AdminModel.buscarPorCedulaOEmail(
          datos.cedula || adminActual.cedula,
          datos.email || adminActual.email
        );

        if (adminDuplicado.data && adminDuplicado.data.length > 0) {
          const adminDupe = adminDuplicado.data.find(
            (admin) => admin.id_admin !== id_admin
          );
          if (adminDupe) {
            console.error("❌ Administrador duplicado encontrado:", adminDupe);
            return FormatterResponseService.error(409, "ADMIN_DUPLICADO", {
              admin_existente: {
                id: adminDupe.id_admin,
                cedula: adminDupe.cedula,
                email: adminDupe.email,
              },
            });
          }
        }
      }

      // 6. Actualizar administrador
      console.log("Actualizando administrador en base de datos...");
      const respuestaModel = await AdminModel.actualizar(
        id_admin,
        datos,
        user_action.id
      );

      if (FormatterResponseService.isError(respuestaModel)) {
        return respuestaModel;
      }

      if (process.env.MODE === "DEVELOPMENT") {
        console.log("📊 Respuesta del modelo:", respuestaModel);
      }

      // 7. Enviar notificación
      console.log("Enviando notificaciones...");
      const notificationService = new NotificationService();
      await notificationService.crearNotificacionMasiva({
        tipo: "admin_actualizado",
        titulo: "admins:notifications.admin_updated_title",
        contenido: "admins:notifications.admin_updated_content",
        metadatos: {
          admin_id: id_admin,
          admin_cedula: datos.cedula || adminActual.cedula,
          admin_nombre: datos.nombre || adminActual.nombre,
          admin_apellido: datos.apellido || adminActual.apellido,
          campos_actualizados: Object.keys(datos),
          usuario_actualizador: user_action.id,
          usuario_actualizador_nombre:
            user_action.nombre || user_action.username,
          fecha_actualizacion: new Date().toISOString(),
          url_action: `/administracion/administradores/${id_admin}`,
        },
        roles_ids: [10, 20],
        users_ids: [user_action.id],
      });

      console.log(`✅ Administrador ${id_admin} actualizado exitosamente`);
      return FormatterResponseService.success(
        {
          admin_id: id_admin,
          cambios: Object.keys(datos),
          admin_actualizado: {
            id: id_admin,
            cedula: datos.cedula || adminActual.cedula,
            nombre: datos.nombre || adminActual.nombre,
            apellido: datos.apellido || adminActual.apellido,
            email: datos.email || adminActual.email,
          },
        },
        "admins:success.updated",
        "admins:titles.updated",
        {
          status: 200,
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
   */
  static async desactivarAdmin(id_admin, user_action) {
    try {
      console.log(`🗑️ Desactivando administrador con ID: ${id_admin}`);

      if (process.env.MODE === "DEVELOPMENT") {
        console.log("👤 Usuario ejecutor:", user_action);
      }

      // 1. Validar ID del administrador
      console.log("Validando ID del administrador...");
      const idValidation = ValidationService.validateId(id_admin, "admin");
      if (!idValidation.isValid) {
        console.error("❌ Validación de ID fallida:", idValidation.errors);
        return FormatterResponseService.validationError(idValidation.errors);
      }

      // 2. Validar ID de usuario
      console.log("Validando ID de usuario...");
      const userValidation = ValidationService.validateId(
        user_action.id,
        "usuario"
      );
      if (!userValidation.isValid) {
        console.error(
          "❌ Validación de usuario fallida:",
          userValidation.errors
        );
        return FormatterResponseService.validationError(userValidation.errors);
      }

      // 3. Verificar que el administrador existe
      console.log("Verificando existencia del administrador...");
      const adminExistente = await AdminModel.buscarPorId(id_admin);
      if (
        FormatterResponseService.isError(adminExistente) ||
        !adminExistente.data ||
        adminExistente.data.length === 0
      ) {
        console.error(`❌ Administrador con ID ${id_admin} no encontrado`);
        return FormatterResponseService.notFound(id_admin);
      }

      const admin = adminExistente.data[0];

      // 4. Verificar auto-desactivación
      if (parseInt(id_admin) === parseInt(user_action.id)) {
        console.error("❌ No se puede desactivar a uno mismo");
        return FormatterResponseService.error(
          403,
          "SELF_DEACTIVATION_NOT_ALLOWED",
          {
            accion_recomendada:
              "Contacte a otro administrador para esta acción",
          }
        );
      }

      // 5. Verificar último SuperAdmin
      if (admin.rol === "SuperAdmin") {
        const superAdminsActivos = await AdminModel.contarPorRolYEstado(
          "SuperAdmin",
          "activo"
        );
        if (superAdminsActivos.data <= 1) {
          console.error("❌ No se puede desactivar el último SuperAdmin");
          return FormatterResponseService.error(
            403,
            "LAST_SUPERADMIN_NOT_ALLOWED",
            {
              accion_recomendada:
                "Asigne otro SuperAdmin antes de desactivar este",
            }
          );
        }
      }

      // 6. Desactivar administrador
      console.log("Desactivando administrador en base de datos...");
      const respuestaModel = await AdminModel.desactivar(
        id_admin,
        user_action.id
      );

      if (FormatterResponseService.isError(respuestaModel)) {
        return respuestaModel;
      }

      if (process.env.MODE === "DEVELOPMENT") {
        console.log("📊 Respuesta del modelo:", respuestaModel);
      }

      // 7. Enviar notificación
      console.log("Enviando notificaciones...");
      const notificationService = new NotificationService();
      await notificationService.crearNotificacionMasiva({
        tipo: "admin_desactivado",
        titulo: "admins:notifications.admin_deactivated_title",
        contenido: "admins:notifications.admin_deactivated_content",
        metadatos: {
          admin_id: id_admin,
          admin_cedula: admin.cedula,
          admin_nombre: admin.nombre,
          admin_apellido: admin.apellido,
          admin_rol: admin.rol,
          usuario_ejecutor: user_action.id,
          usuario_ejecutor_nombre: user_action.nombre || user_action.username,
          fecha_desactivacion: new Date().toISOString(),
          url_action: `/administracion/administradores`,
        },
        roles_ids: [10, 20],
        users_ids: [user_action.id],
      });

      console.log(`✅ Administrador ${id_admin} desactivado exitosamente`);
      return FormatterResponseService.success(
        {
          admin: {
            id: id_admin,
            cedula: admin.cedula,
            nombre: admin.nombre,
            apellido: admin.apellido,
            estado: "inactivo",
          },
        },
        "admins:success.deactivated",
        "admins:titles.deactivated",
        {
          status: 200,
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
   */
  static async cambiarRolAdmin(id_admin, nuevos_roles, user_action) {
    try {
      console.log(`🔄 Cambiando roles del administrador con ID: ${id_admin}`);
      console.log("🎭 Nuevos roles:", nuevos_roles);

      if (process.env.MODE === "DEVELOPMENT") {
        console.log("👤 Usuario ejecutor:", user_action);
      }

      // 1. Validar ID del administrador
      console.log("Validando ID del administrador...");
      const idValidation = ValidationService.validateId(id_admin, "admin");
      if (!idValidation.isValid) {
        console.error("❌ Validación de ID fallida:", idValidation.errors);
        return FormatterResponseService.validationError(idValidation.errors);
      }

      // 2. Validar estructura de roles
      console.log("Validando estructura de roles...");
      if (!Array.isArray(nuevos_roles)) {
        return FormatterResponseService.validationError([
          {
            field: "roles",
            message: "admins:validation.roles_array_required",
          },
        ]);
      }

      for (const rol of nuevos_roles) {
        if (!rol.id_rol || !rol.nombre_rol) {
          return FormatterResponseService.validationError([
            {
              field: "roles",
              message: "admins:validation.role_structure_invalid",
            },
          ]);
        }
      }

      // 3. Validar ID de usuario
      console.log("Validando ID de usuario...");
      const userValidation = ValidationService.validateId(
        user_action.id,
        "usuario"
      );
      if (!userValidation.isValid) {
        console.error(
          "❌ Validación de usuario fallida:",
          userValidation.errors
        );
        return FormatterResponseService.validationError(userValidation.errors);
      }

      // 4. Verificar que el administrador existe
      console.log("Verificando existencia del administrador...");
      const adminExistente = await AdminModel.buscarPorId(id_admin);
      if (
        FormatterResponseService.isError(adminExistente) ||
        !adminExistente.data ||
        adminExistente.data.length === 0
      ) {
        console.error(`❌ Administrador con ID ${id_admin} no encontrado`);
        return FormatterResponseService.notFound(id_admin);
      }

      const admin = adminExistente.data[0];

      // 5. Verificar auto-modificación
      if (parseInt(id_admin) === parseInt(user_action.id)) {
        console.error("❌ No se puede modificar los roles propios");
        return FormatterResponseService.error(
          403,
          "SELF_ROLE_CHANGE_NOT_ALLOWED",
          {
            accion_recomendada:
              "Contacte a otro administrador para esta acción",
          }
        );
      }

      // 6. Procesar roles
      console.log("Procesando roles...");
      const rolesNoModificables = [1, 2, 10, 20];
      const rolesModificables = [7, 8, 9];

      const rolesActuales = admin.roles || admin.id_roles || [];
      const nombresRolesActuales = admin.nombre_roles || [];

      const rolesNoModificablesActuales = rolesActuales.filter((rolId) =>
        rolesNoModificables.includes(rolId)
      );
      const nuevosRolesModificablesIds = nuevos_roles
        .map((rol) => rol.id_rol)
        .filter((rolId) => rolesModificables.includes(rolId));

      const rolesFinales = [
        ...rolesNoModificablesActuales,
        ...nuevosRolesModificablesIds,
      ];

      // 7. Validar reglas de negocio
      console.log("Validando reglas de negocio de roles...");
      const rolesAdministrativosSeleccionados =
        nuevosRolesModificablesIds.filter((id) => [7, 8, 9].includes(id));
      if (rolesAdministrativosSeleccionados.length > 1) {
        return FormatterResponseService.validationError([
          {
            field: "roles",
            message: "admins:validation.single_admin_role_allowed",
          },
        ]);
      }

      // 8. Verificar último SuperAdmin
      const tieneSuperAdminActual = rolesActuales.includes(20);
      const tieneSuperAdminFinal = rolesFinales.includes(20);

      if (tieneSuperAdminActual && !tieneSuperAdminFinal) {
        const superAdminsActivos = await AdminModel.contarPorRolYEstado(
          20,
          "activo"
        );
        if (superAdminsActivos.data <= 1) {
          console.error("❌ No se puede remover el último SuperAdmin");
          return FormatterResponseService.error(
            403,
            "LAST_SUPERADMIN_ROLE_CHANGE_NOT_ALLOWED",
            {
              accion_recomendada:
                "Asigne otro SuperAdmin antes de remover este rol",
            }
          );
        }
      }

      // 9. Mapear nombres de roles
      const mapeoRoles = {
        1: "Profesor",
        2: "Coordinador",
        7: "Director/a de gestión Curricular",
        8: "Director/a de Gestión Permanente y Docente",
        9: "Secretari@ Vicerrect@r",
        10: "Vicerrector",
        20: "SuperAdmin",
      };

      const rolesAnterioresNombres = nombresRolesActuales.join(", ");
      const rolesFinalesNombres = rolesFinales
        .map((id) => mapeoRoles[id] || `Rol ${id}`)
        .join(", ");

      // 10. Actualizar roles en BD
      console.log("Actualizando roles en base de datos...");
      const respuestaModel = await AdminModel.cambiarRol(
        id_admin,
        rolesFinales,
        user_action.id
      );

      if (FormatterResponseService.isError(respuestaModel)) {
        return respuestaModel;
      }

      if (process.env.MODE === "DEVELOPMENT") {
        console.log("📊 Respuesta del modelo:", respuestaModel);
      }

      // 11. Enviar notificación
      console.log("Enviando notificaciones...");
      const notificationService = new NotificationService();
      await notificationService.crearNotificacionMasiva({
        tipo: "admin_roles_actualizados",
        titulo: "admins:notifications.roles_updated_title",
        contenido: "admins:notifications.roles_updated_content",
        metadatos: {
          admin_id: id_admin,
          admin_cedula: admin.cedula,
          admin_nombre: admin.nombre,
          admin_apellido: admin.apellido,
          roles_anteriores: rolesAnterioresNombres,
          roles_nuevos: rolesFinalesNombres,
          roles_ids_anteriores: rolesActuales,
          roles_ids_nuevos: rolesFinales,
          usuario_ejecutor: user_action.id,
          usuario_ejecutor_nombre: user_action.nombre || user_action.username,
          fecha_cambio: new Date().toISOString(),
          url_action: `/administracion/administradores/${id_admin}`,
        },
        roles_ids: [10, 20],
        users_ids: [user_action.id],
      });

      console.log(
        `✅ Roles del administrador ${id_admin} actualizados exitosamente`
      );
      return FormatterResponseService.success(
        {
          admin: {
            id: id_admin,
            cedula: admin.cedula,
            nombre: admin.nombre,
            apellido: admin.apellido,
            roles_anteriores: rolesAnterioresNombres,
            roles_nuevos: rolesFinalesNombres,
            roles_ids_anteriores: rolesActuales,
            roles_ids_nuevos: rolesFinales,
          },
          cambios: {
            roles_mantenidos: rolesNoModificablesActuales,
            roles_agregados: nuevosRolesModificablesIds,
            roles_eliminados: rolesActuales.filter(
              (rol) => !rolesFinales.includes(rol)
            ),
          },
        },
        "admins:success.roles_updated",
        "admins:titles.roles_updated",
        {
          status: 200,
        }
      );
    } catch (error) {
      console.error(
        "💥 Error en servicio cambiar roles de administrador:",
        error
      );
      throw error;
    }
  }

  /**
   * @static
   * @async
   * @method getProfile
   */
  static async getProfile(user) {
    try {
      console.log(`👤 Obteniendo perfil del administrador con ID: ${user.id}`);

      // 1. Validar ID de usuario
      console.log("Validando ID de usuario...");
      const userValidation = ValidationService.validateId(user.id, "usuario");
      if (!userValidation.isValid) {
        console.error(
          "❌ Validación de usuario fallida:",
          userValidation.errors
        );
        return FormatterResponseService.validationError(userValidation.errors);
      }

      // 2. Buscar administrador en el modelo
      console.log("Buscando administrador en base de datos...");
      const respuestaModel = await AdminModel.buscarPorId(user.id);

      if (FormatterResponseService.isError(respuestaModel)) {
        return respuestaModel;
      }

      if (!respuestaModel.data || respuestaModel.data.length === 0) {
        console.error(`❌ Administrador con ID ${user.id} no encontrado`);
        return FormatterResponseService.notFound(user.id);
      }

      const admin = respuestaModel.data[0];

      // 3. Preparar información del perfil
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

      if (process.env.MODE === "DEVELOPMENT") {
        console.log("📊 Perfil encontrado:", profileInfo);
      }

      console.log(`✅ Perfil obtenido: ${admin.nombre} ${admin.apellido}`);
      return FormatterResponseService.success(
        { profile: profileInfo },
        "admins:success.profile_retrieved",
        "admins:titles.profile_retrieved",
        {
          status: 200,
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
   */
  static async updateProfile(user, datos) {
    try {
      console.log(
        `🔄 Actualizando perfil del administrador con ID: ${user.id}`
      );
      console.log("📝 Datos a actualizar:", datos);

      // 1. Validar ID de usuario
      console.log("Validando ID de usuario...");
      const userValidation = ValidationService.validateId(user.id, "usuario");
      if (!userValidation.isValid) {
        console.error(
          "❌ Validación de usuario fallida:",
          userValidation.errors
        );
        return FormatterResponseService.validationError(userValidation.errors);
      }

      // 2. Filtrar campos permitidos
      console.log("Filtrando campos permitidos...");
      const camposPermitidos = ["nombre", "apellido", "email"];
      const datosFiltrados = {};

      for (const campo of camposPermitidos) {
        if (datos[campo] !== undefined) {
          datosFiltrados[campo] = datos[campo];
        }
      }

      if (Object.keys(datosFiltrados).length === 0) {
        return FormatterResponseService.validationError([
          {
            field: "datos",
            message: "admins:validation.no_valid_fields",
          },
        ]);
      }

      // 3. Validar datos parciales
      console.log("Validando datos del perfil...");
      const validation = ValidationService.validatePartialAdmin(datosFiltrados);
      if (!validation.isValid) {
        console.error("❌ Validación de datos fallida:", validation.errors);
        return FormatterResponseService.validationError(validation.errors);
      }

      // 4. Verificar duplicados de email
      if (datosFiltrados.email) {
        console.log("Verificando duplicados de email...");
        const adminDuplicado = await AdminModel.buscarPorEmail(
          datosFiltrados.email
        );
        if (adminDuplicado.data && adminDuplicado.data.length > 0) {
          const adminDupe = adminDuplicado.data.find(
            (admin) => admin.id_admin !== user.id
          );
          if (adminDupe) {
            console.error("❌ Email duplicado encontrado:", adminDupe);
            return FormatterResponseService.error(409, "EMAIL_DUPLICATED", {
              admin_existente: {
                id: adminDupe.id_admin,
                email: adminDupe.email,
              },
            });
          }
        }
      }

      // 5. Actualizar perfil en BD
      console.log("Actualizando perfil en base de datos...");
      const respuestaModel = await AdminModel.actualizarPerfil(
        user.id,
        datosFiltrados
      );

      if (FormatterResponseService.isError(respuestaModel)) {
        return respuestaModel;
      }

      if (process.env.MODE === "DEVELOPMENT") {
        console.log("📊 Respuesta del modelo:", respuestaModel);
      }

      console.log(
        `✅ Perfil del administrador ${user.id} actualizado exitosamente`
      );
      return FormatterResponseService.success(
        {
          cambios: Object.keys(datosFiltrados),
        },
        "admins:success.profile_updated",
        "admins:titles.profile_updated",
        {
          status: 200,
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
   */
  static async obtenerAdminsPorRol(rol) {
    try {
      console.log(`🎭 Obteniendo administradores por rol: ${rol}`);

      // 1. Validar parámetro rol
      console.log("Validando parámetro rol...");
      const rolesValidos = [
        "SuperAdmin",
        "Vicerrector",
        "Director General de Gestión Curricular",
        "Coordinador",
      ];
      if (!rol || !rolesValidos.includes(rol)) {
        return FormatterResponseService.validationError([
          {
            field: "rol",
            message: "admins:validation.invalid_role",
          },
        ]);
      }

      // 2. Obtener administradores por rol del modelo
      console.log("Obteniendo administradores por rol de base de datos...");
      const respuestaModel = await AdminModel.filtrarPorRol(rol);

      if (FormatterResponseService.isError(respuestaModel)) {
        return respuestaModel;
      }

      if (process.env.MODE === "DEVELOPMENT") {
        console.log("📊 Respuesta del modelo:", respuestaModel);
      }

      console.log(
        `✅ Se obtuvieron ${respuestaModel.data.length} administradores para rol ${rol}`
      );
      return FormatterResponseService.success(
        {
          administradores: respuestaModel.data,
          total: respuestaModel.data.length,
          rol: rol,
        },
        "admins:success.filtered_by_role",
        "admins:titles.filtered_by_role",
        {
          status: 200,
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
   */
  static async obtenerAdminsPorEstado(estado) {
    try {
      console.log(`📊 Obteniendo administradores por estado: ${estado}`);

      // 1. Validar parámetro estado
      console.log("Validando parámetro estado...");
      const estadosValidos = ["activo", "inactivo"];
      if (!estado || !estadosValidos.includes(estado)) {
        return FormatterResponseService.validationError([
          {
            field: "estado",
            message: "admins:validation.invalid_status",
          },
        ]);
      }

      // 2. Obtener administradores por estado del modelo
      console.log("Obteniendo administradores por estado de base de datos...");
      const respuestaModel = await AdminModel.filtrarPorEstado(estado);

      if (FormatterResponseService.isError(respuestaModel)) {
        return respuestaModel;
      }

      if (process.env.MODE === "DEVELOPMENT") {
        console.log("📊 Respuesta del modelo:", respuestaModel);
      }

      console.log(
        `✅ Se obtuvieron ${respuestaModel.data.length} administradores en estado ${estado}`
      );
      return FormatterResponseService.success(
        {
          administradores: respuestaModel.data,
          total: respuestaModel.data.length,
          estado: estado,
        },
        "admins:success.filtered_by_status",
        "admins:titles.filtered_by_status",
        {
          status: 200,
        }
      );
    } catch (error) {
      console.error("💥 Error en servicio obtener admins por estado:", error);
      throw error;
    }
  }
}
