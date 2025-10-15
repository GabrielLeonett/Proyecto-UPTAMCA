import horarioSchema from "../schemas/horario.schema.js";
import aulaSchema from "../schemas/aula.schema.js";
import contraseniaSchema from "../schemas/contrasenia.schema.js";
import coordinadorSchema from "../schemas/coordinador.schema.js";
import destitucionSchema from "../schemas/destitucion.schema.js";
import disponibilidadDocenteSchema from "../schemas/disponibildaddocente.schema.js";
import loginSchema from "../schemas/login.schema.js";
import pnfSchema from "../schemas/pnf.schema.js";
import profesorSchema from "../schemas/professor.schema.js";
import seccionSchema from "../schemas/seccion.schema.js";
import sedeSchema from "../schemas/sede.schema.js";
import unidadCurricularSchema from "../schemas/unidadcurricular.schema.js";
import userSchema from "../schemas/user.schema.js";

/**
 * @class ValidationService
 * @description Servicio para manejar todas las validaciones de la aplicación
 */
export default class ValidationService {
  /**
   * @function formatValidationErrors
   * @description Formatea los errores de validación de Zod u otros validadores
   * @param {Object} validationResult - Resultado de la validación
   * @param {Boolean} validationResult.success - Estado de la validacion
   * @param {Object} [options] - Opciones para configurar el formato de los errores
   * @param {Boolean} [options.includeCode=false] - Incluir código del error Zod
   * @param {Boolean} [options.includeTypes=false] - Incluir tipos esperado/recibido
   * @param {Boolean} [options.fullPath=true] - Unir path con puntos (ej: 'user.email')
   * @returns {Boolean} Verdadero en caso de que no haya errores
   * @returns {Array<Object>} Array de errores formateados
   */
  static formatValidationErrors(validationResult, options = {}) {
    const {
      includeCode = false,
      includeTypes = false,
      fullPath = true,
    } = options;

    if (validationResult.success) {
      return true;
    }

    // Si no hay error o la validación fue exitosa
    if (!validationResult?.error) {
      return [];
    }

    let errors = [];

    // Caso 1: Estructura Zod (error.issues)
    if (validationResult.error?.issues) {
      errors = validationResult.error.issues.map((error) => {
        const errorObj = {
          path: fullPath
            ? error.path?.join(".") || "unknown"
            : error.path || ["unknown"],
          message: error.message || "Error de validación no especificado",
        };

        if (includeCode) {
          errorObj.code = error.code || "VALIDATION_ERROR";
        }

        if (includeTypes) {
          errorObj.expected = error.expected;
          errorObj.received = error.received;
        }

        return errorObj;
      });
    }
    // Caso 2: Estructura con array directo
    else if (Array.isArray(validationResult.error)) {
      errors = validationResult.error.map((error) => ({
        path: error.path || (fullPath ? "unknown" : ["unknown"]),
        message: error.message || "Error de validación no especificado",
        ...(includeCode && { code: error.code || "VALIDATION_ERROR" }),
      }));
    }
    // Caso 3: Otras estructuras
    else {
      errors = [
        {
          path: fullPath ? "general" : ["general"],
          message:
            validationResult.error?.message ||
            "Error de validación desconocido",
          ...(includeCode && {
            code: validationResult.error?.code || "VALIDATION_ERROR",
          }),
        },
      ];
    }

    return errors;
  }

  // =============================================
  // MÉTODOS DE VALIDACIÓN PARA HORARIO
  // =============================================

  /**
   * @name validateHorario
   * @description Valida los datos completos de un horario
   * @param {Object} data - Datos del horario a validar
   * @param {Object} [options] - Opciones de formato de errores
   * @returns {Object} Resultado de la validación
   */
  static validateHorario(data, options = {}) {
    const validationResult = horarioSchema.safeParse(data);
    const errors = this.formatValidationErrors(validationResult, options);

    return {
      isValid: errors === true,
      errors: errors === true ? [] : errors,
      data: validationResult.success ? validationResult.data : null,
    };
  }

  /**
   * @name validatePartialHorario
   * @description Valida datos parciales de un horario (para updates)
   * @param {Object} data - Datos parciales del horario
   * @param {Object} [options] - Opciones de formato de errores
   * @returns {Object} Resultado de la validación
   */
  static validatePartialHorario(data, options = {}) {
    const validationResult = horarioSchema.partial().safeParse(data);
    const errors = this.formatValidationErrors(validationResult, options);

    return {
      isValid: errors === true,
      errors: errors === true ? [] : errors,
      data: validationResult.success ? validationResult.data : null,
    };
  }

