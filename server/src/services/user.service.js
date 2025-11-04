import ValidationService from "./validation.service.js";
import UserModel from "../models/user.model.js";
import { comparePassword, hashPassword } from "../utils/encrypted.js";
import { createSession } from "../utils/auth.js";
import { asegurarStringEnMinusculas } from "../utils/utilis.js";
import FormatterResponseService from "../utils/FormatterResponseService.js";

/**
 * @class UserService
 * @description Servicio para operaciones de negocio relacionadas con usuarios
 */
export default class UserService {
  /**
   * @static
   * @async
   * @method login
   * @description Iniciar sesión de usuario
   * @param {Object} datos - Datos de login
   * @param {Object} usuario - Usuario para no crear de nuevo la session
   * @returns {Object} Resultado de la operación
   */
  static async login(datos, usuario) {
    try {
      console.log("🔍 [login] Iniciando proceso de login...");

      if (usuario.id) {
        FormatterResponseService.error(
          "Ya hay una sesion iniciada",
          "No se puede crear una sesion si ya existe una",
          404
        );
      }

      // 1. Validar datos de entrada
      const validacion = ValidationService.validateLogin(datos);
      if (!validacion.isValid) {
        console.error("❌ Validación de login fallida:", validacion.errors);
        return FormatterResponseService.validationError(
          validacion.errors,
          "Error de validación en login"
        );
      }

      // 2. Buscar usuario en la base de datos
      const email = asegurarStringEnMinusculas(datos.email);
      console.log("📧 Buscando usuario:", email);

      const respuestaModel = await UserModel.loginUser(email);

      // Si el modelo ya retorna un formato de error, lo propagamos
      if (FormatterResponseService.isError(respuestaModel)) {
        console.error("❌ Error en modelo login:", respuestaModel);
        return respuestaModel;
      }

      const user = respuestaModel.data;
      console.log("✅ Usuario encontrado:", user.nombres, user.apellidos);

      // 3. Validar contraseña
      console.log("🔐 Validando contraseña...");
      console.log("📝 Contraseña ingresada:", datos.password);
      console.log("📝 Contraseña almacenada", user.password);
      const validatePassword = await comparePassword(
        datos.password,
        user.password
      );

      if (!validatePassword) {
        console.error("❌ Contraseña inválida para usuario:", email);
        throw FormatterResponseService.unauthorized(
          "Correo o contraseña inválida"
        );
      }

      // 4. Crear token de sesión
      console.log("🎫 Creando token de sesión...");
      const token = createSession({
        object: {
          id: user.id,
          apellidos: user.apellidos,
          nombres: user.nombres,
          roles: user.roles,
          ...(user.id_pnf && { id_pnf: user.id_pnf }), // ✅ Solo agrega si existe
        },
      });

      console.log(
        "✅ Login exitoso para usuario:",
        user.nombres,
        user.apellidos
      );

      // 5. Preparar respuesta exitosa
      return FormatterResponseService.success(
        {
          token: token,
          user: {
            id: user.id,
            apellidos: user.apellidos,
            nombres: user.nombres,
            primera_vez: user.primera_vez,
            roles: user.roles,
            ...(user.id_pnf && { id_pnf: user.id_pnf }), // ✅ Solo agrega si existe
          },
        },
        "Inicio de sesión exitoso",
        {
          status: 200,
          title: "Login Exitoso",
        }
      );
    } catch (error) {
      console.error("💥 Error en servicio login:", error);

      // Re-lanza el error para que el controlador lo maneje
      throw error;
    }
  }

