/**
 * Módulo para el manejo de operaciones con profesores en la base de datos
 * @module ProfesorModel
 * @description Contiene métodos para registrar, mostrar y buscar profesores
 */

// Importación de librería para encriptación de contraseñas
import { hashPassword, generarPassword } from "../utils/encrypted.js";

// Importación de librería para envío de correos electrónicos
import { enviarEmail } from "../utils/EnviarCorreos.js";

// Importación de la conexión a la base de datos
import db from "../db.js";

// Importación de clase para formateo de respuestas
import FormatResponseModel from "../utils/FormatResponseModel.js";

export default class ProfesorModel {
  /**
   * Registra un nuevo profesor en el sistema
   * @method RegisterProfesor
   * @static
   * @async
   * @param {Object} params - Parámetros de entrada
   * @param {Object} params.datos - Datos del profesor a registrar
   * @param {Object} params.usuario_accion - Información del usuario que realiza el registro
   * @returns {Promise<Object>} Objeto con el resultado de la operación
   * @throws {Error} Si ocurre un error durante el registro
   *
   * @example
   * const resultado = await ProfesorModel.RegisterProfesor({
   *   datos: {
   *     cedula: "12345678",
   *     nombres: "Juan",
   *     // ...otros campos
   *   },
   *   usuario_accion: { id: 1 }
   * });
   */
  static async RegisterProfesor({ datos, usuario_accion }) {
    try {
      // Extracción de datos del profesor
      const {
        cedula,
        nombres,
        apellidos,
        email,
        direccion,
        telefono_movil,
        telefono_local,
        fecha_nacimiento,
        genero,
        fecha_ingreso,
        dedicacion,
        categoria,
        area_de_conocimiento,
        pre_grado,
        pos_grado,
      } = datos;

      // Generación de contraseña temporal y su hash
      const password = await generarPassword();
      const passwordHash = await hashPassword(password);

      // Consulta SQL para registrar profesor usando procedimiento almacenado
      const query = `CALL public.registrar_profesor_completo(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL)`;

      // Parámetros para la consulta
      const params = [
        usuario_accion.id,
        cedula,
        nombres,
        apellidos,
        email,
        direccion,
        passwordHash,
        telefono_movil,
        telefono_local || null,
        fecha_nacimiento,
        genero,
        categoria,
        dedicacion,
        pre_grado,
        pos_grado,
        area_de_conocimiento,
        fecha_ingreso,
      ];

      // Ejecución de la consulta
      const { rows } = await db.raw(query, params);

      // Formateo de la respuesta
      const resultado = FormatResponseModel.respuestaPostgres(
        rows,
        "Profesor registrado con exito"
      );

      // Configuración del correo de bienvenida
      const Correo = {
        asunto: "Bienvenido/a al Sistema Académico - Credenciales de Acceso",
        html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2 style="color: #2c3e50;">¡Bienvenido/a, ${nombres}!</h2>
          <p>Es un placer darle la bienvenida a nuestra plataforma académica como profesor.</p>
          <p>Sus credenciales de acceso son:</p>
          <div style="background-color: #f8f9fa; padding: 15px; border-left: 4px solid #3498db; margin: 15px 0;">
            <p><strong>Usuario:</strong> ${email}</p>
            <p><strong>Contraseña temporal:</strong> ${password}</p>
          </div>
          <p><strong>Instrucciones importantes:</strong></p>
          <ul>
            <li>Cambie su contraseña después del primer acceso</li>
            <li>Esta contraseña es temporal y de uso personal</li>
            <li>Guarde esta información en un lugar seguro</li>
          </ul>
          <p>Si tiene alguna duda, contacte al departamento de soporte técnico.</p>
        </div>
        `,
      };

      // Envío de correo electrónico con las credenciales
      await enviarEmail({ Destinatario: email, Correo: Correo });

      return resultado;
    } catch (error) {
      // Manejo y formateo de errores
      throw FormatResponseModel.respuestaError(
        error,
        "Error al registrar profesor"
      );
    }
  }

  /**
   * Obtiene listado de profesores con filtros para consumo API
   * @method mostrarProfesorAPI
   * @static
   * @async
   * @param {Object} params - Parámetros de filtrado
   * @param {string} [params.dedicacion] - Filtro por dedicación
   * @param {string} [params.categoria] - Filtro por categoría
   * @param {string} [params.ubicacion] - Filtro por ubicación
   * @param {string} [params.area] - Filtro por área de conocimiento
   * @param {string} [params.fecha] - Filtro por fecha
   * @param {string} [params.genero] - Filtro por género
   * @returns {Promise<Array>} Listado de profesores filtrados
   * @throws {Error} Si ocurre un error en la consulta
   */
  static async mostrarProfesorAPI({ datos }) {
    try {
      const { dedicacion, categoria, ubicacion, area, fecha, genero } = datos;

      // Consulta a función PostgreSQL con filtros opcionales
      const result = await db.raw(
        `SELECT * FROM mostrar_profesor(?, ?, ?, ?, ?, ?) `,
        [
          dedicacion || null,
          categoria || null,
          ubicacion || null,
          area || null,
          fecha || null,
          genero || null,
        ]
      );

      return result.rows;
    } catch (error) {
      error.details = {
        path: "ProfesorModel.RegisterProfesor",
      };
      throw error;
    }
  }

  /**
   * Obtiene listado completo de profesores para visualización
   * @method mostrarProfesor
   * @static
   * @async
   * @returns {Promise<Object>} Objeto con listado de profesores y metadatos
   * @throws {Error} Si ocurre un error en la consulta
   */
  static async mostrarProfesor() {
    try {
      // Consulta a vista de profesores
      const { rows } = await db.raw(
        `SELECT * FROM profesores_informacion_completa;`
      );

      // Formateo de la respuesta
      return FormatResponseModel.respuestaPostgres(
        rows,
        "Profesor registrado con exito"
      );
    } catch (error) {
      error.details = {
        path: "ProfesorModel.RegisterProfesor",
      };
      error.details = {
        path: "ProfesorModel.mostrarProfesor",
      };
      // Manejo de errores
      throw FormatResponseModel.respuestaError(
        error,
        "Error al obtener los datos del Profesores"
      );
    }
  }

  /**
   * Busca profesores por nombre, apellido o cédula
   * @method buscarProfesor
   * @static
   * @async
   * @param {Object} params - Parámetros de búsqueda
   * @param {string} params.busqueda - Término de búsqueda
   * @returns {Promise<Object>} Resultados de la búsqueda formateados
   * @throws {Error} Si el término de búsqueda está vacío o ocurre un error
   */
  static async buscarProfesor({ datos }) {
    try {
      const { busqueda } = datos;

      // Validación de término de búsqueda
      if (busqueda === undefined || busqueda === null || busqueda === "") {
        throw {
          status: 404,
          state: "error",
          title: "Error al hacer la busqueda.",
          message: "La busqueda esta vacía.",
        };
      }

      // Consulta con búsqueda insensible a mayúsculas/minúsculas
      const { rows } = await db.raw(
        `SELECT * FROM PROFESORES_INFORMACION_COMPLETA WHERE nombres ILIKE ? OR apellidos ILIKE ? OR cedula ILIKE ?`,
        [`%${busqueda}%`, `%${busqueda}%`, `%${busqueda}%`]
      );

      // Formateo de la respuesta
      const resultado = FormatResponseModel.respuestaPostgres(
        rows,
        "Profesor encontrado con exito"
      );

      return resultado;
    } catch (error) {
      error.details = {
        path: "ProfesorModel.buscarProfesor",
      };
      throw FormatResponseModel.respuestaError(
        error,
        "Error al obtener los datos del Profesores"
      );
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
  static async mostrarPreGrados() {
    try {
      const { rows } = await db.raw(
        "SELECT id_pre_grado, nombre_pre_grado, tipo_pre_grado FROM pre_grado"
      );
      return FormatResponseModel.respuestaPostgres(
        rows,
        "Todos los Pre-Grados"
      );
    } catch (error) {
      error.details = {
        path: "ProfesorModel.mostrarPreGrados",
      };
      throw FormatResponseModel.respuestaError(
        error,
        "Error al obtener los Pre-Grados"
      );
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
  static async mostrarPosGrados() {
    try {
      const { rows } = await db.raw(
        "SELECT id_pos_grado, nombre_pos_grado, tipo_pos_grado FROM pos_grado"
      );
      return FormatResponseModel.respuestaPostgres(
        rows,
        "Todos los Pos-Grados"
      );
    } catch (error) {
      error.details = {
        path: "ProfesorModel.mostrarPosGrados",
      };
      throw FormatResponseModel.respuestaError(
        error,
        "Error al obtener los Pos-Grados"
      );
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
  static async mostrarAreasConocimiento() {
    try {
      const { rows } = await db.raw(
        "SELECT id_area_conocimiento, nombre_area_conocimiento FROM AREAS_DE_CONOCIMIENTO"
      );
      return FormatResponseModel.respuestaPostgres(
        rows,
        "Todas las areas de conocimiento"
      );
    } catch (error) {
      error.details = {
        path: "ProfesorModel.mostrarAreasConocimiento",
      };
      throw FormatResponseModel.respuestaError(
        error,
        "Error al obtener las areas de conocimiento"
      );
    }
  }

  /**
   * Registrar un Pre-Grado
   *
   * @static
   * @async
   * @method registerPreGrado
   * @param {number} usuario_accion - Id del usuario que desea realizar la acción
   * @param {Object} datos - Datos para realizar el registro del Pre-Grado
   * @param {Object} datos.tipo - Tipo de Pre-Grado para el registro.
   * @param {Object} datos.Nombre - Nombre del Pre-Grado para el registro.
   * @returns {Promise<Object>} Resultados de la búsqueda
   *
   * @throws {500} Si ocurre un error en la búsqueda
   *
   * @example
   * // Ejemplo de query params:
   * /Profesor/search?busqueda=3124460
   */
  static async registerPreGrado({ usuario_accion, datos }) {
    try {
      const { tipo, nombre } = datos;

      // Consulta SQL para registrar profesor usando procedimiento almacenado
      const query = `CALL public.registrar_pre_grado(?, ?, ?, NULL)`;

      // Parámetros para la consulta
      const params = [usuario_accion.id, nombre, tipo];

      // Ejecución de la consulta
      const { rows } = await db.raw(query, params);

      return FormatResponseModel.respuestaPostgres(
        rows,
        "Pre-grado registrado Exitosamente"
      );
    } catch (error) {
      error.details = {
        path: "ProfesorModel.registerPreGrado",
      };
      throw FormatResponseModel.respuestaError(
        error,
        "Error al registra pre-grado"
      );
    }
  }

  /**
   * Registrar un Pos-Grado
   *
   * @static
   * @async
   * @method registerPosGrado
   * @param {number} usuario_accion - Id del usuario que desea realizar la acción
   * @param {Object} datos - Datos para realizar el registro del Pos-Grado
   * @param {Object} datos.tipo - Tipo de Pos-Grado para el registro.
   * @param {Object} datos.Nombre - Nombre del Pos-Grado para el registro.
   * @returns {Promise<Object>} Resultados de la búsqueda
   *
   * @throws {500} Si ocurre un error en la búsqueda
   *
   * @example
   * // Ejemplo de query params:
   * /Profesor/search?busqueda=3124460
   */
  static async registerPosGrado({ usuario_accion, datos }) {
    try {
      const { tipo, nombre } = datos;

      // Consulta SQL para registrar profesor usando procedimiento almacenado
      const query = `CALL public.registrar_pos_grado(?, ?, ?, NULL)`;

      // Parámetros para la consulta
      const params = [usuario_accion.id, nombre, tipo];

      // Ejecución de la consulta
      const { rows } = await db.raw(query, params);

      return FormatResponseModel.respuestaPostgres(
        rows,
        "Pos-grado registrado Exitosamente"
      );
    } catch (error) {
      error.details = {
        path: "ProfesorModel.registerPosGrado",
      };
      throw FormatResponseModel.respuestaError(
        error,
        "Error al registra pos-grado"
      );
    }
  }
  /**
   * Registrar una area de conocimiento de docentes
   *
   * @static
   * @async
   * @method registerAreaConocimiento
   * @param {number} usuario_accion - Id del usuario que desea realizar la acción
   * @param {Object} datos - Datos para realizar el registro del Area de conocimiento
   * @param {Object} datos.area_conocimiento - Area de conocimiento para el registro.
   * @returns {Promise<Object>} Resultados de la búsqueda
   *
   * @throws {500} Si ocurre un error en la búsqueda
   *
   * @example
   * // Ejemplo de query params:
   * /Profesor/search?busqueda=3124460
   */
  static async registerAreaConocimiento({ usuario_accion, datos }) {
    try {
      const { area_conocimiento } = datos;

      // Consulta SQL para registrar profesor usando procedimiento almacenado
      const query = `CALL public.registrar_area_conocimiento(?, ?, NULL)`;

      // Parámetros para la consulta
      const params = [usuario_accion.id, area_conocimiento];

      // Ejecución de la consulta
      const { rows } = await db.raw(query, params);

      return FormatResponseModel.respuestaPostgres(
        rows,
        "Area de Conocimiento Registrada Exitosamente"
      );
    } catch (error) {
      error.details = {
        path: "ProfesorModel.registerAreaConocimiento",
      };
      throw FormatResponseModel.respuestaError(
        error,
        "Error al registra area de conocimiento"
      );
    }
  }
}