  // =============================================
  // MÉTODOS DE VALIDACIÓN PARA AULA
  // =============================================

  /**
   * @name validateAula
   * @description Valida los datos completos de un aula
   * @param {Object} data - Datos del aula a validar
   * @param {Object} [options] - Opciones de formato de errores
   * @returns {Object} Resultado de la validación
   */
  static validateAula(data, options = {}) {
    const validationResult = aulaSchema.safeParse(data);
    const errors = this.formatValidationErrors(validationResult, options);

    return {
      isValid: errors === true,
      errors: errors === true ? [] : errors,
      data: validationResult.success ? validationResult.data : null,
    };
  }

  /**
   * @name validatePartialAula
   * @description Valida datos parciales de un aula (para updates)
   * @param {Object} data - Datos parciales del aula
   * @param {Object} [options] - Opciones de formato de errores
   * @returns {Object} Resultado de la validación
   */
  static validatePartialAula(data, options = {}) {
    const validationResult = aulaSchema.partial().safeParse(data);
    const errors = this.formatValidationErrors(validationResult, options);

    return {
      isValid: errors === true,
      errors: errors === true ? [] : errors,
      data: validationResult.success ? validationResult.data : null,
    };
  }

  // =============================================
  // MÉTODOS DE VALIDACIÓN PARA CONTRASEÑA
  // =============================================

  /**
   * @name validateContrasenia
   * @description Valida los datos completos de una contraseña
   * @param {Object} data - Datos de la contraseña a validar
   * @param {Object} [options] - Opciones de formato de errores
   * @returns {Object} Resultado de la validación
   */
  static validateContrasenia(data, options = {}) {
    const validationResult = contraseniaSchema.safeParse(data);
    const errors = this.formatValidationErrors(validationResult, options);

    return {
      isValid: errors === true,
      errors: errors === true ? [] : errors,
      data: validationResult.success ? validationResult.data : null,
    };
  }

  /**
   * @name validatePartialContrasenia
   * @description Valida datos parciales de una contraseña (para updates)
   * @param {Object} data - Datos parciales de la contraseña
   * @param {Object} [options] - Opciones de formato de errores
   * @returns {Object} Resultado de la validación
   */
  static validatePartialContrasenia(data, options = {}) {
    const validationResult = contraseniaSchema.partial().safeParse(data);
    const errors = this.formatValidationErrors(validationResult, options);

    return {
      isValid: errors === true,
      errors: errors === true ? [] : errors,
      data: validationResult.success ? validationResult.data : null,
    };
  }

  // =============================================
  // MÉTODOS DE VALIDACIÓN PARA COORDINADOR
  // =============================================

  /**
   * @name validateCoordinador
   * @description Valida los datos completos de un coordinador
   * @param {Object} data - Datos del coordinador a validar
   * @param {Object} [options] - Opciones de formato de errores
   * @returns {Object} Resultado de la validación
   */
  static validateCoordinador(data, options = {}) {
    const validationResult = coordinadorSchema.safeParse(data);
    const errors = this.formatValidationErrors(validationResult, options);

    return {
      isValid: errors === true,
      errors: errors === true ? [] : errors,
      data: validationResult.success ? validationResult.data : null,
    };
  }

  /**
   * @name validatePartialCoordinador
   * @description Valida datos parciales de un coordinador (para updates)
   * @param {Object} data - Datos parciales del coordinador
   * @param {Object} [options] - Opciones de formato de errores
   * @returns {Object} Resultado de la validación
   */
  static validatePartialCoordinador(data, options = {}) {
    const validationResult = coordinadorSchema.partial().safeParse(data);
    const errors = this.formatValidationErrors(validationResult, options);

    return {
      isValid: errors === true,
      errors: errors === true ? [] : errors,
      data: validationResult.success ? validationResult.data : null,
    };
  }

  // =============================================
  // MÉTODOS DE VALIDACIÓN PARA DESTITUCIÓN
  // =============================================

  /**
   * @name validateDestitucion
   * @description Valida los datos completos de una destitución
   * @param {Object} data - Datos de la destitución a validar
   * @param {Object} [options] - Opciones de formato de errores
   * @returns {Object} Resultado de la validación
   */
  static validateDestitucion(data, options = {}) {
    const validationResult = destitucionSchema.safeParse(data);
    const errors = this.formatValidationErrors(validationResult, options);

    return {
      isValid: errors === true,
      errors: errors === true ? [] : errors,
      data: validationResult.success ? validationResult.data : null,
    };
  }

