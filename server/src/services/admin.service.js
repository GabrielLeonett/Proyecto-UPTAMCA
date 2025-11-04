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
   * @description Registrar un nuevo administrador con validación y notificación
   * @param {Object} datos - Datos del administrador a registrar
   * @param {object} imagen - Imagen del administrador (opcional)
   * @param {object} user_action - Usuario que realiza la acción
   * @returns {Object} Resultado de la operación
   */
  static async registrarAdmin(datos, imagen, user_action) {
    const imagenService = new ImagenService("administradores");
    let imagenPath = null;

    try {
      console.log("🔍 [registrarAdmin] Iniciando registro de administrador...");
      //Formateo de los datos para el ingreso
      const roles = parseJSONField(datos.roles, "Roles");
      datos = { ...datos, cedula: parseInt(datos.cedula), roles };
      // 1. Validar datos del administrador
      console.log("✅ Validando datos del administrador...");
      const validation = ValidationService.validateAdmins(datos);

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

      // 3. Validar imagen (solo si se proporciona)
      if (imagen && imagen.originalname) {
        console.log("🖼️ Validando imagen...");
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
          console.error(
            "❌ Validación de imagen fallida:",
            validationImage.error
          );
          return FormatterResponseService.validationError(
            [{ path: "imagen", message: validationImage.error }],
            "Error de validación de imagen"
          );
        }

        console.log("✅ Imagen válida:", validationImage.message);

        // Guardar imagen y obtener la ruta
        console.log("💾 Procesando y guardando imagen...");
        imagenPath = await imagenService.processAndSaveImage(
          imagen.originalname,
          {
            maxWidth: 1920,
            maxHeight: 1080,
            quality: 85,
            format: "webp",
          }
        );

        if (process.env.MODE === "DEVELOPMENT") {
          console.log("📁 Ruta de imagen guardada:", imagenPath);
        }
      } else {
        console.log("ℹ️ No se proporcionó imagen, continuando sin ella...");
      }

      // 4. Validar email
      console.log("📧 Validando email...");
      const emailService = new EmailService();
      const validationEmail = await emailService.verificarEmailConAPI(
        datos.email
      );

      if (!validationEmail.existe) {
        console.error("❌ Validación de email fallida:", validationEmail);
        return FormatterResponseService.error(
          "El email proporcionado no es válido o no existe",
          "Lo sentimos, el email proporcionado no es válido o no existe",
          400,
          "INVALID_EMAIL",
          {
            email: datos.email,
          }
        );
      }

      // 5. Generar contraseña y hash
      const contrasenia = await generarPassword();
      console.log("🔐 Contraseña generada:", contrasenia);
      const hash = await hashPassword(contrasenia);
      console.log("✅ Contraseña hasheada");

      // 6. Crear administrador en el modelo
      console.log("👨‍💼 Creando administrador en base de datos...");
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

      if (process.env.MODE === "DEVELOPMENT") {
        console.log("📊 Respuesta del modelo:", respuestaModel);
      }

      // 7. Enviar email de bienvenida
      const Correo = {
        asunto:
          "Bienvenido/a al Sistema Académico - Credenciales de Administrador",
        html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2 style="color: #2c3e50;">¡Bienvenido/a, ${datos.nombre}!</h2>
          <p>Es un placer darle la bienvenida a nuestra plataforma académica como administrador.</p>
          <p>Sus credenciales de acceso son:</p>
          <div style="background-color: #f8f9fa; padding: 15px; border-left: 4px solid #3498db; margin: 15px 0;">
            <p><strong>Usuario:</strong> ${datos.email}</p>
            <p><strong>Contraseña temporal:</strong> ${contrasenia}</p>
          </div>
          <p><strong>Instrucciones importantes:</strong></p>
          <ul>
            <li>Cambie su contraseña después del primer acceso</li>
            <li>Esta contraseña es temporal y de uso personal</li>
            <li>Guarde esta información en un lugar seguro</li>
            <li>Su rol en el sistema es: <strong>${datos.rol}</strong></li>
          </ul>
          <p>Si tiene alguna duda, contacte al departamento de soporte técnico.</p>
        </div>
        <div style="display: flex; flex-direction: row; justify-content: center; align-items: center; width: 100%;">
          <a href="${process.env.ORIGIN_FRONTEND}/inicio-sesion" style="display: inline-block; background-color: #1C75BA; color: white; 
                    padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-bottom: 20px;">
              Acceder a la plataforma
          </a>
        </div>
      `,
      };

      const resultadoEmail = await emailService.enviarEmail({
        Destinatario: datos.email,
        Correo: Correo,
        verificarEmail: false,
      });
      console.log("📧 Email enviado:", resultadoEmail);

      // 8. Enviar notificaciones
      console.log("🔔 Enviando notificaciones...");
      const notificationService = new NotificationService();

      // Notificación individual para el administrador creado (solo él la ve)
      await notificationService.crearNotificacionIndividual({
        titulo: "Bienvenido al Sistema como Administrador",
        tipo: "admin_registro_exitoso",
        user_id: datos.cedula,
        contenido: `¡Bienvenido ${datos.nombre} ${datos.apellido}! Su registro como administrador ha sido exitoso.`,
        metadatos: {
          admin_cedula: datos.cedula,
          admin_nombre: `${datos.nombre} ${datos.apellido}`,
          admin_rol: datos.rol,
          fecha_registro: new Date().toISOString(),
          url_action: `/administracion/administradores`,
        },
      });

      // Notificación masiva para roles administrativos superiores
      await notificationService.crearNotificacionMasiva({
        titulo: "Nuevo Administrador Registrado",
        tipo: "admin_creado",
        contenido: `Se ha registrado al administrador ${datos.nombre} ${datos.apellido} (${datos.cedula}) con rol: ${datos.rol}`,
        metadatos: {
          admin_cedula: datos.cedula,
          admin_nombre: `${datos.nombre} ${datos.apellido}`,
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
            cedula: datos.cedula,
            nombre: datos.nombre,
            apellido: datos.apellido,
            email: datos.email,
            rol: datos.rol,
            imagen: imagenPath,
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
      // Limpiar imagen si se guardó y hubo error
      if (imagenPath != null) {
        imagenService.deleteImage(imagenPath.fileName);
      }
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
      if (
        !busqueda ||
        typeof busqueda !== "string" ||
        busqueda.trim().length === 0
      ) {
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
      const idValidation = ValidationService.validateId(
        id_admin,
        "administrador"
      );
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

      console.log(
        `✅ Administrador encontrado: ${admin.nombre} ${admin.apellido}`
      );

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
      const idValidation = ValidationService.validateId(
        id_admin,
        "administrador"
      );
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
          const adminDupe = adminDuplicado.data.find(
            (admin) => admin.id_admin !== id_admin
          );
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
        contenido: `Se han actualizado los datos del administrador ${
          datos.nombre || adminActual.nombre
        } ${datos.apellido || adminActual.apellido}`,
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
      const idValidation = ValidationService.validateId(
        id_admin,
        "administrador"
      );
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
        const superAdminsActivos = await AdminModel.contarPorRolYEstado(
          "SuperAdmin",
          "activo"
        );
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
      const respuestaModel = await AdminModel.desactivar(
        id_admin,
        user_action.id
      );

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
   * @description Actualizar los roles de un administrador con validación y notificación
   * @param {number} id_admin - ID del administrador
   * @param {object[]} nuevos_roles - Array de objetos de roles {id_rol, nombre_rol}
   * @param {object} user_action - Usuario que realiza la acción
   * @returns {Object} Resultado de la operación
   */
  static async cambiarRolAdmin(id_admin, nuevos_roles, user_action) {
    try {
      console.log(
        `🔍 [cambiarRolAdmin] Actualizando roles del admin ID: ${id_admin} a`,
        nuevos_roles
      );

      // Validar ID del administrador
      const idValidation = ValidationService.validateId(
        id_admin,
        "administrador"
      );
      if (!idValidation.isValid) {
        return FormatterResponseService.validationError(
          idValidation.errors,
          "ID de administrador inválido"
        );
      }

      // Validar array de roles
      if (!Array.isArray(nuevos_roles)) {
        return FormatterResponseService.validationError(
          [
            {
              path: "roles",
              message: "Los roles deben ser un array de objetos",
            },
          ],
          "Formato de roles inválido"
        );
      }

      // Validar estructura de cada rol
      for (const rol of nuevos_roles) {
        if (!rol.id_rol || !rol.nombre_rol) {
          return FormatterResponseService.validationError(
            [
              {
                path: "roles",
                message: "Cada rol debe tener id_rol y nombre_rol",
              },
            ],
            "Estructura de roles inválida"
          );
        }
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

      // No permitir cambiar los roles de sí mismo
      if (parseInt(id_admin) === parseInt(user_action.id)) {
        return FormatterResponseService.error(
          "Acción no permitida",
          "No puedes cambiar tus propios roles",
          403,
          "SELF_ROLE_CHANGE_NOT_ALLOWED"
        );
      }

      // 1. SEPARAR ROLES MODIFICABLES Y NO MODIFICABLES
      const rolesNoModificables = [1, 2, 10, 20]; // Profesor, Coordinador, Vicerrector, SuperAdmin
      const rolesModificables = [7, 8, 9]; // Director Curricular, Director Docente, Secretario

      // 2. Obtener roles actuales del admin
      const rolesActuales = admin.roles || admin.id_roles || [];
      const nombresRolesActuales = admin.nombre_roles || [];

      // 3. Extraer roles no modificables actuales (si los tiene)
      const rolesNoModificablesActuales = rolesActuales.filter((rolId) =>
        rolesNoModificables.includes(rolId)
      );

      // 4. Extraer IDs de roles modificables de los nuevos roles
      const nuevosRolesModificablesIds = nuevos_roles
        .map((rol) => rol.id_rol)
        .filter((rolId) => rolesModificables.includes(rolId));

      // 5. COMBINAR: roles no modificables actuales + nuevos roles modificables
      const rolesFinales = [
        ...rolesNoModificablesActuales,
        ...nuevosRolesModificablesIds,
      ];

      console.log("🔄 Procesamiento de roles:", {
        rolesActuales,
        rolesNoModificablesActuales,
        nuevosRolesModificablesIds,
        rolesFinales,
      });

      // 6. Validar que solo haya un rol administrativo a la vez
      const rolesAdministrativosSeleccionados =
        nuevosRolesModificablesIds.filter((id) => [7, 8, 9].includes(id));

      if (rolesAdministrativosSeleccionados.length > 1) {
        return FormatterResponseService.validationError(
          [
            {
              path: "roles",
              message:
                "Solo se puede asignar un rol administrativo a la vez (Director Curricular, Director Docente o Secretario)",
            },
          ],
          "Múltiples roles administrativos no permitidos"
        );
      }

      // 7. Verificar si es el último SuperAdmin y quiere quitar el rol de SuperAdmin
      const tieneSuperAdminActual = rolesActuales.includes(20); // 20 = SuperAdmin
      const tieneSuperAdminFinal = rolesFinales.includes(20);

      if (tieneSuperAdminActual && !tieneSuperAdminFinal) {
        const superAdminsActivos = await AdminModel.contarPorRolYEstado(
          20, // SuperAdmin ID
          "activo"
        );
        if (superAdminsActivos.data <= 1) {
          return FormatterResponseService.error(
            "Acción no permitida",
            "No se puede quitar el rol de SuperAdmin del último SuperAdmin del sistema",
            403,
            "LAST_SUPERADMIN_ROLE_CHANGE_NOT_ALLOWED"
          );
        }
      }

      // 8. Mapear nombres de roles para la notificación
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

      // 9. Actualizar roles usando el nuevo método (pasar solo los IDs)
      const respuestaModel = await AdminModel.cambiarRol(
        id_admin,
        rolesFinales,
        user_action.id
      );

      if (FormatterResponseService.isError(respuestaModel)) {
        return respuestaModel;
      }

      // 10. Enviar notificación solo a Vicerrector y SuperAdmin
      const notificationService = new NotificationService();
      await notificationService.crearNotificacionMasiva({
        titulo: "Roles de Administrador Actualizados",
        tipo: "admin_roles_actualizados",
        contenido: `Se han actualizado los roles de ${admin.nombres} ${admin.apellidos} de "${rolesAnterioresNombres}" a "${rolesFinalesNombres}"`,
        metadatos: {
          admin_id: id_admin,
          admin_cedula: admin.cedula,
          admin_nombres: admin.nombres,
          admin_apellidos: admin.apellidos,
          roles_anteriores: rolesAnterioresNombres,
          roles_nuevos: rolesFinalesNombres,
          roles_ids_anteriores: rolesActuales,
          roles_ids_nuevos: rolesFinales,
          usuario_ejecutor: user_action.id,
          fecha_cambio: new Date().toISOString(),
          url_action: `/administracion/administradores/${id_admin}`,
        },
        roles_ids: [10, 20], // Solo Vicerrector (10) y SuperAdmin (20)
        users_ids: [user_action.id], // Usuario que cambió los roles
      });

      console.log("✅ Roles de administrador actualizados exitosamente");

      return FormatterResponseService.success(
        {
          message: "Roles de administrador actualizados exitosamente",
          admin: {
            id: id_admin,
            cedula: admin.cedula,
            nombres: admin.nombres,
            apellidos: admin.apellidos,
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
        "Roles de administrador actualizados exitosamente",
        {
          status: 200,
          title: "Roles Actualizados",
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
      console.log(
        `🔍 [updateProfile] Actualizando perfil del admin ID: ${user.id}`
      );

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
        const adminDuplicado = await AdminModel.buscarPorEmail(
          datosFiltrados.email
        );
        if (adminDuplicado.data && adminDuplicado.data.length > 0) {
          const adminDupe = adminDuplicado.data.find(
            (admin) => admin.id_admin !== user.id
          );
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
      const respuestaModel = await AdminModel.actualizarPerfil(
        user.id,
        datosFiltrados
      );

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
      const rolesValidos = [
        "SuperAdmin",
        "Vicerrector",
        "Director General de Gestión Curricular",
        "Coordinador",
      ];
      if (!rol || !rolesValidos.includes(rol)) {
        return FormatterResponseService.validationError(
          [
            {
              path: "rol",
              message: `Rol inválido. Los roles válidos son: ${rolesValidos.join(
                ", "
              )}`,
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
      console.log(
        `🔍 [obtenerAdminsPorEstado] Filtrando admins por estado: ${estado}`
      );

      // Validar estado
      const estadosValidos = ["activo", "inactivo"];
      if (!estado || !estadosValidos.includes(estado)) {
        return FormatterResponseService.validationError(
          [
            {
              path: "estado",
              message: `Estado inválido. Los estados válidos son: ${estadosValidos.join(
                ", "
              )}`,
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
