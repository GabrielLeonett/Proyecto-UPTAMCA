import ValidationService from "./validation.service.js";
import NotificationService from "./notification.service.js";
import ImagenService from "./imagen.service.js";
import EmailService from "./email.service.js";
import ProfesorModel from "../models/profesor.model.js";
import FormatterResponseService from "../utils/FormatterResponseService.js";
import { loadEnv, parseJSONField } from "../utils/utilis.js";
import { generarPassword, hashPassword } from "../utils/encrypted.js";

loadEnv();

/**
 * @class ProfesorService
 * @description Servicio para operaciones de negocio relacionadas con profesores
 */
export default class ProfesorService {
  static async registrarProfesor(datos, imagen, user_action) {
    try {
      const Pregrados = parseJSONField(datos.pre_grado, "Pre-Grados");
      const Posgrado = parseJSONField(datos.pos_grado, "Pos-Grados");
      const Areasconocimiento = parseJSONField(
        datos.area_de_conocimiento,
        "Areas de conocimiento"
      );

      const datosProfesor = {
        ...datos, // ← Spread primero
        pre_grado: Pregrados, // ← Luego sobrescribes con los valores parseados
        pos_grado: Posgrado,
        areas_de_conocimiento: Areasconocimiento,
        cedula: parseInt(datos.cedula),
      };

      console.log("✅ Datos del profesor:", datosProfesor);
      // 1. Validar datos del profesor
      console.log("✅ Validando datos del profesor...");
      const validation = ValidationService.validateProfesor(datosProfesor);

      if (!validation.isValid) {
        console.error("❌ Validación de datos fallida:", validation.errors);
        FormatterResponseService.validationError(
          validation.errors,
          "Error de validación en registro de profesor"
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
        FormatterResponseService.validationError(
          idValidation.errors,
          "ID de usuario inválido"
        );
      }

      // 3. Validar imagen (solo si se proporciona)
      let imagenPath = null;
      if (imagen && imagen.originalName) {
        console.log("🖼️ Validando imagen...");
        const imagenService = new ImagenService("Profesores");
        const validationImage = await imagenService.validateImage(
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
          FormatterResponseService.validationError(
            [{ path: "imagen", message: validationImage.error }],
            "Error de validación de imagen"
          );
        }

        console.log("✅ Imagen válida:", validationImage.message);

        // Guardar imagen y obtener la ruta
        console.log("💾 Procesando y guardando imagen...");
        imagenPath = await imagenService.processAndSaveImage(
          imagen.originalName,
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
        FormatterResponseService.error(
          "El email proporcionado no es válido o no existe",
          "Lo sentimos, el email proporcionado no es válido o no existe",
          400,
          "INVALID_EMAIL",
          {
            email: datos.email,
          }
        );
      }
      const contrania = await generarPassword();
      const hash = hashPassword(contrania);

      // 5. Crear profesor en el modelo
      console.log("👨‍🏫 Creando profesor en base de datos...");
      const respuestaModel = await ProfesorModel.crear(
        {
          ...datosProfesor,
          imagen: imagenPath,
          password: hash,
        },
        user_action.id
      );

      if (FormatterResponseService.isError(respuestaModel)) {
        return respuestaModel;
      }

      if (process.MODE === "DEVELOPMENT") {
        console.log("📊 Respuesta del modelo:", respuestaModel);
      }

      const Correo = {
        asunto: "Bienvenido/a al Sistema Académico - Credenciales de Acceso",
        html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2 style="color: #2c3e50;">¡Bienvenido/a, ${datos.nombres}!</h2>
        <p>Es un placer darle la bienvenida a nuestra plataforma académica como profesor.</p>
        <p>Sus credenciales de acceso son:</p>
        <div style="background-color: #f8f9fa; padding: 15px; border-left: 4px solid #3498db; margin: 15px 0;">
          <p><strong>Usuario:</strong> ${datos.email}</p>
          <p><strong>Contraseña temporal:</strong> ${contrania}</p>
        </div>
        <p><strong>Instrucciones importantes:</strong></p>
        <ul>
          <li>Cambie su contraseña después del primer acceso</li>
          <li>Esta contraseña es temporal y de uso personal</li>
          <li>Guarde esta información en un lugar seguro</li>
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

      const Resultado = await emailService.enviarEmail({
        Destinatario: datos.email,
        Correo: Correo,
        verificarEmail: false,
      });
      console.log("📧 Email enviado:", Resultado);

      // 6. Enviar notificación
      console.log("🔔 Enviando notificaciones...");
      const notificationService = new NotificationService();
      await notificationService.crearNotificacionMasiva({
        titulo: "Nuevo Profesor Registrado",
        tipo: "profesor_creado",
        contenido: `Se ha registrado al profesor ${datos.nombres} ${datos.apellidos} en el sistema`,
        metadatos: {
          profesor_cedula: datos.cedula,
          profesor_nombre: `${datos.nombres} ${datos.apellidos}`,
          usuario_creador: user_action.id,
          fecha_registro: new Date().toISOString(),
        },
        roles_ids: [3, 4, 20],
        users_ids: [user_action.id, datos.cedula],
      });

      console.log("🎉 Profesor registrado exitosamente");

      return FormatterResponseService.success(
        {
          message: "Profesor creado exitosamente",
          profesor: {
            cedula: datos.cedula,
            nombres: datos.nombres,
            apellidos: datos.apellidos,
            email: datos.email,
            imagen: imagenPath,
          },
        },
        "Profesor registrado exitosamente",
        {
          status: 201,
          title: "Profesor Creado",
        }
      );
    } catch (error) {
      console.error("💥 Error en servicio crear profesor:", error);
      // Re-lanza el error para que el controlador lo maneje
      throw error;
    }
  }

  /**
   * @static
   * @async
   * @method obtenerTodos
   * @description Obtener todos los profesores con validación de parámetros
   * @param {Object} queryParams - Parámetros de consulta
   * @returns {Object} Resultado de la operación
   */
  static async obtenerTodos(queryParams = {}) {
    try {
      // Validar parámetros de consulta
      const allowedParams = ["page", "limit", "sort", "order"];
      const queryValidation = ValidationService.validateQueryParams(
        queryParams,
        allowedParams
      );

      if (!queryValidation.isValid) {
        FormatterResponseService.validationError(
          queryValidation.errors,
          "Error de validación en parámetros de consulta"
        );
      }

      const respuestaModel = await ProfesorModel.obtenerTodos();

      if (FormatterResponseService.isError(respuestaModel)) {
        return respuestaModel;
      }

      return FormatterResponseService.success(
        {
          profesores: respuestaModel.data,
          total: respuestaModel.data.length,
          page: parseInt(queryParams.page) || 1,
          limit: parseInt(queryParams.limit) || respuestaModel.data.length,
        },
        "Profesores obtenidos exitosamente",
        {
          status: 200,
          title: "Lista de Profesores",
        }
      );
    } catch (error) {
      console.error("Error en servicio obtener todos los profesores:", error);
      throw error;
    }
  }

  /**
   * @static
   * @async
   * @method obtenerConFiltros
   * @description Obtener profesores con filtros validados
   * @param {Object} filtros - Filtros de búsqueda
   * @returns {Object} Resultado de la operación
   */
  static async obtenerConFiltros(filtros = {}) {
    try {
      // Validar estructura de filtros
      const filterValidation = ValidationService.validateQueryParams(filtros, [
        "dedicacion",
        "categoria",
        "ubicacion",
        "area",
        "fecha",
        "genero",
      ]);

      if (!filterValidation.isValid) {
        FormatterResponseService.validationError(
          filterValidation.errors,
          "Error de validación en filtros de búsqueda"
        );
      }

      const respuestaModel = await ProfesorModel.obtenerConFiltros(filtros);

      if (FormatterResponseService.isError(respuestaModel)) {
        return respuestaModel;
      }

      return FormatterResponseService.success(
        {
          profesores: respuestaModel.data,
          total: respuestaModel.data.length,
          filtros_aplicados: filtros,
        },
        "Profesores filtrados obtenidos exitosamente",
        {
          status: 200,
          title: "Profesores Filtrados",
        }
      );
    } catch (error) {
      console.error("Error en servicio obtener profesores con filtros:", error);
      throw error;
    }
  }

  static async obtenerImagenProfesor(id_profesor, queryParams = {}) {
    try {
      console.log(
        `🔍 [obtenerImagenProfesor] Buscando imagen del profesor ID: ${id_profesor}`
      );

      // Validar ID del profesor
      const idValidation = ValidationService.validateId(
        id_profesor,
        "profesor"
      );
      if (!idValidation.isValid) {
        FormatterResponseService.validationError(
          idValidation.errors,
          "ID de profesor inválido"
        );
      }

      // Buscar información del profesor
      const respuesta = await ProfesorModel.buscar(id_profesor.toString());

      if (FormatterResponseService.isError(respuesta)) {
        return respuesta;
      }

      if (!respuesta.data || respuesta.data.length === 0) {
        FormatterResponseService.notFound("Profesor", id_profesor);
      }

      const profesor = respuesta.data[0];

      if (!profesor.imagen) {
        FormatterResponseService.error(
          "Imagen no encontrada",
          "El profesor no tiene una imagen registrada en el sistema",
          404,
          "IMAGE_NOT_FOUND",
          { profesor_id: id_profesor }
        );
      }

      console.log(
        `✅ Imagen encontrada para profesor ${profesor.nombres} ${profesor.apellidos}`
      );

      // Obtener la imagen usando el servicio de imágenes
      const servicioImagen = new ImagenService("profesores");
      const imagen = await servicioImagen.getImage(
        profesor.imagen,
        queryParams
      );

      return FormatterResponseService.success(
        imagen,
        "Imagen del profesor obtenida exitosamente",
        {
          status: 200,
          title: "Imagen del Profesor",
          profesor: {
            id: id_profesor,
            nombre: `${profesor.nombres} ${profesor.apellidos}`,
            cedula: profesor.cedula,
          },
        }
      );
    } catch (error) {
      console.error("💥 Error en servicio obtener imagen del profesor:", error);
      throw error;
    }
  }

  /**
   * @static
   * @async
   * @method buscar
   * @description Buscar profesores con validación de término de búsqueda
   * @param {string} busqueda - Término de búsqueda
   * @returns {Object} Resultado de la operación
   */
  static async buscar(busqueda) {
    try {
      // Validar término de búsqueda
      if (
        !busqueda ||
        typeof busqueda !== "string" ||
        busqueda.trim().length === 0
      ) {
        FormatterResponseService.validationError(
          [
            {
              path: "busqueda",
              message:
                "El término de búsqueda es requerido y debe ser una cadena no vacía",
            },
          ],
          "Error de validación en búsqueda"
        );
      }

      const termino = busqueda.trim();

      if (termino.length < 2) {
        FormatterResponseService.validationError(
          [
            {
              path: "busqueda",
              message:
                "El término de búsqueda debe tener al menos 2 caracteres",
            },
          ],
          "Término de búsqueda demasiado corto"
        );
      }

      const respuestaModel = await ProfesorModel.buscar(termino);

      if (FormatterResponseService.isError(respuestaModel)) {
        return respuestaModel;
      }

      return FormatterResponseService.success(
        {
          profesores: respuestaModel.data,
          total: respuestaModel.data.length,
          termino_busqueda: termino,
        },
        "Búsqueda de profesores completada exitosamente",
        {
          status: 200,
          title: "Resultados de Búsqueda",
        }
      );
    } catch (error) {
      console.error("Error en servicio buscar profesores:", error);
      throw error;
    }
  }

  /**
   * @static
   * @async
   * @method actualizar
   * @description Actualizar un profesor existente con validación y notificación
   * @param {Object} datos - Datos actualizados del profesor
   * @param {object} user_action - Usuario que realiza la acción
   * @returns {Object} Resultado de la operación
   */
  static async actualizar(datos, usuarioId) {
    try {
      // Validar datos parciales del profesor
      const validation = ValidationService.validatePartialProfesor(datos);

      if (!validation.isValid) {
        FormatterResponseService.validationError(
          validation.errors,
          "Error de validación en actualización de profesor"
        );
      }

      // Validar que tenga ID de profesor
      const requiredValidation = ValidationService.validateRequiredFields(
        datos,
        ["id_profesor"]
      );

      if (!requiredValidation.isValid) {
        FormatterResponseService.validationError(
          requiredValidation.errors,
          "Campos requeridos faltantes"
        );
      }

      // Validar ID de usuario
      const idValidation = ValidationService.validateId(usuarioId, "usuario");
      if (!idValidation.isValid) {
        FormatterResponseService.validationError(
          idValidation.errors,
          "ID de usuario inválido"
        );
      }

      // Verificar que el profesor existe
      const profesores = await ProfesorModel.obtenerTodos();
      const profesorActual = profesores.data.find(
        (p) => p.id_profesor === datos.id_profesor
      );

      if (!profesorActual) {
        FormatterResponseService.notFound("Profesor", datos.id_profesor);
      }

      // Actualizar profesor
      const respuestaModel = await ProfesorModel.actualizar(datos, usuarioId);

      if (FormatterResponseService.isError(respuestaModel)) {
        return respuestaModel;
      }

      // Enviar notificación de actualización
      const notificationService = new NotificationService();
      await notificationService.crearNotificacionMasiva({
        titulo: "Profesor Actualizado",
        tipo: "profesor_actualizado",
        contenido: `Se han actualizado los datos del profesor ${
          datos.nombres || profesorActual.nombres
        } ${datos.apellidos || profesorActual.apellidos}`,
        metadatos: {
          profesor_id: datos.id_profesor,
          profesor_cedula: profesorActual.cedula,
          campos_actualizados: Object.keys(datos).filter(
            (key) => key !== "id_profesor"
          ),
          usuario_actualizador: usuarioId,
          fecha_actualizacion: new Date().toISOString(),
        },
        roles_ids: ["admin", "coordinador"],
        users_ids: [usuarioId],
      });

      return FormatterResponseService.success(
        {
          message: "Profesor actualizado exitosamente",
          profesor_id: datos.id_profesor,
        },
        "Profesor actualizado exitosamente",
        {
          status: 200,
          title: "Profesor Actualizado",
        }
      );
    } catch (error) {
      console.error("Error en servicio actualizar profesor:", error);
      throw error;
    }
  }

  /**
   * @static
   * @async
   * @method eliminar
   * @description Eliminar/destituir un profesor con validación y notificación
   * @param {Object} datos - Datos de la eliminación
   * @param {object} user_action - Usuario que realiza la acción
   * @returns {Object} Resultado de la operación
   */
  static async eliminar(datos, usuarioId) {
    try {
      // Validar datos de eliminación
      const requiredValidation = ValidationService.validateRequiredFields(
        datos,
        ["id_profesor", "tipo_accion", "razon"]
      );

      if (!requiredValidation.isValid) {
        FormatterResponseService.validationError(
          requiredValidation.errors,
          "Campos requeridos faltantes para eliminación"
        );
      }

      // Validar ID de usuario
      const idValidation = ValidationService.validateId(usuarioId, "usuario");
      if (!idValidation.isValid) {
        FormatterResponseService.validationError(
          idValidation.errors,
          "ID de usuario inválido"
        );
      }

      // Validar ID de profesor
      const profesorIdValidation = ValidationService.validateId(
        datos.id_profesor,
        "profesor"
      );
      if (!profesorIdValidation.isValid) {
        FormatterResponseService.validationError(
          profesorIdValidation.errors,
          "ID de profesor inválido"
        );
      }

      // Verificar que el profesor existe
      const profesores = await ProfesorModel.obtenerTodos();
      const profesor = profesores.data.find(
        (p) => p.id_profesor === datos.id_profesor
      );

      if (!profesor) {
        FormatterResponseService.notFound("Profesor", datos.id_profesor);
      }

      // Eliminar profesor
      const respuestaModel = await ProfesorModel.eliminar(datos, usuarioId);

      if (FormatterResponseService.isError(respuestaModel)) {
        return respuestaModel;
      }

      // Enviar notificación de eliminación/destitución
      const notificationService = new NotificationService();
      await notificationService.crearNotificacionMasiva({
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

      return FormatterResponseService.success(
        {
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
        `Profesor ${
          datos.tipo_accion === "eliminar" ? "eliminado" : "destituido"
        } exitosamente`,
        {
          status: 200,
          title: `Profesor ${
            datos.tipo_accion === "eliminar" ? "Eliminado" : "Destituido"
          }`,
        }
      );
    } catch (error) {
      console.error("Error en servicio eliminar profesor:", error);
      throw error;
    }
  }

  /**
   * @static
   * @async
   * @method obtenerPregrados
   * @description Obtener todos los pregrados con validación
   * @returns {Object} Resultado de la operación
   */
  static async obtenerPregrados() {
    try {
      const respuestaModel = await ProfesorModel.obtenerPregrados();

      if (FormatterResponseService.isError(respuestaModel)) {
        return respuestaModel;
      }

      return FormatterResponseService.success(
        respuestaModel.data,
        "Pregrados obtenidos exitosamente",
        {
          status: 200,
          title: "Lista de Pregrados",
        }
      );
    } catch (error) {
      console.error("Error en servicio obtener pregrados:", error);
      throw error;
    }
  }

  /**
   * @static
   * @async
   * @method obtenerPosgrados
   * @description Obtener todos los posgrados con validación
   * @returns {Object} Resultado de la operación
   */
  static async obtenerPosgrados() {
    try {
      const respuestaModel = await ProfesorModel.obtenerPosgrados();

      if (FormatterResponseService.isError(respuestaModel)) {
        return respuestaModel;
      }

      return FormatterResponseService.success(
        respuestaModel.data,
        "Posgrados obtenidos exitosamente",
        {
          status: 200,
          title: "Lista de Posgrados",
        }
      );
    } catch (error) {
      console.error("Error en servicio obtener posgrados:", error);
      throw error;
    }
  }

  /**
   * @static
   * @async
   * @method obtenerAreasConocimiento
   * @description Obtener todas las áreas de conocimiento con validación
   * @returns {Object} Resultado de la operación
   */
  static async obtenerAreasConocimiento() {
    try {
      const respuestaModel = await ProfesorModel.obtenerAreasConocimiento();

      if (FormatterResponseService.isError(respuestaModel)) {
        return respuestaModel;
      }

      return FormatterResponseService.success(
        {
          areas_conocimiento: respuestaModel.data,
          total: respuestaModel.data.length,
        },
        "Áreas de conocimiento obtenidas exitosamente",
        {
          status: 200,
          title: "Lista de Áreas de Conocimiento",
        }
      );
    } catch (error) {
      console.error("Error en servicio obtener áreas de conocimiento:", error);
      throw error;
    }
  }

  /**
   * @static
   * @async
   * @method crearPregrado
   * @description Crear un nuevo pregrado
   * @param {Object} datos - Datos del pregrado
   * @param {string} datos.nombre - Nombre del pregrado
   * @param {string} datos.tipo - Tipo del pregrado
   * @param {object} user_action - Usuario que realiza la acción
   * @param {number} user_action.id - ID del usuario
   * @returns {Promise<Object>} Resultado de la operación
   */
  static async crearPregrado(datos, user_action) {
    try {
      console.log("🔍 [crearPregrado] Iniciando creación de pregrado...");

      // Validar datos del pregrado usando el nuevo método
      const validation = ValidationService.validateNuevoPregrado(datos);
      if (!validation.isValid) {
        FormatterResponseService.validationError(
          validation.errors,
          "Error de validación en creación de pregrado"
        );
      }

      // Validar ID de usuario
      const idValidation = ValidationService.validateId(
        user_action.id,
        "usuario"
      );
      if (!idValidation.isValid) {
        FormatterResponseService.validationError(
          idValidation.errors,
          "ID de usuario inválido"
        );
      }

      const respuestaModel = await ProfesorModel.crearPregrado(
        datos,
        user_action.id
      );

      if (FormatterResponseService.isError(respuestaModel)) {
        return respuestaModel;
      }

      console.log("🎉 Pregrado creado exitosamente");

      return FormatterResponseService.success(
        {
          message: "Pregrado creado exitosamente",
          pregrado: {
            nombre: datos.nombre,
            tipo: datos.tipo,
          },
        },
        "Pregrado creado exitosamente",
        {
          status: 201,
          title: "Pregrado Creado",
        }
      );
    } catch (error) {
      console.error("💥 Error en servicio crear pregrado:", error);
      throw error;
    }
  }

  /**
   * @static
   * @async
   * @method crearPosgrado
   * @description Crear un nuevo posgrado
   * @param {Object} datos - Datos del posgrado
   * @param {string} datos.nombre - Nombre del posgrado
   * @param {string} datos.tipo - Tipo del posgrado
   * @param {object} user_action - Usuario que realiza la acción
   * @param {number} user_action.id - ID del usuario
   * @returns {Promise<Object>} Resultado de la operación
   */
  static async crearPosgrado(datos, user_action) {
    try {
      console.log("🔍 [crearPosgrado] Iniciando creación de posgrado...");

      // Validar datos del posgrado usando el nuevo método
      const validation = ValidationService.validateNuevoPosgrado(datos);
      if (!validation.isValid) {
        FormatterResponseService.validationError(
          validation.errors,
          "Error de validación en creación de posgrado"
        );
      }

      // Validar ID de usuario
      const idValidation = ValidationService.validateId(
        user_action.id,
        "usuario"
      );
      if (!idValidation.isValid) {
        FormatterResponseService.validationError(
          idValidation.errors,
          "ID de usuario inválido"
        );
      }

      const respuestaModel = await ProfesorModel.crearPosgrado(
        datos,
        user_action.id
      );

      if (FormatterResponseService.isError(respuestaModel)) {
        return respuestaModel;
      }

      console.log("🎉 Posgrado creado exitosamente");

      return FormatterResponseService.success(
        {
          message: "Posgrado creado exitosamente",
          posgrado: {
            nombre: datos.nombre,
            tipo: datos.tipo,
          },
        },
        "Posgrado creado exitosamente",
        {
          status: 201,
          title: "Posgrado Creado",
        }
      );
    } catch (error) {
      console.error("💥 Error en servicio crear posgrado:", error);
      throw error;
    }
  }

  /**
   * @static
   * @async
   * @method crearAreaConocimiento
   * @description Crear una nueva área de conocimiento
   * @param {Object} datos - Datos del área de conocimiento
   * @param {string} datos.area_conocimiento - Nombre del área de conocimiento
   * @param {object} user_action - Usuario que realiza la acción
   * @param {number} user_action.id - ID del usuario
   * @returns {Promise<Object>} Resultado de la operación
   */
  static async crearAreaConocimiento(datos, user_action) {
    try {
      console.log(
        "🔍 [crearAreaConocimiento] Iniciando creación de área de conocimiento..."
      );

      // Validar datos del área de conocimiento usando el nuevo método
      const validation = ValidationService.validateNuevaAreaConocimiento(datos);
      if (!validation.isValid) {
        FormatterResponseService.validationError(
          validation.errors,
          "Error de validación en creación de área de conocimiento"
        );
      }

      // Validar ID de usuario
      const idValidation = ValidationService.validateId(
        user_action.id,
        "usuario"
      );
      if (!idValidation.isValid) {
        FormatterResponseService.validationError(
          idValidation.errors,
          "ID de usuario inválido"
        );
      }

      const respuestaModel = await ProfesorModel.crearAreaConocimiento(
        datos,
        user_action.id
      );

      if (FormatterResponseService.isError(respuestaModel)) {
        return respuestaModel;
      }

      console.log("🎉 Área de conocimiento creada exitosamente");

      return FormatterResponseService.success(
        {
          message: "Área de conocimiento creada exitosamente",
          area_conocimiento: {
            nombre: datos.area_conocimiento,
          },
        },
        "Área de conocimiento creada exitosamente",
        {
          status: 201,
          title: "Área de Conocimiento Creada",
        }
      );
    } catch (error) {
      console.error("💥 Error en servicio crear área de conocimiento:", error);
      throw error;
    }
  }
}