  /**
   * @name validatePartialDestitucion
   * @description Valida datos parciales de una destitución (para updates)
   * @param {Object} data - Datos parciales de la destitución
   * @param {Object} [options] - Opciones de formato de errores
   * @returns {Object} Resultado de la validación
   */
  static validatePartialDestitucion(data, options = {}) {
    const validationResult = destitucionSchema.partial().safeParse(data);
    const errors = this.formatValidationErrors(validationResult, options);

    return {
      isValid: errors === true,
      errors: errors === true ? [] : errors,
      data: validationResult.success ? validationResult.data : null,
    };
  }

  // =============================================
  // MÉTODOS DE VALIDACIÓN PARA DISPONIBILIDAD DOCENTE
  // =============================================

  /**
   * @name validateDisponibilidadDocente
   * @description Valida los datos completos de una disponibilidad docente
   * @param {Object} data - Datos de la disponibilidad docente a validar
   * @param {Object} [options] - Opciones de formato de errores
   * @returns {Object} Resultado de la validación
   */
  static validateDisponibilidadDocente(data, options = {}) {
    const validationResult = disponibilidadDocenteSchema.safeParse(data);
    const errors = this.formatValidationErrors(validationResult, options);

    return {
      isValid: errors === true,
      errors: errors === true ? [] : errors,
      data: validationResult.success ? validationResult.data : null,
    };
  }

  /**
   * @name validatePartialDisponibilidadDocente
   * @description Valida datos parciales de una disponibilidad docente (para updates)
   * @param {Object} data - Datos parciales de la disponibilidad docente
   * @param {Object} [options] - Opciones de formato de errores
   * @returns {Object} Resultado de la validación
   */
  static validatePartialDisponibilidadDocente(data, options = {}) {
    const validationResult = disponibilidadDocenteSchema.partial().safeParse(data);
    const errors = this.formatValidationErrors(validationResult, options);

    return {
      isValid: errors === true,
      errors: errors === true ? [] : errors,
      data: validationResult.success ? validationResult.data : null,
    };
  }

  // =============================================
  // MÉTODOS DE VALIDACIÓN PARA LOGIN
  // =============================================

  /**
   * @name validateLogin
   * @description Valida los datos completos de un login
   * @param {Object} data - Datos del login a validar
   * @param {Object} [options] - Opciones de formato de errores
   * @returns {Object} Resultado de la validación
   */
  static validateLogin(data, options = {}) {
    const validationResult = loginSchema.safeParse(data);
    const errors = this.formatValidationErrors(validationResult, options);

    return {
      isValid: errors === true,
      errors: errors === true ? [] : errors,
      data: validationResult.success ? validationResult.data : null,
    };
  }

  /**
   * @name validatePartialLogin
   * @description Valida datos parciales de un login (para updates)
   * @param {Object} data - Datos parciales del login
   * @param {Object} [options] - Opciones de formato de errores
   * @returns {Object} Resultado de la validación
   */
  static validatePartialLogin(data, options = {}) {
    const validationResult = loginSchema.partial().safeParse(data);
    const errors = this.formatValidationErrors(validationResult, options);

    return {
      isValid: errors === true,
      errors: errors === true ? [] : errors,
      data: validationResult.success ? validationResult.data : null,
    };
  }

  // =============================================
  // MÉTODOS DE VALIDACIÓN PARA PNF
  // =============================================

  /**
   * @name validatePnf
   * @description Valida los datos completos de un PNF
   * @param {Object} data - Datos del PNF a validar
   * @param {Object} [options] - Opciones de formato de errores
   * @returns {Object} Resultado de la validación
   */
  static validatePnf(data, options = {}) {
    const validationResult = pnfSchema.safeParse(data);
    const errors = this.formatValidationErrors(validationResult, options);

    return {
      isValid: errors === true,
      errors: errors === true ? [] : errors,
      data: validationResult.success ? validationResult.data : null,
    };
  }

  /**
   * @name validatePartialPnf
   * @description Valida datos parciales de un PNF (para updates)
   * @param {Object} data - Datos parciales del PNF
   * @param {Object} [options] - Opciones de formato de errores
   * @returns {Object} Resultado de la validación
   */
  static validatePartialPnf(data, options = {}) {
    const validationResult = pnfSchema.partial().safeParse(data);
    const errors = this.formatValidationErrors(validationResult, options);

    return {
      isValid: errors === true,
      errors: errors === true ? [] : errors,
      data: validationResult.success ? validationResult.data : null,
    };
  }

