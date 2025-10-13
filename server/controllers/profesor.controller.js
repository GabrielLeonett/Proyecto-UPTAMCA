import {
  validationPartialProfesor,
  validationProfesor,
} from "../schemas/ProfesorSchema.js";
import { validationDestitucion } from "../schemas/DestitucionSchema.js";
import ProfesorModel from "../models/profesor.model.js";
import validationErrors from "../utils/validationsErrors.js";
import FormatResponseController from "../utils/FormatResponseController.js";
import imagenProcessingServices from "../services/imagenProcessing.services.js";
import { parseJSONField } from "../utils/utilis.js";
import {
  validationDisponibilidadDocente,
  validationPartialDisponibilidadDocente,
} from "../schemas/DisponiblidadDocenteSchema.js";

/**
 * Controlador para gestionar todas las operaciones relacionadas con profesores
 *
 * @class ProfesorController
 * @description Contiene los métodos para registrar, mostrar y buscar profesores
 */
export default class ProfesorController {
  /**
   * Registra un nuevo profesor en el sistema
   *
   * @static
   * @async
   * @method registrarProfesor
   * @param {Object} req - Objeto de solicitud de Express
   * @param {Object} res - Objeto de respuesta de Express
   * @returns {Promise<Object>} Respuesta JSON con el resultado de la operación
   *
   * @throws {400} Si la validación de datos falla
   * @throws {500} Si ocurre un error en el servidor
   *
   * @example
   * // Ejemplo de body requerido:
   * {
   *   "nombres": "Nombre",
   *   "apellidos": "Apellido",
   *   // ...otros campos del profesor
   * }
   */
  static async registrarProfesor(req, res) {
    try {
      const input = { ...req.body };
      const imagen = req.file;

      // Parsear cada campo
      const area_de_conocimiento = parseJSONField(
        input.area_de_conocimiento,
        "áreas de conocimiento"
      );
      const pre_grado = parseJSONField(input.pre_grado, "pregrados");
      const pos_grado = parseJSONField(input.pos_grado, "posgrados");

      // Validación de datos del profesor usando el esquema definido
      let validaciones = validationErrors(
        validationProfesor({
          ...input,
          cedula: parseInt(input.cedula),
          pre_grado: pre_grado,
          pos_grado: pos_grado,
          area_de_conocimiento: area_de_conocimiento,
        })
      );

      if (validaciones !== true) {
        FormatResponseController.respuestaError(res, {
          status: 400,
          title: "Datos Erroneos",
          message: "Los datos del profesor son incorrectos",
          error: validaciones,
        });
        return;
      }

      // Opciones para la validación de imagen
      const options = {
        maxSize: 5 * 1024 * 1024, // 5MB
        maxWidth: 1080,
        maxHeight: 1080,
      };

      // Validación de la imagen
      const validation = await imagenProcessingServices.validateImage(
        "uploads/profesores/",
        imagen.originalname,
        options
      );

      if (!validation.isValid) {
        FormatResponseController.respuestaError(res, {
          status: 400,
          title: "Imagen Inválida",
          message: "La imagen no cumple con los requisitos",
          error: validation.error,
        });
        throw (error.imagen = true);
      }

      // Registrar profesor en la base de datos
      const result = await ProfesorModel.RegisterProfesor({
        datos: { ...input },
        imagen: imagen,
        usuario_accion: req.user, // Usuario que realiza la acción
      });

      FormatResponseController.respuestaExito(res, result);
    } catch (error) {
      console.log(error)
      FormatResponseController.respuestaError(res, error);
    }
  }

  /**
   * Obtiene el listado de profesores en formato API (para consumo programático)
   *
   * @static
   * @async
   * @method mostrarProfesorAPI
   * @param {Object} req - Objeto de solicitud de Express
   * @param {Object} res - Objeto de respuesta de Express
   * @returns {Promise<Object>} Listado de profesores con metadatos
   *
   * @throws {500} Si ocurre un error al consultar la base de datos
   *
   * @example
   * // Ejemplo de query params:
   * /api/Profesor?categoria=Instructor&genero=masculino
   */
  static async mostrarProfesorAPI(req, res) {
    try {
      const result = await ProfesorModel.mostrarProfesorAPI({
        datos: req.query,
      });

      FormatResponseController.respuestaDatos(res, result, {
        timestamp: Date.now,
      });
    } catch (error) {
      FormatResponseController.respuestaError(res, error);
    }
  }