  /**
   * @static
   * @async
   * @method cambiarContraseña
   * @description Cambiar contraseña del usuario
   * @param {Object} datos - Datos para cambiar contraseña
   * @param {Object} usuarioActual - Usuario actual autenticado
   * @returns {Object} Resultado de la operación
   */
  static async cambiarContraseña(datos, usuarioActual) {
    try {
      console.log("🔍 [cambiarContraseña] Iniciando cambio de contraseña...");

      if (process.env.MODE === "DEVELOPMENT") {
        console.log("📝 Datos recibidos:", {
          datos: datos,
          usuarioActual: {
            id: usuarioActual.id,
            nombres: usuarioActual.nombres,
            apellidos: usuarioActual.apellidos,
          },
        });
      }

      // 1. Validar datos de entrada
      const validacion = ValidationService.validateContrasenia(datos);

      if (!validacion.isValid) {
        console.error(
          "❌ Validación de contraseña fallida:",
          validacion.errors
        );
        return FormatterResponseService.validationError(
          validacion.errors,
          "Error de validación en cambio de contraseña"
        );
      }
      console.log("✅ Validación de datos exitosa.");

      console.log("🔍 Obteniendo datos del usuario para validación...");
      const respuestaUsuario = await UserModel.obtenerUsuarioPorId(
        usuarioActual.id
      );
      console.log(
        "✅ Datos del usuario obtenidos para validación: ",
        respuestaUsuario.data[0]
      );
      const { password } = respuestaUsuario.data[0];

      // 2. Validar contraseña actual
      console.log("🔐 Validando contraseña actual...");
      const validatePassword = await comparePassword(
        datos.antigua_password,
        password
      );

      if (!validatePassword) {
        console.error(
          "❌ Contraseña actual incorrecta para usuario:",
          usuarioActual.id
        );
        return FormatterResponseService.unauthorized(
          "La contraseña actual es incorrecta"
        );
      }

      // 3. Hashear nueva contraseña
      console.log("🔒 Hasheando nueva contraseña...");
      const passwordHash = await hashPassword(datos.password);

      // 4. Cambiar contraseña en la base de datos
      console.log("💾 Actualizando contraseña en base de datos...");
      const respuestaModel = await UserModel.cambiarContraseña(
        usuarioActual.id,
        passwordHash
      );

      if (FormatterResponseService.isError(respuestaModel)) {
        console.error("❌ Error en modelo cambiar contraseña:", respuestaModel);
        return respuestaModel;
      }

      console.log(
        "✅ Contraseña cambiada exitosamente para usuario:",
        usuarioActual.id
      );

      return FormatterResponseService.success(
        null,
        "Contraseña cambiada exitosamente",
        {
          status: 200,
          title: "Contraseña Actualizada",
        }
      );
    } catch (error) {
      console.error("💥 Error en servicio cambiar contraseña:", error);

      if (error.name === "ValidationError") {
        return FormatterResponseService.validationError(
          error.details || [],
          error.message
        );
      }

      // Re-lanza el error para que el controlador lo maneje
      throw error;
    }
  }

  /**
   * @static
   * @async
   * @method verificarSesion
   * @description Verificar la sesión del usuario
   * @param {Object} user - Usuario autenticado
   * @returns {Object} Resultado de la operación
   */
  static async verificarSesion(user) {
    try {
      if (!user) {
        FormatterResponseService.unauthorized("Usuario no autenticado");
      }
      return FormatterResponseService.success(
        user,
        "Sesión verificada exitosamente",
        {
          status: 200,
          title: "Sesión Activa",
          verifiedAt: new Date().toISOString(),
          userStatus: "active",
        }
      );
    } catch (error) {
      console.error("💥 Error en servicio verificar sesión:", error);

      if (["ECONNREFUSED", "ETIMEDOUT"].includes(error.code)) {
        return FormatterResponseService.error(
          "Error de conexión con la base de datos",
          503,
          "DATABASE_UNAVAILABLE"
        );
      }

      // Re-lanza el error para que el controlador lo maneje
      throw error;
    }
  }

