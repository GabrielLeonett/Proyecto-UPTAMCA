import ValidationService from "./validation.service.js";
import NotificationService from "./notification.service.js";
import ImagenService from "./imagen.service.js";
import EmailService from "./email.service.js";
//Modelo
import ProfesorModel from "../models/profesor.model.js";

import { loadEnv } from "../utils/utilis.js";

loadEnv();
/**
 * @class ProfesorService
 * @description Servicio para operaciones de negocio relacionadas con profesores
 */
export default class ProfesorService {
  constructor() {
    this.validationService = ValidationService;
    this.notificationService = new NotificationService();
    this.imagenService = new ImagenService("Profesores");
    this.emailService = new EmailService();
  }

  async registrarProfesor(datos, imagen, user_action) {
    try {
      console.log("🔍 [registrarProfesor] Iniciando registro de profesor...", datos, imagen, user_action);

      if (process.env.NODE_ENV === "development") {
        console.log("📝 Datos recibidos:", {
          datos: JSON.stringify(datos, null, 2),
          imagen: imagen
            ? {
                originalName: imagen.originalName,
                size: imagen.size,
                mimetype: imagen.mimetype,
              }
            : "No image provided",
          user_action: user_action,
        });
      }

      // 1. Validar datos del profesor
      console.log("✅ Validando datos del profesor...");
      const validation = this.validationService.validateProfesor(datos);

      if (!validation.isValid) {
        console.error("❌ Validación de datos fallida:", validation.errors);
        return {
          success: false,
          error: this.validationService.createValidationResponse(
            validation.errors
          ),
        };
      }

      // 2. Validar ID de usuario
      console.log("✅ Validando ID de usuario...");
      const idValidation = this.validationService.validateId(
        user_action.id,
        "usuario"
      );

      if (!idValidation.isValid) {
        console.error("❌ Validación de ID fallida:", idValidation.errors);
        return {
          success: false,
          error: this.validationService.createValidationResponse(
            idValidation.errors
          ),
        };
      }

      // 3. Validar imagen (solo si se proporciona)
      let imagenPath = null;
      if (imagen && imagen.originalName) {
        console.log("🖼️ Validando imagen...");
        const validationImage = await this.imagenService.validateImage(
          imagen.originalName,
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
          throw new Error(
            `Error de validación de imagen: ${validationImage.error}`
          );
        }

        console.log("✅ Imagen válida:", validationImage.message);

        // Guardar imagen y obtener la ruta
        console.log("💾 Procesando y guardando imagen...");
        imagenPath = await this.imagenService.processAndSaveImage(
          imagen.originalName,
          {
            maxWidth: 1920,
            maxHeight: 1080,
            quality: 85,
            format: "webp",
          }
        );

        if (process.env.NODE_ENV === "development") {
          console.log("📁 Ruta de imagen guardada:", imagenPath);
        }
      } else {
        console.log("ℹ️ No se proporcionó imagen, continuando sin ella...");
      }

      // 4. Validar email (CORREGIDO: falta await)
      console.log("📧 Validando email...");
      const validationEmail = await this.emailService.verificarEmailConAPI(
        datos.email
      ); // Agregado await

      if (!validationEmail.existe) {
        console.error("❌ Validación de email fallida:", validationEmail);
        return {
          success: false,
          error: {
            state: "invalid_email",
            status: 400,
            title: "Email Inválido",
            message: "El email proporcionado no es válido o no existe",
            details: validationEmail,
          },
        };
      }

      console.log("✅ Email válido");

      // 5. Crear profesor en el modelo (CORREGIDO: falta await)
      console.log("👨‍🏫 Creando profesor en base de datos...");
      const respuestaModel = await ProfesorModel.crear(
        // Agregado await
        {
          ...datos,
          imagen: imagenPath, // Agregar ruta de imagen si existe
        },
        user_action
      );

      if (process.env.NODE_ENV === "development") {
        console.log("📊 Respuesta del modelo:", respuestaModel);
      }

      // 6. Enviar notificación (CORREGIDO: variables inconsistentes)
      console.log("🔔 Enviando notificaciones...");
      await this.notificationService.crearNotificacionMasiva({
        titulo: "Nuevo Profesor Registrado",
        tipo: "profesor_creado",
        contenido: `Se ha registrado al profesor ${datos.nombres} ${datos.apellidos} en el sistema`,
        metadatos: {
          profesor_cedula: datos.cedula,
          profesor_nombre: `${datos.nombres} ${datos.apellidos}`,
          usuario_creador: user_action.id, // CORREGIDO: usar user_action.id en lugar de usuarioId
          fecha_registro: new Date().toISOString(),
        },
        roles_ids: ["admin", "coordinador"],
        users_ids: [user_action.id], // CORREGIDO: usar user_action.id
      });

      console.log("🎉 Profesor registrado exitosamente");

      return {
        success: true,
        data: {
          message: "Profesor creado exitosamente",
          profesor: {
            cedula: datos.cedula,
            nombres: datos.nombres,
            apellidos: datos.apellidos,
            email: datos.email,
            imagen: imagenPath,
          },
        },
      };
    } catch (error) {
      console.error("💥 Error en servicio crear profesor:", error);

      // Debugging detallado en desarrollo
      if (process.env.NODE_ENV === "development") {
        console.error("🔍 Debug Info:", {
          errorName: error.name,
          errorMessage: error.message,
          errorStack: error.stack,
          datos: datos
            ? {
                cedula: datos.cedula,
                nombres: datos.nombres,
                email: datos.email,
              }
            : "No data",
          user_action: user_action,
        });
      }

      return {
        success: false,
        error: {
          state: "database_error",
          status: 500,
          title: "Error del Sistema",
          message: "Error al crear el profesor en la base de datos",
          error:
            process.env.NODE_ENV === "development"
              ? error.message
              : "Error interno del servidor",
          // Agregar más detalles en desarrollo
          ...(process.env.NODE_ENV === "development" && {
            stack: error.stack,
            details: {
              datos: datos,
              user_action: user_action,
            },
          }),
        },
      };
    }
  }