  // =============================================
  // MÉTODOS DE VALIDACIÓN PARA PROFESOR
  // =============================================

  /**
   * @name validateProfesor
   * @description Valida los datos completos de un profesor
   * @param {Object} data - Datos del profesor a validar
   * @param {Object} [options] - Opciones de formato de errores
   * @returns {Object} Resultado de la validación
   */
  static validateProfesor(data, options = {}) {
    const validationResult = profesorSchema.safeParse(data);
    const errors = this.formatValidationErrors(validationResult, options);

    return {
      isValid: errors === true,
      errors: errors === true ? [] : errors,
      data: validationResult.success ? validationResult.data : null,
    };
  }

  /**
   * @name validatePartialProfesor
   * @description Valida datos parciales de un profesor (para updates)
   * @param {Object} data - Datos parciales del profesor
   * @param {Object} [options] - Opciones de formato de errores
   * @returns {Object} Resultado de la validación
   */
  static validatePartialProfesor(data, options = {}) {
    const validationResult = profesorSchema.partial().safeParse(data);
    const errors = this.formatValidationErrors(validationResult, options);

    return {
      isValid: errors === true,
      errors: errors === true ? [] : errors,
      data: validationResult.success ? validationResult.data : null,
    };
  }

  // =============================================
  // MÉTODOS DE VALIDACIÓN PARA SECCIÓN
  // =============================================

  /**
   * @name validateSeccion
   * @description Valida los datos completos de una sección
   * @param {Object} data - Datos de la sección a validar
   * @param {Object} [options] - Opciones de formato de errores
   * @returns {Object} Resultado de la validación
   */
  static validateSeccion(data, options = {}) {
    const validationResult = seccionSchema.safeParse(data);
    const errors = this.formatValidationErrors(validationResult, options);

    return {
      isValid: errors === true,
      errors: errors === true ? [] : errors,
      data: validationResult.success ? validationResult.data : null,
    };
  }

  /**
   * @name validatePartialSeccion
   * @description Valida datos parciales de una sección (para updates)
   * @param {Object} data - Datos parciales de la sección
   * @param {Object} [options] - Opciones de formato de errores
   * @returns {Object} Resultado de la validación
   */
  static validatePartialSeccion(data, options = {}) {
    const validationResult = seccionSchema.partial().safeParse(data);
    const errors = this.formatValidationErrors(validationResult, options);

    return {
      isValid: errors === true,
      errors: errors === true ? [] : errors,
      data: validationResult.success ? validationResult.data : null,
    };
  }

  // =============================================
  // MÉTODOS DE VALIDACIÓN PARA SEDE
  // =============================================

  /**
   * @name validateSede
   * @description Valida los datos completos de una sede
   * @param {Object} data - Datos de la sede a validar
   * @param {Object} [options] - Opciones de formato de errores
   * @returns {Object} Resultado de la validación
   */
  static validateSede(data, options = {}) {
    const validationResult = sedeSchema.safeParse(data);
    const errors = this.formatValidationErrors(validationResult, options);

    return {
      isValid: errors === true,
      errors: errors === true ? [] : errors,
      data: validationResult.success ? validationResult.data : null,
    };
  }

  /**
   * @name validatePartialSede
   * @description Valida datos parciales de una sede (para updates)
   * @param {Object} data - Datos parciales de la sede
   * @param {Object} [options] - Opciones de formato de errores
   * @returns {Object} Resultado de la validación
   */
  static validatePartialSede(data, options = {}) {
    const validationResult = sedeSchema.partial().safeParse(data);
    const errors = this.formatValidationErrors(validationResult, options);

    return {
      isValid: errors === true,
      errors: errors === true ? [] : errors,
      data: validationResult.success ? validationResult.data : null,
    };
  }

  // =============================================
  // MÉTODOS DE VALIDACIÓN PARA UNIDAD CURRICULAR
  // =============================================

  /**
   * @name validateUnidadCurricular
   * @description Valida los datos completos de una unidad curricular
   * @param {Object} data - Datos de la unidad curricular a validar
   * @param {Object} [options] - Opciones de formato de errores
   * @returns {Object} Resultado de la validación
   */
  static validateUnidadCurricular(data, options = {}) {
    const validationResult = unidadCurricularSchema.safeParse(data);
    const errors = this.formatValidationErrors(validationResult, options);

    return {
      isValid: errors === true,
      errors: errors === true ? [] : errors,
      data: validationResult.success ? validationResult.data : null,
    };
  }

