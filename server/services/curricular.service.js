import ValidationService from "./validation.service.js";
import CurricularModel from "../models/curricular.model.js";
import FormatterResponseService from "../utils/FormatterResponseService.js";
import NotificationService from "./notification.service.js";

/**
 * @class CurricularService
 * @description Servicio para operaciones de negocio relacionadas con:
 * - Programas Nacionales de Formación (PNF)
 * - Unidades Curriculares
 * - Trayectos académicos
 * - Secciones
 */
export default class CurricularService {
  /**
   * @static
   * @async
   * @method registrarPNF
   * @description Registrar un nuevo Programa Nacional de Formación (PNF)
   * @param {Object} datos - Datos del PNF
   * @param {Object} user_action - Usuario que realiza la acción
   * @returns {Object} Resultado de la operación
   */
  static async registrarPNF(datos, user_action) {
    try {
      console.log("🔍 [registrarPNF] Iniciando registro de PNF...");

      if (process.env.MODE === "DEVELOPMENT") {
        console.log("📝 Datos recibidos:", {
          datos: JSON.stringify(datos, null, 2),
          user_action: user_action,
        });
      }

      // 1. Validar datos del PNF
      console.log("✅ Validando datos del PNF...");
      const validation = ValidationService.validatePNF(datos);

      if (!validation.isValid) {
        console.error("❌ Validación de datos fallida:", validation.errors);
        return FormatterResponseService.validationError(
          validation.errors,
          "Error de validación en registro de PNF"
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

      // 3. Crear PNF en el modelo
      console.log("🎓 Creando PNF en base de datos...");
      const respuestaModel = await CurricularModel.crearPNF(
        datos,
        user_action.id
      );

      // Verificar si la respuesta del modelo indica error
      if (respuestaModel.state === "error" || respuestaModel.status >= 400) {
        console.error("❌ Error en modelo crear PNF:", respuestaModel);

        return FormatterResponseService.error(
          respuestaModel.title || "Error en base de datos",
          respuestaModel.message || "Error al crear el PNF",
          respuestaModel.status || 500,
          respuestaModel.code || "DB_ERROR",
          {
            originalError:
              process.env.MODE === "DEVELOPMENT" ? respuestaModel : undefined,
          }
        );
      }

      // 4. Enviar notificación
      console.log("🔔 Enviando notificaciones...");
      const notificationService = new NotificationService();
      await notificationService.crearNotificacionMasiva({
        titulo: "Nuevo PNF Registrado",
        tipo: "pnf_creado",
        contenido: `Se ha registrado el PNF ${datos.nombrePNF} en el sistema`,
        metadatos: {
          pnf_nombre: datos.nombrePNF,
          pnf_codigo: datos.codigoPNF,
          usuario_creador: user_action.id,
          fecha_registro: new Date().toISOString(),
        },
        roles_ids: [3, 4, 20], // Administradores y coordinadores
        users_ids: [user_action.id],
      });

      console.log("🎉 PNF registrado exitosamente");

      return FormatterResponseService.success(
        {
          message: "PNF creado exitosamente",
          pnf: {
            id: respuestaModel.data?.id_pnf || respuestaModel.data?.id,
            nombre: datos.nombrePNF,
            codigo: datos.codigoPNF,
            descripcion: datos.descripcionPNF,
            estado: "activo",
          },
        },
        "PNF registrado exitosamente",
        {
          status: 201,
          title: "PNF Creado",
        }
      );
    } catch (error) {
      console.error("💥 Error en servicio registrar PNF:", error);

      // Si es un error conocido del modelo, convertirlo a respuesta del servicio
      if (error.state === "error" || error.status >= 400) {
        return FormatterResponseService.error(
          error.title || "Error en base de datos",
          error.message || "Error al crear el PNF",
          error.status || 500,
          error.code || "DB_ERROR",
          {
            originalError:
              process.env.MODE === "DEVELOPMENT" ? error : undefined,
          }
        );
      }

      throw error;
    }
  }

  /**
   * @static
   * @async
   * @method registrarUnidadCurricular
   * @description Registrar una nueva Unidad Curricular
   * @param {Object} datos - Datos de la unidad curricular
   * @param {Object} user_action - Usuario que realiza la acción
   * @returns {Object} Resultado de la operación
   */
  static async registrarUnidadCurricular(datos, user_action) {
    try {
      console.log(
        "🔍 [registrarUnidadCurricular] Iniciando registro de unidad curricular..."
      );

      if (process.env.MODE === "DEVELOPMENT") {
        console.log("📝 Datos recibidos:", {
          datos: JSON.stringify(datos, null, 2),
          user_action: user_action,
        });
      }

      // 1. Validar datos de la unidad curricular
      console.log("✅ Validando datos de la unidad curricular...");
      const validation = ValidationService.validateUnidadCurricular(datos);

      if (!validation.isValid) {
        console.error("❌ Validación de datos fallida:", validation.errors);
        return FormatterResponseService.validationError(
          validation.errors,
          "Error de validación en registro de unidad curricular"
        );
      }

      // 2. Validar ID de usuario
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

      // 3. Crear unidad curricular en el modelo
      console.log("📚 Creando unidad curricular en base de datos...");
      const respuestaModel = await CurricularModel.registrarUnidadCurricular(
        datos,
        user_action.id
      );

      if (FormatterResponseService.isError(respuestaModel)) {
        console.error(
          "❌ Error en modelo crear unidad curricular:",
          respuestaModel
        );
        return respuestaModel;
      }

      // 4. Enviar notificación
      console.log("🔔 Enviando notificaciones...");
      const notificationService = new NotificationService();
      await notificationService.crearNotificacionMasiva({
        titulo: "Nueva Unidad Curricular Registrada",
        tipo: "unidad_curricular_creada",
        contenido: `Se ha registrado la unidad curricular ${datos.nombreUnidadCurricular}`,
        metadatos: {
          unidad_curricular_nombre: datos.nombreUnidadCurricular,
          unidad_curricular_codigo: datos.codigoUnidadCurricular,
          trayecto: datos.idTrayecto,
          usuario_creador: user_action.id,
          fecha_registro: new Date().toISOString(),
        },
        roles_ids: [3, 4, 20],
        users_ids: [user_action.id],
      });

      console.log("🎉 Unidad curricular registrada exitosamente");

      return FormatterResponseService.success(
        {
          message: "Unidad curricular creada exitosamente",
          unidad_curricular: {
            id:
              respuestaModel.data?.id_unidad_curricular ||
              respuestaModel.data?.id,
            nombre: datos.nombreUnidadCurricular,
            codigo: datos.codigoUnidadCurricular,
            trayecto_id: datos.idTrayecto,
            creditos: datos.creditos,
            horas: datos.horasAcademicas,
          },
        },
        "Unidad curricular registrada exitosamente",
        {
          status: 201,
          title: "Unidad Curricular Creada",
        }
      );
    } catch (error) {
      console.error("💥 Error en servicio registrar unidad curricular:", error);
      throw error;
    }
  }

  /**
   * @static
   * @async
   * @method mostrarPNF
   * @description Obtener todos los Programas Nacionales de Formación registrados
   * @returns {Object} Resultado de la operación
   */
  static async mostrarPNF() {
    try {
      console.log("🔍 [mostrarPNF] Obteniendo listado de PNF...");

      const respuestaModel = await CurricularModel.mostrarPNF();

      if (FormatterResponseService.isError(respuestaModel)) {
        console.error("❌ Error en modelo obtener PNF:", respuestaModel);
        return respuestaModel;
      }

      console.log(`✅ Se obtuvieron ${respuestaModel.data?.length || 0} PNF`);

      return FormatterResponseService.success(
        {
          pnf: respuestaModel.data,
          total: respuestaModel.data?.length || 0,
        },
        "PNF obtenidos exitosamente",
        {
          status: 200,
          title: "Lista de PNF",
        }
      );
    } catch (error) {
      console.error("💥 Error en servicio mostrar PNF:", error);
      throw error;
    }
  }

  /**
   * @static
   * @async
   * @method mostrarTrayectos
   * @description Obtener todos los trayectos académicos registrados
   * @param {string} codigoPNF - Filtro por PNF (opcional)
   * @returns {Object} Resultado de la operación
   */
  static async mostrarTrayectos(codigoPNF = null) {
    try {
      console.log("🔍 [mostrarTrayectos] Obteniendo listado de trayectos...", {
        pnf_filtro: codigoPNF,
      });

      const respuestaModel = await CurricularModel.mostrarTrayectos(codigoPNF);

      if (FormatterResponseService.isError(respuestaModel)) {
        console.error("❌ Error en modelo obtener trayectos:", respuestaModel);
        return respuestaModel;
      }

      console.log(
        `✅ Se obtuvieron ${respuestaModel.data?.length || 0} trayectos`
      );

      return FormatterResponseService.success(
        {
          trayectos: respuestaModel.data,
          total: respuestaModel.data?.length || 0,
          ...(codigoPNF && { codigoPNF_filtrado: codigoPNF }),
        },
        "Trayectos obtenidos exitosamente",
        {
          status: 200,
          title: "Lista de Trayectos",
        }
      );
    } catch (error) {
      console.error("💥 Error en servicio mostrar trayectos:", error);
      throw error;
    }
  }

  /**
   * @static
   * @async
   * @method mostrarUnidadesCurriculares
   * @description Obtener todas las unidades curriculares de un trayecto
   * @param {number} trayecto - ID del trayecto (opcional)
   * @returns {Object} Resultado de la operación
   */
  static async mostrarUnidadesCurriculares(trayecto = null) {
    try {
      console.log(
        "🔍 [mostrarUnidadesCurriculares] Obteniendo unidades curriculares...",
        {
          trayecto_filtro: trayecto,
        }
      );

      // Validar trayecto si se proporciona
      if (trayecto !== null) {
        const trayectoValidation = ValidationService.validateId(
          trayecto,
          "trayecto"
        );
        if (!trayectoValidation.isValid) {
          console.error(
            "❌ Validación de trayecto fallida:",
            trayectoValidation.errors
          );
          return FormatterResponseService.validationError(
            trayectoValidation.errors,
            "ID de trayecto inválido"
          );
        }
      }

      const respuestaModel = await CurricularModel.mostrarUnidadesCurriculares(
        trayecto
      );

      if (FormatterResponseService.isError(respuestaModel)) {
        console.error(
          "❌ Error en modelo obtener unidades curriculares:",
          respuestaModel
        );
        return respuestaModel;
      }

      console.log(
        `✅ Se obtuvieron ${
          respuestaModel.data?.length || 0
        } unidades curriculares`
      );

      return FormatterResponseService.success(
        {
          unidades_curriculares: respuestaModel.data,
          total: respuestaModel.data?.length || 0,
          ...(trayecto && { trayecto_filtrado: trayecto }),
        },
        "Unidades curriculares obtenidas exitosamente",
        {
          status: 200,
          title: "Lista de Unidades Curriculares",
        }
      );
    } catch (error) {
      console.error(
        "💥 Error en servicio mostrar unidades curriculares:",
        error
      );
      throw error;
    }
  }

  /**
   * @static
   * @async
   * @method mostrarSecciones
   * @description Obtener todas las secciones de un trayecto
   * @param {number} trayecto - ID del trayecto (opcional)
   * @returns {Object} Resultado de la operación
   */
  static async mostrarSecciones(trayecto = null) {
    try {
      console.log("🔍 [mostrarSecciones] Obteniendo secciones...", {
        trayecto_filtro: trayecto,
      });

      // Validar trayecto si se proporciona
      if (trayecto !== null) {
        const trayectoValidation = ValidationService.validateId(
          trayecto,
          "trayecto"
        );
        if (!trayectoValidation.isValid) {
          console.error(
            "❌ Validación de trayecto fallida:",
            trayectoValidation.errors
          );
          return FormatterResponseService.validationError(
            trayectoValidation.errors,
            "ID de trayecto inválido"
          );
        }
      }

      const respuestaModel = await CurricularModel.mostrarSecciones(trayecto);

      if (FormatterResponseService.isError(respuestaModel)) {
        console.error("❌ Error en modelo obtener secciones:", respuestaModel);
        return respuestaModel;
      }

      console.log(
        `✅ Se obtuvieron ${respuestaModel.data?.length || 0} secciones`
      );

      return FormatterResponseService.success(
        {
          secciones: respuestaModel.data,
          total: respuestaModel.data?.length || 0,
          ...(trayecto && { trayecto_filtrado: trayecto }),
        },
        "Secciones obtenidas exitosamente",
        {
          status: 200,
          title: "Lista de Secciones",
        }
      );
    } catch (error) {
      console.error("💥 Error en servicio mostrar secciones:", error);
      throw error;
    }
  }

  /**
   * @static
   * @async
   * @method crearSecciones
   * @description Crear secciones para un trayecto de forma automática
   * @param {number} idTrayecto - ID del trayecto
   * @param {Object} datos - Datos para la creación de secciones
   * @param {Object} user_action - Usuario que realiza la acción
   * @returns {Object} Resultado de la operación
   */
  static async crearSecciones(idTrayecto, datos, user_action) {
    try {
      console.log(
        "🔍 [crearSecciones] Creando secciones para trayecto:",
        idTrayecto
      );

      if (process.env.MODE === "DEVELOPMENT") {
        console.log("📝 Datos recibidos:", {
          idTrayecto,
          datos: JSON.stringify(datos, null, 2),
          user_action: user_action,
        });
      }

      // 1. Validar ID del trayecto
      const trayectoValidation = ValidationService.validateId(
        idTrayecto,
        "trayecto"
      );
      if (!trayectoValidation.isValid) {
        console.error(
          "❌ Validación de trayecto fallida:",
          trayectoValidation.errors
        );
        return FormatterResponseService.validationError(
          trayectoValidation.errors,
          "ID de trayecto inválido"
        );
      }

      // 2. Validar ID de usuario
      const usuarioValidation = ValidationService.validateId(
        user_action.id,
        "usuario"
      );
      if (!usuarioValidation.isValid) {
        console.error(
          "❌ Validación de usuario fallida:",
          usuarioValidation.errors
        );
        return FormatterResponseService.validationError(
          usuarioValidation.errors,
          "ID de usuario inválido"
        );
      }

      // 3. Validar datos para creación de secciones
      const validation = ValidationService.validateCreacionSecciones(datos);
      if (!validation.isValid) {
        console.error("❌ Validación de datos fallida:", validation.errors);
        return FormatterResponseService.validationError(
          validation.errors,
          "Error de validación en creación de secciones"
        );
      }

      // 4. Crear secciones en el modelo
      console.log("📋 Creando secciones en base de datos...");
      const respuestaModel = await CurricularModel.CrearSecciones(
        idTrayecto,
        datos,
        user_action.id
      );

      if (FormatterResponseService.isError(respuestaModel)) {
        console.error("❌ Error en modelo crear secciones:", respuestaModel);
        return respuestaModel;
      }

      // 5. Enviar notificación
      console.log("🔔 Enviando notificaciones...");
      const notificationService = new NotificationService();
      await notificationService.crearNotificacionMasiva({
        titulo: "Secciones Creadas",
        tipo: "secciones_creadas",
        contenido: `Se han creado ${
          datos.cantidadSecciones || "varias"
        } secciones para el trayecto ${idTrayecto}`,
        metadatos: {
          trayecto_id: idTrayecto,
          cantidad_secciones: datos.cantidadSecciones,
          turno: datos.turno,
          usuario_creador: user_action.id,
          fecha_creacion: new Date().toISOString(),
        },
        roles_ids: [3, 4, 20],
        users_ids: [user_action.id],
      });

      console.log("🎉 Secciones creadas exitosamente");

      return FormatterResponseService.success(
        {
          message: "Secciones creadas exitosamente",
          trayecto_id: idTrayecto,
          secciones_creadas: respuestaModel.data || [],
          total_creadas: respuestaModel.data?.length || 0,
        },
        "Secciones creadas exitosamente",
        {
          status: 201,
          title: "Secciones Creadas",
        }
      );
    } catch (error) {
      console.error("💥 Error en servicio crear secciones:", error);
      throw error;
    }
  }

  /**
   * @static
   * @async
   * @method asignarTurnoSeccion
   * @description Asignar un turno a una sección específica
   * @param {number} idSeccion - Id de la seccion
   * @param {Object} datos - Datos para la asignación de turno
   * @param {Object} user_action - Usuario que realiza la acción
   * @returns {Object} Resultado de la operación
   */
  static async asignarTurnoSeccion(idSeccion, datos, user_action) {
    try {
      console.log("🔍 [asignarTurnoSeccion] Asignando turno a sección...");

      // 1. Validar ID de usuario
      const turnoValidation = ValidationService.validateId(
        parseInt(datos.idTurno),
        "Id de Turno"
      );
      if (!turnoValidation.isValid) {
        console.error(
          "❌ Validación de usuario fallida:",
          turnoValidation.errors
        );
        return FormatterResponseService.validationError(
          turnoValidation.errors,
          "ID de usuario inválido"
        );
      }

      // 2. Validar ID de usuario
      const seccionValidacion = ValidationService.validateId(
        parseInt(idSeccion),
        "Id de Sección"
      );
      if (!seccionValidacion.isValid) {
        console.error(
          "❌ Validación de usuario fallida:",
          seccionValidacion.errors
        );
        return FormatterResponseService.validationError(
          seccionValidacion.errors,
          "ID de usuario inválido"
        );
      }

      // 3. Validar ID de usuario
      const usuarioValidation = ValidationService.validateId(
        user_action.id,
        "usuario"
      );
      if (!usuarioValidation.isValid) {
        console.error(
          "❌ Validación de usuario fallida:",
          usuarioValidation.errors
        );
        return FormatterResponseService.validationError(
          usuarioValidation.errors,
          "ID de usuario inválido"
        );
      }

      // 3. Asignar turno en el modelo
      console.log("⏰ Asignando turno en base de datos...");
      const respuestaModel = await CurricularModel.asignacionTurnoSeccion(
        idSeccion,
        datos.idTurno,
        user_action
      );

      if (FormatterResponseService.isError(respuestaModel)) {
        console.error("❌ Error en modelo asignar turno:", respuestaModel);
        return respuestaModel;
      }

      // 4. Enviar notificación
      console.log("🔔 Enviando notificaciones...");
      const notificationService = new NotificationService();
      await notificationService.crearNotificacionMasiva({
        titulo: "Turno Asignado a Sección",
        tipo: "turno_asignado",
        contenido: `Se ha asignado un turno a la sección ${datos.idSeccion}`,
        metadatos: {
          seccion_id: datos.idSeccion,
          turno_id: datos.idTurno,
          usuario_asignador: user_action.id,
          fecha_asignacion: new Date().toISOString(),
        },
        roles_ids: [3, 4, 20],
        users_ids: [user_action.id],
      });

      console.log("🎉 Turno asignado exitosamente");

      return FormatterResponseService.success(
        {
          message: "Turno asignado exitosamente",
          asignacion: {
            seccion_id: datos.idSeccion,
            turno_id: datos.idTurno,
            seccion_nombre: respuestaModel.data?.seccion_nombre,
            turno_nombre: respuestaModel.data?.turno_nombre,
          },
        },
        "Turno asignado exitosamente",
        {
          status: 200,
          title: "Turno Asignado",
        }
      );
    } catch (error) {
      console.error("💥 Error en servicio asignar turno:", error);
      throw error;
    }
  }
}