  /**
   * Obtiene la imagen de un profesor en formato API
   *
   * @static
   * @async
   * @method getImageProfesor
   * @param {Object} req - Objeto de solicitud de Express
   * @param {Object} res - Objeto de respuesta de Express
   * @returns {Promise<Object>} Imagen del profesor procesada
   *
   * @throws {400} Si los datos de entrada son incorrectos
   * @throws {404} Si el profesor no existe o no tiene imagen
   * @throws {500} Si ocurre un error al procesar la imagen
   *
   * @example
   * // Ejemplo de uso:
   * GET /api/profesores/imagen?id_profesor=12345678&width=300&height=300&format=jpeg
   */
  static async getImageProfesorDirect(req, res) {
    try {
      const { id_profesor } = req.params;
      const { width, height, quality, format } = req.query;

      // Validar que se proporcionó el ID del profesor
      if (!id_profesor) {
        return res.status(400).json({
          success: false,
          error: "El parámetro id_profesor es requerido",
        });
      }

      // Validación de datos del profesor
      let validaciones = validationErrors(
        validationPartialProfesor({ cedula: parseInt(id_profesor) })
      );

      if (validaciones !== true) {
        return res.status(400).json({
          success: false,
          error: "Datos del profesor incorrectos",
          details: validaciones,
        });
      }

      // Preparar opciones para el procesamiento
      const imageOptions = {};

      if (width) {
        const parsedWidth = parseInt(width);
        if (!isNaN(parsedWidth) && parsedWidth > 0)
          imageOptions.width = parsedWidth;
      }

      if (height) {
        const parsedHeight = parseInt(height);
        if (!isNaN(parsedHeight) && parsedHeight > 0)
          imageOptions.height = parsedHeight;
      }

      if (quality) {
        const parsedQuality = parseInt(quality);
        if (
          !isNaN(parsedQuality) &&
          parsedQuality >= 1 &&
          parsedQuality <= 100
        ) {
          imageOptions.quality = parsedQuality;
        }
      }

      if (
        format &&
        ["jpeg", "jpg", "png", "webp"].includes(format.toLowerCase())
      ) {
        imageOptions.format = format.toLowerCase();
      }

      // Obtener la imagen como buffer
      const imageResult = await ProfesorModel.getImageProfesorBuffer(
        id_profesor,
        imageOptions
      );

      if (!imageResult.success) {
        if (imageResult.message?.includes("no tiene imagen")) {
          return res.status(404).json({
            success: false,
            error: "El profesor no tiene imagen asignada",
          });
        }
        return res.status(404).json({
          success: false,
          error: "No se pudo obtener la imagen del profesor",
        });
      }

      // Configurar headers para la respuesta de imagen
      res.set({
        "Content-Type": imageResult.mimeType,
        "Content-Length": imageResult.fileSize,
        "Content-Disposition": `inline; filename="${imageResult.fileName}"`,
        "Cache-Control": "public, max-age=86400", // Cache de 1 día
        ETag: `"${imageResult.fileName}-${imageResult.fileSize}"`,
      });

      // Enviar el buffer de la imagen DIRECTAMENTE
      res.send(imageResult.buffer);
    } catch (error) {
      console.error("Error en getImageProfesorDirect:", error);

      if (
        error.message?.includes("No se encontró el profesor") ||
        error.message?.includes("no tiene imagen")
      ) {
        return res.status(404).json({
          success: false,
          error: error.message,
        });
      }

      res.status(500).json({
        success: false,
        error: "Error interno del servidor al procesar la imagen",
      });
    }
  }

  /**
   * Obtiene el listado de profesores para visualización en interfaz web
   *
   * @static
   * @async
   * @method mostrarProfesor
   * @param {Object} req - Objeto de solicitud de Express
   * @param {Object} res - Objeto de respuesta de Express
   * @returns {Promise<Object>} Datos formateados para vista web
   *
   * @throws {500} Si ocurre un error al consultar la base de datos
   */
  static async mostrarProfesor(req, res) {
    try {
      const result = await ProfesorModel.mostrarProfesor({ datos: req.query });

      FormatResponseController.respuestaDatos(res, result, {
        timestamp: Date.now,
      });
    } catch (error) {
      FormatResponseController.respuestaError(res, error);
    }
  }