  /**
   * @name validatePartialUnidadCurricular
   * @description Valida datos parciales de una unidad curricular (para updates)
   * @param {Object} data - Datos parciales de la unidad curricular
   * @param {Object} [options] - Opciones de formato de errores
   * @returns {Object} Resultado de la validación
   */
  static validatePartialUnidadCurricular(data, options = {}) {
    const validationResult = unidadCurricularSchema.partial().safeParse(data);
    const errors = this.formatValidationErrors(validationResult, options);

    return {
      isValid: errors === true,
      errors: errors === true ? [] : errors,
      data: validationResult.success ? validationResult.data : null,
    };
  }

  // =============================================
  // MÉTODOS DE VALIDACIÓN PARA USER
  // =============================================

  /**
   * @name validateUser
   * @description Valida los datos completos de un usuario
   * @param {Object} data - Datos del usuario a validar
   * @param {Object} [options] - Opciones de formato de errores
   * @returns {Object} Resultado de la validación
   */
  static validateUser(data, options = {}) {
    const validationResult = userSchema.safeParse(data);
    const errors = this.formatValidationErrors(validationResult, options);

    return {
      isValid: errors === true,
      errors: errors === true ? [] : errors,
      data: validationResult.success ? validationResult.data : null,
    };
  }

  /**
   * @name validatePartialUser
   * @description Valida datos parciales de un usuario (para updates)
   * @param {Object} data - Datos parciales del usuario
   * @param {Object} [options] - Opciones de formato de errores
   * @returns {Object} Resultado de la validación
   */
  static validatePartialUser(data, options = {}) {
    const validationResult = userSchema.partial().safeParse(data);
    const errors = this.formatValidationErrors(validationResult, options);

    return {
      isValid: errors === true,
      errors: errors === true ? [] : errors,
      data: validationResult.success ? validationResult.data : null,
    };
  }

  // =============================================
  // MÉTODOS DE VALIDACIÓN GENERALES
  // =============================================

  /**
   * @name validateId
   * @description Valida que un ID sea numérico y positivo
   * @param {any} id - ID a validar
   * @param {string} entityName - Nombre de la entidad para el mensaje de error
   * @returns {Object} Resultado de la validación
   */
  static validateId(id, entityName = "entidad") {
    const numId = parseInt(id);
    const isValid = !isNaN(numId) && numId > 0;

    return {
      isValid,
      errors: isValid
        ? []
        : [
            {
              path: "id",
              message: `ID de ${entityName} debe ser un número positivo`,
            },
          ],
      data: isValid ? numId : null,
    };
  }

  /**
   * @name validateQueryParams
   * @description Valida parámetros de consulta comunes
   * @param {Object} query - Objeto query de la request
   * @param {Array} allowedParams - Parámetros permitidos
   * @returns {Object} Resultado de la validación
   */
  static validateQueryParams(query, allowedParams = []) {
    const invalidParams = Object.keys(query).filter(
      (param) => !allowedParams.includes(param)
    );
    const isValid = invalidParams.length === 0;

    return {
      isValid,
      errors: isValid
        ? []
        : invalidParams.map((param) => ({
            path: "query",
            message: `Parámetro '${param}' no permitido. Parámetros válidos: ${allowedParams.join(
              ", "
            )}`,
          })),
      data: query,
    };
  }

  /**
   * @name validateRequiredFields
   * @description Valida que los campos requeridos estén presentes
   * @param {Object} data - Datos a validar
   * @param {Array} requiredFields - Campos requeridos
   * @returns {Object} Resultado de la validación
   */
  static validateRequiredFields(data, requiredFields) {
    const missingFields = requiredFields.filter(
      (field) =>
        data[field] === undefined || data[field] === null || data[field] === ""
    );
    const isValid = missingFields.length === 0;

    return {
      isValid,
      errors: isValid
        ? []
        : missingFields.map((field) => ({
            path: field,
            message: `El campo '${field}' es requerido`,
          })),
      data,
    };
  }

  /**
   * @name createValidationResponse
   * @description Crea una respuesta estandarizada para errores de validación
   * @param {Array} errors - Array de errores
   * @returns {Object} Respuesta formateada para el controlador
   */
  static createValidationResponse(errors) {
    return {
      state: "validation_error",
      status: 400,
      title: "Datos Erróneos",
      message: "Los datos de entrada no son válidos",
      error: errors,
    };
  }
}