  /**
   * @static
   * @async
   * @method obtenerPerfil
   * @description Obtener perfil del usuario
   * @param {number} userId - ID del usuario
   * @returns {Object} Resultado de la operación
   */
  static async obtenerPerfil(userId) {
    try {
      console.log("🔍 [obtenerPerfil] Obteniendo perfil para usuario:", userId);

      // Validar ID de usuario
      const idValidation = ValidationService.validateId(userId, "usuario");
      if (!idValidation.isValid) {
        console.error("❌ Validación de ID fallida:", idValidation.errors);
        return FormatterResponseService.validationError(
          idValidation.errors,
          "ID de usuario inválido"
        );
      }

      const respuestaModel = await UserModel.obtenerUsuarioPorId(userId);

      if (FormatterResponseService.isError(respuestaModel)) {
        console.error("❌ Error en modelo obtener perfil:", respuestaModel);
        return respuestaModel;
      }

      if (!respuestaModel.data) {
        console.error("❌ Usuario no encontrado:", userId);
        return FormatterResponseService.notFound("Usuario", userId);
      }

      const user = respuestaModel.data;

      // Remover información sensible antes de enviar
      const { password, ...userSafe } = user;

      console.log(
        "✅ Perfil obtenido exitosamente para:",
        user.nombres,
        user.apellidos
      );

      return FormatterResponseService.success(
        userSafe,
        "Perfil obtenido exitosamente",
        {
          status: 200,
          title: "Perfil de Usuario",
        }
      );
    } catch (error) {
      console.error("💥 Error en servicio obtener perfil:", error);
      // Re-lanza el error para que el controlador lo maneje
      throw error;
    }
  }

  /**
   * @static
   * @async
   * @method actualizarPerfil
   * @description Actualizar perfil del usuario
   * @param {number} userId - ID del usuario
   * @param {Object} datosActualizacion - Datos a actualizar
   * @returns {Object} Resultado de la operación
   */
  static async actualizarPerfil(userId, datosActualizacion) {
    try {
      console.log(
        "🔍 [actualizarPerfil] Actualizando perfil para usuario:",
        userId
      );

      if (process.env.MODE === "DEVELOPMENT") {
        console.log(
          "📝 Datos de actualización:",
          JSON.stringify(datosActualizacion, null, 2)
        );
      }

      // Validar ID de usuario
      const idValidation = ValidationService.validateId(userId, "usuario");
      if (!idValidation.isValid) {
        console.error("❌ Validación de ID fallida:", idValidation.errors);
        return FormatterResponseService.validationError(
          idValidation.errors,
          "ID de usuario inválido"
        );
      }

      // Validar datos de actualización
      const validacion =
        ValidationService.validateActualizacionPerfil(datosActualizacion);
      if (!validacion.isValid) {
        console.error(
          "❌ Validación de actualización fallida:",
          validacion.errors
        );
        return FormatterResponseService.validationError(
          validacion.errors,
          "Error de validación en actualización de perfil"
        );
      }

      const respuestaModel = await UserModel.actualizarUsuario(
        userId,
        datosActualizacion
      );

      if (FormatterResponseService.isError(respuestaModel)) {
        console.error("❌ Error en modelo actualizar perfil:", respuestaModel);
        return respuestaModel;
      }

      console.log("✅ Perfil actualizado exitosamente para usuario:", userId);

      return FormatterResponseService.success(
        respuestaModel.data,
        "Perfil actualizado exitosamente",
        {
          status: 200,
          title: "Perfil Actualizado",
        }
      );
    } catch (error) {
      console.error("💥 Error en servicio actualizar perfil:", error);

      if (error.name === "ValidationError") {
        return FormatterResponseService.validationError(
          error.details,
          error.message
        );
      }

      // Re-lanza el error para que el controlador lo maneje
      throw error;
    }
  }

  /**
   * @static
   * @async
   * @method cerrarSesion
   * @description Cerrar sesión del usuario
   * @returns {Object} Resultado de la operación
   */
  static async cerrarSesion() {
    try {
      console.log("🔍 [cerrarSesion] Cerrando sesión...");

      // En un sistema más complejo, aquí podrías invalidar tokens, etc.
      // Por ahora simplemente retornamos éxito ya que el controlador se encarga de limpiar la cookie

      return FormatterResponseService.success(
        null,
        "Sesión cerrada exitosamente",
        {
          status: 200,
          title: "Sesión Cerrada",
        }
      );
    } catch (error) {
      console.error("💥 Error en servicio cerrar sesión:", error);
      // Re-lanza el error para que el controlador lo maneje
      throw error;
    }
  }
}