  /**
   * Busca profesores según criterios específicos
   *
   * @static
   * @async
   * @method buscarProfesor
   * @param {Object} req - Objeto de solicitud de Express
   * @param {Object} res - Objeto de respuesta de Express
   * @returns {Promise<Object>} Resultados de la búsqueda
   *
   * @throws {500} Si ocurre un error en la búsqueda
   *
   * @example
   * // Ejemplo de query params:
   * /Profesor/search?busqueda=3124460
   */
  static async buscarProfesor(req, res) {
    try {
      const result = await ProfesorModel.buscarProfesor({ datos: req.body });

      FormatResponseController.respuestaDatos(res, result, {
        timestamp: Date.now,
      });
    } catch (error) {
      FormatResponseController.respuestaError(res, error);
    }
  }

  /**
   * Mostrar los pre-grados existentes
   *
   * @static
   * @async
   * @method mostrarPreGrados
   * @param {Object} req - Objeto de solicitud de Express
   * @param {string} req.param.tipo - el tipo de pre-grado que desea buscar
   * @param {Object} res - Objeto de respuesta de Express
   * @returns {Promise<Object>} Resultados de la búsqueda
   *
   * @throws {500} Si ocurre un error en la búsqueda
   *
   * @example
   * // Ejemplo de query params:
   * /Profesor/pre-grado?tipo=TSU
   */
  static async mostrarPreGrados(req, res) {
    try {
      const result = await ProfesorModel.mostrarPreGrados();
      FormatResponseController.respuestaDatos(res, result);
    } catch (error) {
      FormatResponseController.respuestaError(res, error);
    }
  }

  /**
   * Mostrar los pos-grados existentes
   *
   * @static
   * @async
   * @method mostrarPosGrados
   * @param {Object} req - Objeto de solicitud de Express
   * @param {string} req.param.tipo - el tipo de pos-grado que desea buscar
   * @param {Object} res - Objeto de respuesta de Express
   * @returns {Promise<Object>} Resultados de la búsqueda
   *
   * @throws {500} Si ocurre un error en la búsqueda
   *
   * @example
   * // Ejemplo de query params:
   * /Profesor/pos-grado?tipo=Maestría
   */
  static async mostrarPosGrados(req, res) {
    try {
      const result = await ProfesorModel.mostrarPosGrados();
      FormatResponseController.respuestaDatos(res, result);
    } catch (error) {
      FormatResponseController.respuestaError(res, error);
    }
  }

  /**
   * Buscar las areas de conocimiento existentes
   *
   * @static
   * @async
   * @method mostrarAreasConocimiento
   * @param {Object} req - Objeto de solicitud de Express
   * @param {Object} res - Objeto de respuesta de Express
   * @returns {Promise<Object>} Resultados de la búsqueda
   *
   * @throws {500} Si ocurre un error en la búsqueda
   *
   * @example
   * // Ejemplo de query params:
   * /Profesor/areas-conocimiento
   */
  static async mostrarAreasConocimiento(req, res) {
    try {
      const result = await ProfesorModel.mostrarAreasConocimiento();
      FormatResponseController.respuestaDatos(res, result);
    } catch (error) {
      FormatResponseController.respuestaError(res, error);
    }
  }

  /**
   * Registrar un Pre-Grado
   *
   * @static
   * @async
   * @method registerPreGrado
   * @param {Object} req.body.tipo - Tipo de pre-grado que se desea registrar
   * @param {Object} req.body.nombre - Nombre del pre-grado que se desea registrar
   * @param {Object} res - Objeto de respuesta de Express
   * @returns {Promise<Object>} Resultados de la búsqueda
   *
   * @throws {500} Si ocurre un error en la búsqueda
   *
   * @example
   * // Ejemplo del body:
   * {
   *  tipo: "TSU",
   *  Nombre: "en Imformática"
   * }
   */
  static async registerPreGrado(req, res) {
    try {
      const result = await ProfesorModel.registerPreGrado({
        usuario_accion: req.user,
        datos: req.body,
      });
      FormatResponseController.respuestaExito(res, result);
    } catch (error) {
      // Manejo de errores inesperados
      FormatResponseController.respuestaError(res, error);
    }
  }

