/**
 * @function validationErrors 
 * @description Formatea los errores de validación de Zod u otros validadores
 * @param {Object} validationResult - Resultado de la validación
 * @param {Boolean} validationResult.success - Estado de la validacion
 * @param {Object} [options] - Opciones para configurar el formato de los errores
 * @param {Boolean} [options.includeCode=false] - Incluir código del error Zod
 * @param {Boolean} [options.includeTypes=false] - Incluir tipos esperado/recibido
 * @param {Boolean} [options.fullPath=true] - Unir path con puntos (ej: 'user.email')
 * @returns {Boolean} Verdadero en caso de que no haya errores
 * @returns {Array<Object>} Array de errores formateados
 * @author Gabriel Leonett
 */
export default function validationErrors(validationResult, options = {}) {
    const {
        includeCode = false,
        includeTypes = false,
        fullPath = true
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
        errors = validationResult.error.issues.map(error => {
            const errorObj = {
                path: fullPath ? error.path?.join('.') || 'unknown' : error.path || ['unknown'],
                message: error.message || 'Error de validación no especificado'
            };

            if (includeCode) {
                errorObj.code = error.code || 'VALIDATION_ERROR';
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
        errors = validationResult.error.map(error => ({
            path: error.path || (fullPath ? 'unknown' : ['unknown']),
            message: error.message || 'Error de validación no especificado',
            ...(includeCode && { code: error.code || 'VALIDATION_ERROR' })
        }));
    }
    // Caso 3: Otras estructuras
    else {
        errors = [{
            path: fullPath ? 'general' : ['general'],
            message: validationResult.error?.message || 'Error de validación desconocido',
            ...(includeCode && { code: validationResult.error?.code || 'VALIDATION_ERROR' })
        }];
    }

    return errors;
}