  /**
   * @name obtenerTodos
   * @description Obtener todos los profesores con validación de parámetros
   * @param {Object} queryParams - Parámetros de consulta
   * @returns {Object} Resultado de la operación
   */
  async obtenerTodos(queryParams = {}) {
    try {
      // Validar parámetros de consulta
      const allowedParams = ["page", "limit", "sort", "order"];
      const queryValidation = this.validationService.validateQueryParams(
        queryParams,
        allowedParams
      );

      if (!queryValidation.isValid) {
        return {
          success: false,
          error: this.validationService.createValidationResponse(
            queryValidation.errors
          ),
        };
      }

      const { rows } = await d.query(
        "SELECT * FROM profesores_informacion_completa"
      );

      return {
        success: true,
        data: {
          profesores: rows,
          total: rows.length,
          page: parseInt(queryParams.page) || 1,
          limit: parseInt(queryParams.limit) || rows.length,
        },
      };
    } catch (error) {
      console.error("Error en servicio obtener todos los profesores:", error);

      return {
        success: false,
        error: {
          state: "database_error",
          status: 500,
          title: "Error del Sistema",
          message: "Error al obtener los profesores",
          error:
            process.env.NODE_ENV === "development"
              ? error.message
              : "Error interno del servidor",
        },
      };
    }
  }

  /**
   * @name obtenerConFiltros
   * @description Obtener profesores con filtros validados
   * @param {Object} filtros - Filtros de búsqueda
   * @returns {Object} Resultado de la operación
   */
  async obtenerConFiltros(filtros = {}) {
    try {
      // Validar estructura de filtros
      const filterValidation = this.validationService.validateQueryParams(
        filtros,
        ["dedicacion", "categoria", "ubicacion", "area", "fecha", "genero"]
      );

      if (!filterValidation.isValid) {
        return {
          success: false,
          error: this.validationService.createValidationResponse(
            filterValidation.errors
          ),
        };
      }

      const { dedicacion, categoria, ubicacion, area, fecha, genero } = filtros;


      return {
        success: true,
        data: {
          profesores: rows,
          total: rows.length,
          filtros_aplicados: filtros,
        },
      };
    } catch (error) {
      console.error("Error en servicio obtener profesores con filtros:", error);

      return {
        success: false,
        error: {
          state: "database_error",
          status: 500,
          title: "Error del Sistema",
          message: "Error al filtrar los profesores",
          error:
            process.env.NODE_ENV === "development"
              ? error.message
              : "Error interno del servidor",
        },
      };
    }
  }