  /**
   * Registrar un Pos-Grado
   *
   * @static
   * @async
   * @method registerPosGrado
   * @param {Object} req.body.tipo - Tipo de pos-grado que se desea registrar
   * @param {Object} req.body.nombre - Nombre del pos-grado que se desea registrar
   * @param {Object} res - Objeto de respuesta de Express
   * @returns {Promise<Object>} Resultados de la búsqueda
   *
   * @throws {500} Si ocurre un error en la búsqueda
   *
   * @example
   * // Ejemplo del body:
   * {
   *  tipo: "Doctorardo",
   *  Nombre: "en IA"
   * }
   */
  static async registerPosGrado(req, res) {
    try {
      const result = await ProfesorModel.registerPosGrado({
        usuario_accion: req.user,
        datos: req.body,
      });
      FormatResponseController.respuestaExito(res, result);
    } catch (error) {
      console.log(error);
      // Manejo de errores inesperados
      FormatResponseController.respuestaError(res, error);
    }
  }

  /**
   * Registrar una area de conocimiento de docentes
   *
   * @static
   * @async
   * @method registerAreaConocimiento
   * @param {Object} req.body.area_conocimiento - Nombre de un area conocimiento que se desea registrar
   * @param {Object} res - Objeto de respuesta de Express
   * @returns {Promise<Object>} Resultados de la búsqueda
   *
   * @throws {500} Si ocurre un error en la búsqueda
   *
   * @example
   * // Ejemplo de body:
   * {
   *  area_conocimiento: "Matematicas"
   * }
   */
  static async registerAreaConocimiento(req, res) {
    try {
      const result = await ProfesorModel.registerAreaConocimiento({
        usuario_accion: req.user,
        datos: req.body,
      });
      FormatResponseController.respuestaExito(res, result);
    } catch (error) {
      console.log(error);
      // Manejo de errores inesperados
      FormatResponseController.respuestaError(res, error);
    }
  }

