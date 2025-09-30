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
import db from "../database/db.js";

// Importación de clase para formateo de respuestas
import FormatResponseModel from "../utils/FormatResponseModel.js";

//Importacion de para manejar la imagenes
import imagenProcessingServices from "../services/imagenProcessing.services.js";

//Importacion de Funcion para parsear datos a json
import { parseJSONField, loadEnv } from "../utils/utilis.js";
import FormatResponseController from "../utils/FormatResponseController.js";

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
  static async RegisterProfesor({ datos, imagen, usuario_accion }) {
    let imagenResult = null;
    const procesardorImagen = new imagenProcessingServices("profesores/");

    try {
      // 1. Validaciones iniciales
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
        municipio,
      } = datos;

      // Validar campos obligatorios
      if (!cedula || !nombres || !apellidos || !email) {
        throw new Error("Datos obligatorios faltantes");
      }

      // 2. Parsear JSON fields
      const area_de_conocimiento = parseJSONField(
        datos.area_de_conocimiento,
        "áreas de conocimiento"
      );
      const pre_grado = parseJSONField(datos.pre_grado, "pregrados");
      const pos_grado = parseJSONField(datos.pos_grado, "posgrados");

      // 3. Generar contraseña primero
      const password = await generarPassword();
      const passwordHash = await hashPassword(password);

      // 4. Procesar imagen SOLO si pasa validaciones anteriores
      const options = {
        maxSize: 5 * 1024 * 1024,
        maxWidth: 1080,
        maxHeight: 1080,
      };

      imagenResult = await procesardorImagen.processAndSaveImage(
        imagen.originalname,
        options
      );

      // 5. Llamar procedimiento almacenado (sintaxis corregida)
      const query = `CALL registrar_profesor_completo(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL)`;

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
        imagenResult.fileName,
        municipio,
        fecha_ingreso,
      ];

      const { rows } = await db.raw(query, params);

      // 6. Verificar respuesta del procedimiento
      const resultado = FormatResponseModel.respuestaPostgres(
        rows,
        "Profesor registrado con éxito"
      );

      // 7. Cargar variables de entorno para el correo
      loadEnv();

      // 8. Enviar correo (manejar error específico)
      try {
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
        <div style="display: flex; flex-direction: row; justify-content: center; align-items: center; width: 100%;">
              <a href="${process.env.ORIGIN_FRONTEND}/Inicio-session" style="display: inline-block; background-color: #1C75BA; color: white; 
                        padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-bottom: 20px;">
                  Acceder a la plataforma
              </a>
          </div>
        `,
        };

        await enviarEmail({ Destinatario: email, Correo: Correo });
      } catch (emailError) {
        console.warn("⚠️ Correo no enviado:", emailError.message);
        // No romper el flujo principal por error de correo
      }

      return resultado;
    } catch (error) {
      // 9. Limpiar imagen SI se subió y hay error de BD
      if (
        imagenResult.fileName &&
        (error.message === "El usuario ya está registrado" ||
          error.message === "El usuario ya está registrado como profesor")
      ) {
        try {
          await procesardorImagen.deleteImage(imagenResult.fileName);
        } catch (deleteError) {
          console.error(deleteError);
        }
      }

      // 11. Relanzar error formateado
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

  /**
   * Registrar disponibilidad docente
   *
   * @static
   * @async
   * @method registrarDisponibilidad
   * @param {number} usuario_accion - Id del usuario que desea realizar la acción
   * @param {Object} datos - Datos para realizar el registro de disponibilidad
   * @param {number} datos.id_profesor - ID del profesor
   * @param {string} datos.dia_semana - Día de la semana (Lunes, Martes, etc.)
   * @param {string} datos.hora_inicio - Hora de inicio (HH:MM)
   * @param {string} datos.hora_fin - Hora de fin (HH:MM)
   * @returns {Promise<Object>} Resultados del registro
   *
   * @throws {500} Si ocurre un error en el registro
   *
   * @example
   * // Ejemplo de datos:
   * {
   *   id_profesor: 1,
   *   dia_semana: "Lunes",
   *   hora_inicio: "08:00",
   *   hora_fin: "10:00"
   * }
   */
  static async registrarDisponibilidad({ usuario_accion, datos }) {
    try {
      const { id_profesor, dia_semana, hora_inicio, hora_fin } = datos;

      // Consulta SQL para registrar disponibilidad usando procedimiento almacenado
      const query = `CALL public.registrar_disponibilidad_docente_completo(?, ?, ?, ?, ?, NULL)`;

      // Parámetros para la consulta (coinciden con el procedimiento)
      const params = [
        usuario_accion.id, // p_usuario_accion
        id_profesor, // p_id_profesor
        dia_semana, // p_dia_semana
        hora_inicio, // p_hora_inicio (formato HH:MM:SS)
        hora_fin, // p_hora_fin (formato HH:MM:SS)
      ];

      console.log("Datos de disponibilidad recibidos:", params);
      console.log("Query:", query);

      // Ejecución de la consulta - usar parámetros posicionales ($1, $2, etc.)
      const result = await db.raw(query, params);
      console.log("Resultado de la consulta de disponibilidad:", result);

      return FormatResponseModel.respuestaPostgres(
        result,
        "Disponibilidad registrada exitosamente"
      );
    } catch (error) {
      error.path = "ProfesorModel.registrarDisponibilidad";
      console.log("Error al registrar disponibilidad:", error);

      throw FormatResponseModel.respuestaError(
        error,
        "Error al registrar disponibilidad docente"
      );
    }
  }

  /**
   * Actualizar información de profesor
   *
   * @static
   * @async
   * @method actualizarProfesor
   * @param {number} usuario_accion - Id del usuario que desea realizar la acción
   * @param {Object} datos - Datos para realizar la actualización del profesor
   * @param {number} datos.id_profesor - ID del profesor (cédula)
   * @param {string} [datos.nombres] - Nombres del profesor
   * @param {string} [datos.apellidos] - Apellidos del profesor
   * @param {string} [datos.email] - Email del profesor
   * @param {string} [datos.direccion] - Dirección del profesor
   * @param {string} [datos.password] - Password del profesor
   * @param {string} [datos.telefono_movil] - Teléfono móvil
   * @param {string} [datos.telefono_local] - Teléfono local
   * @param {Date} [datos.fecha_nacimiento] - Fecha de nacimiento
   * @param {string} [datos.genero] - Género (masculino/femenino)
   * @param {string} [datos.nombre_categoria] - Nombre de la categoría
   * @param {string} [datos.nombre_dedicacion] - Nombre de la dedicación
   * @param {Array} [datos.pre_grado] - Array de pre-grados
   * @param {Array} [datos.pos_grado] - Array de pos-grados
   * @param {Array} [datos.area_de_conocimiento] - Array de áreas de conocimiento
   * @param {string} [datos.imagen] - URL de la imagen
   * @param {string} [datos.municipio] - Municipio
   * @param {Date} [datos.fecha_ingreso] - Fecha de ingreso
   * @returns {Promise<Object>} Resultados de la actualización
   *
   * @throws {500} Si ocurre un error en la actualización
   *
   * @example
   * // Ejemplo de datos:
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
  static async actualizarProfesor({ usuario_accion, datos }) {
    try {
      const {
        id_profesor,
        nombres,
        apellidos,
        email,
        direccion,
        password,
        telefono_movil,
        telefono_local,
        fecha_nacimiento,
        genero,
        nombre_categoria,
        nombre_dedicacion,
        pre_grado,
        pos_grado,
        area_de_conocimiento,
        imagen,
        municipio,
        fecha_ingreso,
      } = datos;

      // Consulta SQL para actualizar profesor usando procedimiento almacenado
      const query = `
      CALL public.actualizar_profesor_completo_o_parcial(
        NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
      )
    `;

      // Parámetros para la consulta
      const params = [
        usuario_accion.id, // p_usuario_accion
        id_profesor, // p_id
        nombres || null, // p_nombres
        apellidos || null, // p_apellidos
        email || null, // p_email
        direccion || null, // p_direccion
        password || null, // p_password
        telefono_movil || null, // p_telefono_movil
        telefono_local || null, // p_telefono_local
        fecha_nacimiento || null, // p_fecha_nacimiento
        genero || null, // p_genero
        nombre_categoria || null, // p_nombre_categoria
        nombre_dedicacion || null, // p_nombre_dedicacion
        pre_grado ? JSON.stringify(pre_grado) : null, // p_pre_grado
        pos_grado ? JSON.stringify(pos_grado) : null, // p_pos_grado
        area_de_conocimiento ? JSON.stringify(area_de_conocimiento) : null, // p_area_de_conocimiento
        imagen || null, // p_imagen
        municipio || null, // p_municipio
        fecha_ingreso || null, // p_fecha_ingreso
      ];

      // Ejecución de la consulta
      const { rows } = await db.raw(query, params);

      return FormatResponseModel.respuestaPostgres(
        rows,
        "Se actualizo exitosamente al profesor"
      );
    } catch (error) {
      error.details = {
        path: "ProfesorModel.actualizarProfesor",
        originalError: error.message,
      };

      throw FormatResponseModel.respuestaError(
        error,
        "Error al actualizar profesor"
      );
    }
  }

  /**
   * Destituir/eliminar un profesor
   *
   * @static
   * @async
   * @method destituirProfesor
   * @param {number} usuario_accion - ID del usuario que realiza la acción
   * @param {Object} datos - Datos para la destitución
   * @param {number} datos.id_profesor - ID del profesor (cédula)
   * @param {string} datos.tipo_accion - Tipo de acción: DESTITUCION, ELIMINACION, RENUNCIA, RETIRO
   * @param {string} datos.razon - Razón de la destitución
   * @param {string} [datos.observaciones] - Observaciones adicionales
   * @param {Date} [datos.fecha_efectiva] - Fecha efectiva de la destitución
   * @returns {Promise<Object>} Resultado de la operación
   *
   * @throws {500} Si ocurre un error en el proceso
   */
  static async destituirProfesor({ usuario_accion, datos }) {
    try {
      const { id_profesor, tipo_accion, razon, observaciones, fecha_efectiva } =
        datos;

      // Consulta SQL para llamar al procedimiento almacenado
      const query = `
        CALL public.eliminar_destituir_profesor(
          NULL, ?, ?, ?, ?, ?, ?
        )
      `;

      // Parámetros para la consulta
      const params = [
        usuario_accion.id, // p_usuario_accion
        id_profesor, // p_id_profesor
        tipo_accion, // p_tipo_accion
        razon, // p_razon
        observaciones || null, // p_observaciones
        fecha_efectiva || null, // p_fecha_efectiva
      ];

      console.log("Ejecutando destitución con parámetros:", params);

      // Ejecución de la consulta
      const { rows } = await db.raw(query, params);

      return FormatResponseModel.respuestaPostgres(
        rows,
        "Destitucion del profesor exitosa."
      );
    } catch (error) {
      console.error("Error en DestitucionModel.destituirProfesor:", error);

      throw FormatResponseModel.respuestaError(
        error,
        "Error al destituir al profesor"
      );
    }
  }
}