  /**
   * @name buscar
   * @description Buscar profesores con validación de término de búsqueda
   * @param {string} busqueda - Término de búsqueda
   * @returns {Object} Resultado de la operación
   */
  async buscar(busqueda) {
    try {
      // Validar término de búsqueda
      if (
        !busqueda ||
        typeof busqueda !== "string" ||
        busqueda.trim().length === 0
      ) {
        return {
          success: false,
          error: this.validationService.createValidationResponse([
            {
              path: "busqueda",
              message:
                "El término de búsqueda es requerido y debe ser una cadena no vacía",
            },
          ]),
        };
      }

      const termino = busqueda.trim();

      if (termino.length < 2) {
        return {
          success: false,
          error: this.validationService.createValidationResponse([
            {
              path: "busqueda",
              message:
                "El término de búsqueda debe tener al menos 2 caracteres",
            },
          ]),
        };
      }


      return {
        success: true,
        data: {
          profesores: rows,
          total: rows.length,
          termino_busqueda: termino,
        },
      };
    } catch (error) {
      console.error("Error en servicio buscar profesores:", error);

      return {
        success: false,
        error: {
          state: "database_error",
          status: 500,
          title: "Error del Sistema",
          message: "Error al buscar profesores",
          error:
            process.env.NODE_ENV === "development"
              ? error.message
              : "Error interno del servidor",
        },
      };
    }
  }

  /**
   * @name actualizar
   * @description Actualizar un profesor existente con validación y notificación
   * @param {Object} datos - Datos actualizados del profesor
   * @param {number} usuarioId - ID del usuario que realiza la acción
   * @returns {Object} Resultado de la operación
   */
  async actualizar(datos, usuarioId) {
    try {
      // Validar datos parciales del profesor
      const validation = this.validationService.validatePartialProfesor(datos);

      if (!validation.isValid) {
        return {
          success: false,
          error: this.validationService.createValidationResponse(
            validation.errors
          ),
        };
      }

      // Validar que tenga ID de profesor
      const requiredValidation = this.validationService.validateRequiredFields(
        datos,
        ["id_profesor"]
      );

      if (!requiredValidation.isValid) {
        return {
          success: false,
          error: this.validationService.createValidationResponse(
            requiredValidation.errors
          ),
        };
      }

      // Validar ID de usuario
      const idValidation = this.validationService.validateId(
        usuarioId,
        "usuario"
      );
      if (!idValidation.isValid) {
        return {
          success: false,
          error: this.validationService.createValidationResponse(
            idValidation.errors
          ),
        };
      }

      // Obtener datos actuales del profesor para comparar


      if (profesorActual.rows.length === 0) {
        return {
          success: false,
          error: {
            state: "not_found",
            status: 404,
            title: "Profesor No Encontrado",
            message: `No se encontró el profesor con ID ${datos.id_profesor}`,
          },
        };
      }

      // Enviar notificación de actualización
      await this.notificationService.crearNotificacionMasiva({
        titulo: "Profesor Actualizado",
        tipo: "profesor_actualizado",
        contenido: `Se han actualizado los datos del profesor ${
          datos.nombres || profesorActual.rows[0].nombres
        } ${datos.apellidos || profesorActual.rows[0].apellidos}`,
        metadatos: {
          profesor_id: datos.id_profesor,
          profesor_cedula: profesorActual.rows[0].cedula,
          campos_actualizados: Object.keys(datos).filter(
            (key) => key !== "id_profesor"
          ),
          usuario_actualizador: usuarioId,
          fecha_actualizacion: new Date().toISOString(),
        },
        roles_ids: ["admin", "coordinador"],
        users_ids: [usuarioId],
      });

      return {
        success: true,
        data: {
          message: "Profesor actualizado exitosamente",
          profesor_id: datos.id_profesor,
        },
      };
    } catch (error) {
      console.error("Error en servicio actualizar profesor:", error);

      await this.notificationService.crearNotificacionIndividual({
        titulo: "Error al Actualizar Profesor",
        tipo: "error_sistema",
        user_id: usuarioId,
        contenido: `Error al intentar actualizar al profesor con ID ${datos.id_profesor}`,
        metadatos: {
          error: error.message,
          profesor_id: datos.id_profesor,
          timestamp: new Date().toISOString(),
        },
      });

      return {
        success: false,
        error: {
          state: "database_error",
          status: 500,
          title: "Error del Sistema",
          message: "Error al actualizar el profesor",
          error:
            process.env.NODE_ENV === "development"
              ? error.message
              : "Error interno del servidor",
        },
      };
    }
  }