  /**
   * Registrar disponibilidad docente
   *
   * @static
   * @async
   * @method registrarDisponibilidad
   * @param {Object} req.body - Datos de la disponibilidad
   * @param {number} req.body.id_profesor - ID del profesor
   * @param {string} req.body.dia_semana - Día de la semana
   * @param {string} req.body.hora_inicio - Hora de inicio (HH:MM)
   * @param {string} req.body.hora_fin - Hora de fin (HH:MM)
   * @param {Object} res - Objeto de respuesta de Express
   * @returns {Promise<Object>} Resultados del registro
   *
   * @throws {500} Si ocurre un error en el registro
   *
   * @example
   * // Ejemplo de body:
   * {
   *   id_profesor: 1,
   *   dia_semana: "Lunes",
   *   hora_inicio: "08:00",
   *   hora_fin: "10:00"
   * }
   */
  static async registrarDisponibilidad(req, res) {
    try {
      let validaciones = validationErrors(
        validationDisponibilidadDocente(req.body)
      );
      console.log(validaciones);

      if (validaciones !== true) {
        FormatResponseController.respuestaError(res, {
          status: 400, // Cambiado a 400 (Bad Request) en lugar de 401
          title: "Datos Erroneos",
          message: "Los datos de la disponibilidad son incorrectos",
          error: validaciones,
        });
        return;
      }

      // ✅ Si la validación pasa, proceder con el registro
      const result = await ProfesorModel.registrarDisponibilidad({
        usuario_accion: req.user,
        datos: req.body, // Usar los datos validados
      });

      FormatResponseController.respuestaExito(res, result);
    } catch (error) {
      // Manejo de errores específicos del modelo
      if (error.status) {
        return FormatResponseController.respuestaError(res, {
          status: error.status,
          title: "Error al registrar disponibilidad",
          message: error.message,
          error: error.details,
        });
      }

      // Manejo de errores inesperados
      FormatResponseController.respuestaError(res, error);
    }
  }
  /**
   * Actualizar información de profesor
   *
   * @static
   * @async
   * @method actualizarProfesor
   * @param {Object} req - Objeto de request de Express
   * @param {Object} req.body - Datos para la actualización del profesor
   * @param {number} req.body.id_profesor - ID del profesor (cédula) - REQUERIDO
   * @param {string} [req.body.nombres] - Nombres del profesor
   * @param {string} [req.body.apellidos] - Apellidos del profesor
   * @param {string} [req.body.email] - Email del profesor
   * @param {string} [req.body.direccion] - Dirección del profesor
   * @param {string} [req.body.password] - Password del profesor
   * @param {string} [req.body.telefono_movil] - Teléfono móvil
   * @param {string} [req.body.telefono_local] - Teléfono local
   * @param {Date} [req.body.fecha_nacimiento] - Fecha de nacimiento
   * @param {string} [req.body.genero] - Género (masculino/femenino)
   * @param {string} [req.body.nombre_categoria] - Nombre de la categoría
   * @param {string} [req.body.nombre_dedicacion] - Nombre de la dedicación
   * @param {Array} [req.body.pre_grado] - Array de pre-grados
   * @param {Array} [req.body.pos_grado] - Array de pos-grados
   * @param {Array} [req.body.area_de_conocimiento] - Array de áreas de conocimiento
   * @param {string} [req.body.imagen] - URL de la imagen
   * @param {string} [req.body.municipio] - Municipio
   * @param {Date} [req.body.fecha_ingreso] - Fecha de ingreso
   * @param {Object} res - Objeto de respuesta de Express
   * @returns {Promise<Object>} Resultados de la actualización
   *
   * @throws {500} Si ocurre un error en la actualización
   *
   * @example
   * // Ejemplo de body:
   * {
   *   id_profesor: 31264460,
   *   nombres: "Juan",
   *   apellidos: "Pérez",
   *   email: "juan.perez@email.com",
   *   genero: "masculino",
   *   nombre_categoria: "Instructor",
   *   nombre_dedicacion: "Tiempo Completo"
   * }
   */
  static async actualizarProfesor(req, res) {
    try {
      // ✅ Primero validar los datos con el schema
      const validation = validationPartialProfesor(req.body);

      if (!validation.success) {
        const errors = validation.error.issues.map((issue) => ({
          field: issue.path[0],
          message: issue.message,
        }));

        return FormatResponseController.respuestaError(res, {
          status: 400,
          title: "Datos inválidos",
          message: "Error de validación",
          error: errors,
        });
      }

      // ✅ Si la validación pasa, proceder con la actualización
      const result = await ProfesorModel.actualizarProfesor({
        usuario_accion: req.user,
        datos: req.body, // Usar los datos validados
      });

      FormatResponseController.respuestaExito(res, result);
    } catch (error) {
      // Manejo de errores inesperados
      FormatResponseController.respuestaError(res, error);
    }
  }

  /**
   * Destituir/eliminar un profesor
   *
   * @static
   * @async
   * @method destituirProfesor
   * @param {Object} req - Request object
   * @param {Object} req.body - Datos de la destitución
   * @param {number} req.body.id_profesor - ID del profesor
   * @param {string} req.body.tipo_accion - Tipo de acción
   * @param {string} req.body.razon - Razón de la destitución
   * @param {string} [req.body.observaciones] - Observaciones
   * @param {Date} [req.body.fecha_efectiva] - Fecha efectiva
   * @param {Object} res - Response object
   * @returns {Promise<Object>} Resultado de la operación
   */
  static async destituirProfesor(req, res) {
    try {
      // Validar datos de entrada
      console.log(req.body);
      let validaciones = validationErrors(validationDestitucion(req.body));
      console.log(validaciones);

      if (validaciones !== true) {
        return FormatResponseController.respuestaError(res, {
          status: 400,
          title: "Datos inválidos",
          message: "Error de validación en los datos de destitución",
          error: validaciones,
        });
      }

      // Ejecutar destitución
      const result = await ProfesorModel.destituirProfesor({
        usuario_accion: req.user,
        datos: req.body,
      });

      FormatResponseController.respuestaExito(res, result);
    } catch (error) {
      console.error("Error en DestitucionController.destituirProfesor:", error);

      // Manejo de errores inesperados
      FormatResponseController.respuestaError(res, {
        status: 500,
        title: "Error interno",
        message: "Error inesperado al procesar la destitución",
        error: error.message,
      });
    }
  }
}
