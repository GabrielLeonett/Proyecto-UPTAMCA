import validationService from "./validation.service.js";
import UserModel from "../models/user.model.js";
import { comparePassword, hashPassword } from "../utils/encrypted.js";
import { createSession } from "../utils/auth.js";
import { asegurarStringEnMinusculas } from "../utils/utilis.js";
import FormatterResponseService from "../utils/FormatterResponseService.js";
import { use } from "react";

class UserService {
  static async login(datos) {
    try {
      // 1. Validar datos de entrada
      const validacion = validationService.validateLogin(datos);
      if (!validacion.isValid) {
        return FormatterResponseService.validationError(
          validacion.errors,
          "Error de validación en login"
        );
      }

      // 2. Buscar usuario en la base de datos
      const email = asegurarStringEnMinusculas(datos.email);
      const respuestaModel = await UserModel.loginUser(email);

      // Si el modelo ya retorna un formato de error, lo propagamos
      if (FormatterResponseService.isError(respuestaModel)) {
        return respuestaModel;
      }

      const user = respuestaModel.data;

      // 3. Validar contraseña
      const validatePassword = await comparePassword(
        datos.password,
        user.password
      );

      if (!validatePassword) {
        return FormatterResponseService.unauthorized(
          "Correo o contraseña inválida"
        );
      }

      // 4. Crear token de sesión
      const token = createSession({
        object: {
          id: user.id,
          apellidos: user.apellidos,
          nombres: user.nombres,
          roles: user.roles,
          password: user.password,
        },
      });

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
          },
        },
        "Inicio de sesión exitoso",
        {
          status: 200,
          title: "Login Exitoso",
        }
      );
    } catch (error) {
      console.error("Error en UserService.login:", error);

      // Si es un error de validación conocido
      if (error.name === "ValidationError") {
        return FormatterResponseService.validationError(
          error.details || error.errors,
          error.message
        );
      }

      return FormatterResponseService.error(
        error.message || "Error interno del servidor",
        500,
        "LOGIN_ERROR",
        {
          originalError:
            process.env.NODE_ENV === "development" ? error.message : undefined,
        }
      );
    }
  }

  static async cambiarContraseña(datos, usuarioActual) {
    try {
      // 1. Validar datos de entrada
      const validacion = validationService.validateContrasenia(datos);
      if (!validacion.isValid) {
        return FormatterResponseService.validationError(
          validacion.errors,
          "Error de validación en login"
        );
      }

      // 2. Validar contraseña actual
      const validatePassword = await comparePassword(
        datos.antiguaPassword,
        usuarioActual.password
      );

      if (!validatePassword) {
        return FormatterResponseService.unauthorized(
          "La contraseña actual es incorrecta"
        );
      }

      // 3. Hashear nueva contraseña
      const passwordHash = await hashPassword(datos.password);

      // 4. Cambiar contraseña en la base de datos
      const respuestaModel = await UserModel.cambiarContraseña(
        usuarioActual.id,
        passwordHash
      );

      if (FormatterResponseService.isError(respuestaModel)) {
        return respuestaModel;
      }

      return FormatterResponseService.success(
        null,
        "Contraseña cambiada exitosamente",
        {
          status: 200,
          title: "Contraseña Actualizada",
        }
      );
    } catch (error) {
      console.error("Error en UserService.cambiarContraseña:", error);

      if (error.name === "ValidationError") {
        return FormatterResponseService.validationError(
          error.details || [],
          error.message
        );
      }

      return FormatterResponseService.error(
        "Error al cambiar la contraseña",
        500,
        "PASSWORD_CHANGE_ERROR",
        {
          originalError:
            process.env.NODE_ENV === "development" ? error.message : undefined,
        }
      );
    }
  }

  static async verificarSesion(user) {
    try {
      //console.log("🟢 [DEBUG] Iniciando verificación de sesión...");
      //console.debug("👤 Datos del usuario recibido:", user);

      // Validar que el usuario esté autenticado
      if (!user) {
        //console.warn("⚠️ Usuario no autenticado.");
        return FormatterResponseService.error(
          "Usuario no autenticado",
          401,
          "USER_NOT_AUTHENTICATED"
        );
      }

      // Validar estructura y tipos básicos
      if (
        !user?.id ||
        !user?.roles?.length ||
        !user?.nombres ||
        !user?.apellidos ||
        typeof user.id !== "number" ||
        typeof user.nombres !== "string" ||
        typeof user.apellidos !== "string" ||
        !Array.isArray(user.roles)
      ) {
        //console.warn("⚠️ Estructura de usuario inválida:", user);
        return FormatterResponseService.error(
          "Información de usuario incompleta o inválida",
          401,
          "INVALID_USER_DATA"
        );
      }

      console.log("🧩 Estructura del usuario válida. Consultando base de datos...");

      // Verificar usuario en la base de datos
      const userData = {
        id: user.id,
        nombres: user.nombres,
        apellidos: user.apellidos,
        email: user.email ?? null,
        roles: user.roles,
        primera_vez: Boolean(user.primera_vez),
      };

      console.log("🟢 Sesión verificada correctamente:", userData);

      return FormatterResponseService.success(
        userData,
        "Sesión verificada exitosamente",
        {
          status: 200,
          title: "Sesión Activa",
          verifiedAt: new Date().toISOString(),
          userStatus: "active",
        }
      );
    } catch (error) {
      console.error("💥 [ERROR] Error en verificarSesion:", {
        message: error.message,
        code: error.code,
        stack: error.stack,
      });

      if (["ECONNREFUSED", "ETIMEDOUT"].includes(error.code)) {
        return FormatterResponseService.error(
          "Error de conexión con la base de datos",
          503,
          "DATABASE_UNAVAILABLE"
        );
      }

      return FormatterResponseService.error(
        "Error al verificar la sesión",
        500,
        "SESSION_VERIFICATION_ERROR",
        {
          originalError:
            process.env.NODE_ENV === "development" ? error.message : undefined,
        }
      );
    }
  }


  // Método adicional para obtener perfil de usuario
  static async obtenerPerfil(userId) {
    try {
      const respuestaModel = await UserModel.obtenerUsuarioPorId(userId);

      if (FormatterResponseService.isError(respuestaModel)) {
        return respuestaModel;
      }

      if (!respuestaModel.data) {
        return FormatterResponseService.notFound("Usuario", userId);
      }

      const user = respuestaModel.data;

      // Remover información sensible antes de enviar
      const { password, ...userSafe } = user;

      return FormatterResponseService.success(
        userSafe,
        "Perfil obtenido exitosamente",
        {
          status: 200,
          title: "Perfil de Usuario",
        }
      );
    } catch (error) {
      console.error("Error en UserService.obtenerPerfil:", error);
      return FormatterResponseService.error(
        "Error al obtener el perfil",
        500,
        "PROFILE_FETCH_ERROR"
      );
    }
  }

  // Método para actualizar perfil
  static async actualizarPerfil(userId, datosActualizacion) {
    try {
      // Validar datos de actualización
      const validacion =
        validationService.validateActualizacionPerfil(datosActualizacion);
      if (!validacion.isValid) {
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
        return respuestaModel;
      }

      return FormatterResponseService.success(
        respuestaModel.data,
        "Perfil actualizado exitosamente",
        {
          status: 200,
          title: "Perfil Actualizado",
        }
      );
    } catch (error) {
      console.error("Error en UserService.actualizarPerfil:", error);

      if (error.name === "ValidationError") {
        return FormatterResponseService.validationError(
          error.details,
          error.message
        );
      }

      return FormatterResponseService.error(
        "Error al actualizar el perfil",
        500,
        "PROFILE_UPDATE_ERROR"
      );
    }
  }
}

export default UserService;