  /**
   * @name eliminar
   * @description Eliminar/destituir un profesor con validación y notificación
   * @param {Object} datos - Datos de la eliminación
   * @param {number} usuarioId - ID del usuario que realiza la acción
   * @returns {Object} Resultado de la operación
   */
  async eliminar(datos, usuarioId) {
    try {
      // Validar datos de eliminación
      const requiredValidation = this.validationService.validateRequiredFields(
        datos,
        ["id_profesor", "tipo_accion", "razon"]
      );

      if (!requiredValidation.isValid) {
        return {
          success: false,
          error: this.validationService.createValidationResponse(
            requiredValidation.errors
          ),
        };
      }

      // Validar ID de usuario
      const idValidation = this.validationService.validateId(
        usuarioId,
        "usuario"
      );
      if (!idValidation.isValid) {
        return {
          success: false,
          error: this.validationService.createValidationResponse(
            idValidation.errors
          ),
        };
      }

      // Validar ID de profesor
      const profesorIdValidation = this.validationService.validateId(
        datos.id_profesor,
        "profesor"
      );
      if (!profesorIdValidation.isValid) {
        return {
          success: false,
          error: this.validationService.createValidationResponse(
            profesorIdValidation.errors
          ),
        };
      }

      // Obtener información del profesor antes de eliminar
      const profesorInfo = await d.query(
        "SELECT cedula, nombres, apellidos FROM profesores_informacion_completa WHERE id_profesor = $1",
        [datos.id_profesor]
      );

      if (profesorInfo.rows.length === 0) {
        return {
          success: false,
          error: {
            state: "not_found",
            status: 404,
            title: "Profesor No Encontrado",
            message: `No se encontró el profesor con ID ${datos.id_profesor}`,
          },
        };
      }

      const profesor = profesorInfo.rows[0];

      const { rows } = await d.query(
        "CALL eliminar_destituir_profesor(NULL, $1, $2, $3, $4, $5, $6)",
        [
          usuarioId,
          datos.id_profesor,
          datos.tipo_accion,
          datos.razon,
          datos.observaciones || null,
          datos.fecha_efectiva || new Date(),
        ]
      );

      // Enviar notificación de eliminación/destitución
      await this.notificationService.crearNotificacionMasiva({
        titulo: `Profesor ${
          datos.tipo_accion === "eliminar" ? "Eliminado" : "Destituido"
        }`,
        tipo: `profesor_${datos.tipo_accion}`,
        contenido: `Se ha ${
          datos.tipo_accion === "eliminar" ? "eliminado" : "destituido"
        } al profesor ${profesor.nombres} ${profesor.apellidos} (${
          profesor.cedula
        })`,
        metadatos: {
          profesor_id: datos.id_profesor,
          profesor_cedula: profesor.cedula,
          profesor_nombre: `${profesor.nombres} ${profesor.apellidos}`,
          tipo_accion: datos.tipo_accion,
          razon: datos.razon,
          observaciones: datos.observaciones,
          fecha_efectiva: datos.fecha_efectiva,
          usuario_ejecutor: usuarioId,
          fecha_ejecucion: new Date().toISOString(),
        },
        roles_ids: ["admin", "coordinador"],
        users_ids: [usuarioId],
      });

      return {
        success: true,
        data: {
          message: `Profesor ${
            datos.tipo_accion === "eliminar" ? "eliminado" : "destituido"
          } exitosamente`,
          profesor: {
            id: datos.id_profesor,
            cedula: profesor.cedula,
            nombre: `${profesor.nombres} ${profesor.apellidos}`,
            accion: datos.tipo_accion,
          },
        },
      };
    } catch (error) {
      console.error("Error en servicio eliminar profesor:", error);

      await this.notificationService.crearNotificacionIndividual({
        titulo: "Error al Eliminar/Destituir Profesor",
        tipo: "error_sistema",
        user_id: usuarioId,
        contenido: `Error al intentar ${datos.tipo_accion} al profesor con ID ${datos.id_profesor}`,
        metadatos: {
          error: error.message,
          profesor_id: datos.id_profesor,
          tipo_accion: datos.tipo_accion,
          timestamp: new Date().toISOString(),
        },
      });

      return {
        success: false,
        error: {
          state: "database_error",
          status: 500,
          title: "Error del Sistema",
          message: `Error al ${datos.tipo_accion} el profesor`,
          error:
            process.env.NODE_ENV === "development"
              ? error.message
              : "Error interno del servidor",
        },
      };
    }
  }

  /**
   * @name obtenerPregrados
   * @description Obtener todos los pregrados con validación
   * @returns {Object} Resultado de la operación
   */
  async obtenerPregrados() {
    try {
      const { rows } = await d.query(
        "SELECT id_pre_grado, nombre_pre_grado, tipo_pre_grado FROM pre_grado"
      );

      return {
        success: true,
        data: {
          pregrados: rows,
          total: rows.length,
        },
      };
    } catch (error) {
      console.error("Error en servicio obtener pregrados:", error);

      return {
        success: false,
        error: {
          state: "database_error",
          status: 500,
          title: "Error del Sistema",
          message: "Error al obtener los pregrados",
          error:
            process.env.NODE_ENV === "development"
              ? error.message
              : "Error interno del servidor",
        },
      };
    }
  }

  /**
   * @name obtenerPosgrados
   * @description Obtener todos los posgrados con validación
   * @returns {Object} Resultado de la operación
   */
  async obtenerPosgrados() {
    try {
      const { rows } = await d.query(
        "SELECT id_pos_grado, nombre_pos_grado, tipo_pos_grado FROM pos_grado"
      );

      return {
        success: true,
        data: {
          posgrados: rows,
          total: rows.length,
        },
      };
    } catch (error) {
      console.error("Error en servicio obtener posgrados:", error);

      return {
        success: false,
        error: {
          state: "database_error",
          status: 500,
          title: "Error del Sistema",
          message: "Error al obtener los posgrados",
          error:
            process.env.NODE_ENV === "development"
              ? error.message
              : "Error interno del servidor",
        },
      };
    }
  }

  /**
   * @name obtenerAreasConocimiento
   * @description Obtener todas las áreas de conocimiento con validación
   * @returns {Object} Resultado de la operación
   */
  async obtenerAreasConocimiento() {
    try {
      const respuestaModel = await ProfesorModel.obtenerAreasConocimiento();
      return {
        success: true,
        data: {
          areas_conocimiento: rows,
          total: rows.length,
        },
      };
    } catch (error) {
      console.error("Error en servicio obtener áreas de conocimiento:", error);

      return {
        success: false,
        error: {
          state: "database_error",
          status: 500,
          title: "Error del Sistema",
          message: "Error al obtener las áreas de conocimiento",
          error:
            process.env.NODE_ENV === "development"
              ? error.message
              : "Error interno del servidor",
        },
      };
    }
  }

}
