import ValidationService from "./validation.service.js";
import NotificationService from "./notification.service.js";
import AulaModel from "../models/aulas.model.js";
import FormatterResponseService from "../utils/FormatterResponseService.js";
import { loadEnv } from "../utils/utilis.js";

loadEnv();

/**
 * @class AulaService
 * @description Servicio para operaciones de negocio relacionadas con aulas
 */
export default class AulaService {
  /**
   * @static
   * @async
   * @method registrarAula
   * @description Registrar una nueva aula con validación y notificación
   * @param {Object} datos - Datos del aula a registrar
   * @param {object} user_action - Usuario que realiza la acción
   * @param {Object} notification_messages - Mensajes para la notificación
   * @param {string} notification_messages.title - Título de la notificación
   * @param {string} notification_messages.body - Cuerpo de la notificación
   * @returns {Object} Resultado de la operación
   */
  static async registrarAula(datos, user_action) {
    try {
      if (process.env.MODE === "DEVELOPMENT") {
        console.log("📝 Datos recibidos:", {
          datos: JSON.stringify(datos, null, 2),
          user_action: user_action,
        });
      }

      // 1. Validar datos del aula
      const validation = ValidationService.validateAula(datos, {});

      if (!validation.isValid) {
        console.error("❌ Validación de datos fallida:", validation.errors);
        return FormatterResponseService.validationError(
          validation.errors,
          "aulas:validation.data_valid"
        );
      }

      // 2. Validar ID de usuario
      const idValidation = ValidationService.validateId(
        user_action.id,
        "general:validation.id_invalid"
      );

      if (!idValidation.isValid) {
        console.error("❌ Validación de ID fallida:", idValidation.errors);
        return FormatterResponseService.validationError(idValidation.errors);
      }

      // 4. Crear aula en el modelo
      const respuestaModel = await AulaModel.crear(datos, user_action.id);

      if (FormatterResponseService.isError(respuestaModel)) {
        return respuestaModel;
      }

      if (process.env.MODE === "DEVELOPMENT") {
        console.log("📊 Respuesta del modelo:", respuestaModel);
      }

      const busquedaAula = await this.obtenerAulaPorId(respuestaModel.data.id_aula);
      const aula = busquedaAula.data.aula

      // 5. Enviar notificación específica para gestión de infraestructura
      const notificationService = new NotificationService();
      await notificationService.crearNotificacionMasiva({
        tipo: "aula_creada",
        titulo: "aulas:notifications.aula_created_title",
        contenido: "aulas:notifications.aula_created_body",
        metadatos: {
          id_aula: aula.id_aula,
          aula_codigo: aula.codigo_aula,
          aula_tipo: aula.tipo_aula,
          aula_capacidad: aula.capacidad_aula,
          aula_sede: aula.nombre_sede,
          usuario_creador: user_action.id,
          fecha_registro: new Date().toISOString(),
          url_action: `/infraestructura/sedes/${datos.id_sede}/aulas/${aula.id_aula}`,
        },
        roles_ids: [2, 7, 8, 9, 10, 20], // Coordinador, Directores, Vicerrectoría, SuperAdmin
        users_ids: [user_action.id], // Usuario que creó el aula
      });

      return FormatterResponseService.success(
        {
          aula: {
            id: aula.id_aula || aula.codigo_aula,
            codigo: aula.codigo_aula,
            tipo: aula.tipo_aula,
            capacidad: aula.capacidad_aula,
            sede: aula.nombre_sede,
          },
        },
        respuestaModel.message,
        respuestaModel.title,
        {
          status: 201,
          title: "Aula Creada",
        }
      );
    } catch (error) {
      console.error("💥 Error en servicio registrar aula:", error);
      throw error;
    }
  }

  /**
   * @static
   * @async
   * @method mostrarAulas
   * @description Obtener todas las aulas con validación de parámetros
   * @param {Object} queryParams - Parámetros de consulta (opcional)
   * @returns {Object} Resultado de la operación
   */
  static async mostrarAulas(queryParams = {}) {
    try {
      console.log("📋 Obteniendo lista de aulas...");

      if (process.env.MODE === "DEVELOPMENT") {
        console.log("🔍 Parámetros de consulta:", queryParams);
      }

      // 1. Validar parámetros de consulta
      console.log("Validando parámetros de consulta...");
      const allowedParams = ["page", "limit", "sort", "order", "sede", "tipo"];
      const queryValidation = ValidationService.validateQueryParams(
        queryParams,
        allowedParams
      );

      if (!queryValidation.isValid) {
        console.error(
          "❌ Validación de parámetros fallida:",
          queryValidation.errors
        );
        return FormatterResponseService.validationError(queryValidation.errors);
      }

      // 2. Obtener aulas del modelo
      console.log("Obteniendo aulas de base de datos...");
      const respuestaModel = await AulaModel.obtenerTodas(queryParams);

      if (FormatterResponseService.isError(respuestaModel)) {
        return respuestaModel;
      }

      if (process.env.MODE === "DEVELOPMENT") {
        console.log("📊 Respuesta del modelo:", respuestaModel);
      }

      console.log(`✅ Se obtuvieron ${respuestaModel.data.length} aulas`);
      return FormatterResponseService.success(
        {
          aulas: respuestaModel.data,
          total: respuestaModel.data.length,
          page: parseInt(queryParams.page) || 1,
          limit: parseInt(queryParams.limit) || respuestaModel.data.length,
        },
        "aulas:success.obtained_successfully",
        "aulas:titles.list_obtained",
        {
          status: 200,
        }
      );
    } catch (error) {
      console.error("💥 Error en servicio mostrar aulas:", error);
      throw error;
    }
  }

  /**
   * @static
   * @async
   * @method obtenerAulaPorId
   * @description Obtener una aula específica por ID con validación
   * @param {number} id_aula - ID del aula a buscar
   * @returns {Object} Resultado de la operación
   */
  static async obtenerAulaPorId(id_aula) {
    try {
      console.log(`🔍 Buscando aula con ID: ${id_aula}`);

      // 1. Validar ID del aula
      console.log("Validando ID del aula...");
      const idValidation = ValidationService.validateId(id_aula, "aula");
      if (!idValidation.isValid) {
        console.error("❌ Validación de ID fallida:", idValidation.errors);
        return FormatterResponseService.validationError(idValidation.errors);
      }

      // 2. Buscar aula en el modelo
      console.log("Buscando aula en base de datos...");
      const respuestaModel = await AulaModel.buscarPorId(id_aula);

      if (FormatterResponseService.isError(respuestaModel)) {
        return respuestaModel;
      }

      if (!respuestaModel.data || respuestaModel.data.length === 0) {
        console.error(`❌ Aula con ID ${id_aula} no encontrada`);
        return FormatterResponseService.notFound(id_aula);
      }

      const aula = respuestaModel.data[0];

      if (process.env.MODE === "DEVELOPMENT") {
        console.log("📊 Aula encontrada:", aula);
      }

      console.log(`✅ Aula encontrada: ${aula}`);
      return FormatterResponseService.success(
        {
          aula: aula,
        },
        "aulas:success.obtained_successfully",
        "aulas:titles.details_obtained",
        {
          status: 200,
        }
      );
    } catch (error) {
      console.error("💥 Error en servicio obtener aula por ID:", error);
      throw error;
    }
  }

  /**
   * @static
   * @async
   * @method actualizarAula
   * @description Actualizar una aula existente con validación y notificación
   * @param {number} id_aula - ID del aula a actualizar
   * @param {Object} datos - Datos actualizados del aula
   * @param {object} user_action - Usuario que realiza la acción
   * @returns {Object} Resultado de la operación
   */
  static async actualizarAula(id_aula, datos, user_action) {
    try {
      console.log(`🔄 Actualizando aula con ID: ${id_aula}`);
      console.log("📝 Datos a actualizar:", datos);

      if (process.env.MODE === "DEVELOPMENT") {
        console.log("👤 Usuario ejecutor:", user_action);
      }

      // 1. Validar ID del aula
      console.log("Validando ID del aula...");
      const idValidation = ValidationService.validateId(id_aula, "aula");
      if (!idValidation.isValid) {
        console.error("❌ Validación de ID fallida:", idValidation.errors);
        return FormatterResponseService.validationError(idValidation.errors);
      }

      // 2. Validar datos parciales del aula
      console.log("Validando datos del aula...");
      const validation = ValidationService.validatePartialAula(datos);
      if (!validation.isValid) {
        console.error("❌ Validación de datos fallida:", validation.errors);
        return FormatterResponseService.validationError(validation.errors);
      }

      // 3. Validar ID de usuario
      console.log("Validando ID de usuario...");
      const userValidation = ValidationService.validateId(
        user_action.id,
        "usuario"
      );
      if (!userValidation.isValid) {
        console.error(
          "❌ Validación de usuario fallida:",
          userValidation.errors
        );
        return FormatterResponseService.validationError(userValidation.errors);
      }

      // 4. Verificar que el aula existe
      console.log("Verificando existencia del aula...");
      const aulaExistente = await AulaModel.buscarPorId(id_aula);
      if (
        FormatterResponseService.isError(aulaExistente) ||
        !aulaExistente.data ||
        aulaExistente.data.length === 0
      ) {
        console.error(`❌ Aula con ID ${id_aula} no encontrada`);
        return FormatterResponseService.notFound(id_aula);
      }

      const aulaActual = aulaExistente.data[0];

      // 5. Verificar duplicados si se está actualizando código o nombre
      console.log("Verificando duplicados...");
      if (datos.codigo || datos.nombre) {
        const aulasExistentes = await AulaModel.obtenerTodas();
        const aulaDuplicada = aulasExistentes.data.find(
          (aula) =>
            aula.id_aula !== id_aula &&
            (aula.codigo === (datos.codigo || aulaActual.codigo) ||
              aula.nombre === (datos.nombre || aulaActual.nombre))
        );

        if (aulaDuplicada) {
          console.error("❌ Aula duplicada encontrada:", aulaDuplicada);
          return FormatterResponseService.error(409, "AULA_DUPLICADA", {
            aula_existente: {
              id: aulaDuplicada.id_aula,
              codigo: aulaDuplicada.codigo,
              nombre: aulaDuplicada.nombre,
            },
          });
        }
      }

      // 6. Actualizar aula
      console.log("Actualizando aula en base de datos...");
      const respuestaModel = await AulaModel.actualizar(
        id_aula,
        datos,
        user_action.id
      );

      if (FormatterResponseService.isError(respuestaModel)) {
        return respuestaModel;
      }

      if (process.env.MODE === "DEVELOPMENT") {
        console.log("📊 Respuesta del modelo:", respuestaModel);
      }

      // 7. Enviar notificación específica para gestión de infraestructura
      console.log("Enviando notificaciones...");
      const notificationService = new NotificationService();
      await notificationService.crearNotificacionMasiva({
        tipo: "aula_actualizada",
        titulo: "Aula Actualizada",
        contenido: `Se han realizado cambios en el aula ${
          datos.codigo || aulaActual.codigo
        }`,
        metadatos: {
          aula_id: id_aula,
          aula_codigo: datos.codigo || aulaActual.codigo,
          aula_nombre: datos.nombre || aulaActual.nombre,
          aula_sede: datos.sede || aulaActual.sede,
          campos_actualizados: Object.keys(datos),
          usuario_actualizador: user_action.id,
          fecha_actualizacion: new Date().toISOString(),
          url_action: `/infraestructura/aulas/${id_aula}`,
        },
        roles_ids: [2, 7, 8, 9, 10, 20], // Coordinador, Directores, Vicerrectoría, SuperAdmin
        users_ids: [user_action.id], // Usuario que actualizó el aula
      });

      console.log(`✅ Aula ${id_aula} actualizada exitosamente`);
      return FormatterResponseService.success(
        {
          aula_id: id_aula,
          cambios: Object.keys(datos),
          aula_actualizada: {
            id: id_aula,
            codigo: datos.codigo || aulaActual.codigo,
            nombre: datos.nombre || aulaActual.nombre,
            tipo: datos.tipo || aulaActual.tipo,
            capacidad: datos.capacidad || aulaActual.capacidad,
            sede: datos.sede || aulaActual.sede,
          },
        },
        "aulas:success.updated_successfully",
        "aulas:titles.updated_successfully",
        {
          status: 200,
        }
      );
    } catch (error) {
      console.error("💥 Error en servicio actualizar aula:", error);
      throw error;
    }
  }

  /**
   * @static
   * @async
   * @method eliminarAula
   * @description Eliminar una aula con validación y notificación
   * @param {number} id_aula - ID del aula a eliminar
   * @param {object} user_action - Usuario que realiza la acción
   * @returns {Object} Resultado de la operación
   */
  static async eliminarAula(id_aula, user_action) {
    try {
      console.log(`🗑️ Eliminando aula con ID: ${id_aula}`);

      if (process.env.MODE === "DEVELOPMENT") {
        console.log("👤 Usuario ejecutor:", user_action);
      }

      // 1. Validar ID del aula
      console.log("Validando ID del aula...");
      const idValidation = ValidationService.validateId(id_aula, "aula");
      if (!idValidation.isValid) {
        console.error("❌ Validación de ID fallida:", idValidation.errors);
        return FormatterResponseService.validationError(idValidation.errors);
      }

      // 2. Validar ID de usuario
      console.log("Validando ID de usuario...");
      const userValidation = ValidationService.validateId(
        user_action.id,
        "usuario"
      );
      if (!userValidation.isValid) {
        console.error(
          "❌ Validación de usuario fallida:",
          userValidation.errors
        );
        return FormatterResponseService.validationError(userValidation.errors);
      }

      // 3. Verificar que el aula existe
      console.log("Verificando existencia del aula...");
      const aulaExistente = await AulaModel.buscarPorId(id_aula);
      if (
        FormatterResponseService.isError(aulaExistente) ||
        !aulaExistente.data ||
        aulaExistente.data.length === 0
      ) {
        console.error(`❌ Aula con ID ${id_aula} no encontrada`);
        return FormatterResponseService.notFound(id_aula);
      }

      const aula = aulaExistente.data[0];

      // 4. Verificar si el aula está siendo utilizada en horarios futuros
      console.log("Verificando uso del aula en horarios...");
      const tieneHorariosFuturos = await AulaModel.verificarHorariosFuturos(
        id_aula
      );
      if (tieneHorariosFuturos) {
        console.error(`❌ Aula ${id_aula} está en uso en horarios futuros`);
        return FormatterResponseService.error(409, "AULA_EN_USO", {
          aula_id: id_aula,
          aula_nombre: aula.nombre,
          accion_recomendada: "Reasignar o cancelar los horarios primero",
        });
      }

      // 5. Eliminar aula
      console.log("Eliminando aula de base de datos...");
      const respuestaModel = await AulaModel.eliminar(id_aula, user_action.id);

      if (FormatterResponseService.isError(respuestaModel)) {
        return respuestaModel;
      }

      if (process.env.MODE === "DEVELOPMENT") {
        console.log("📊 Respuesta del modelo:", respuestaModel);
      }

      // 6. Enviar notificación específica para gestión de infraestructura
      console.log("Enviando notificaciones...");
      const notificationService = new NotificationService();
      await notificationService.crearNotificacionMasiva({
        tipo: "aula_eliminada",
        titulo: "Aula Eliminada",
        contenido: `Se ha eliminado el aula ${aula.codigo} - ${aula.nombre}`,
        metadatos: {
          aula_id: id_aula,
          aula_codigo: aula.codigo,
          aula_nombre: aula.nombre,
          aula_sede: aula.sede,
          aula_tipo: aula.tipo,
          usuario_ejecutor: user_action.id,
          fecha_eliminacion: new Date().toISOString(),
          url_action: `/infraestructura/aulas`,
        },
        roles_ids: [2, 7, 8, 9, 10, 20], // Coordinador, Directores, Vicerrectoría, SuperAdmin
        users_ids: [user_action.id], // Usuario que eliminó el aula
      });

      console.log(`✅ Aula ${id_aula} eliminada exitosamente`);
      return FormatterResponseService.success(
        {
          aula: {
            id: id_aula,
            codigo: aula.codigo,
            nombre: aula.nombre,
          },
        },
        "aulas:success.deleted_successfully",
        "aulas:titles.deleted_successfully",
        {
          status: 200,
        }
      );
    } catch (error) {
      console.error("💥 Error en servicio eliminar aula:", error);
      throw error;
    }
  }

  /**
   * @static
   * @async
   * @method obtenerAulasPorSede
   * @description Obtener aulas filtradas por sede con validación
   * @param {string} sede - Sede a filtrar
   * @returns {Object} Resultado de la operación
   */
  static async obtenerAulasPorSede(sede) {
    try {
      console.log(`🏢 Obteniendo aulas para sede: ${sede}`);

      // 1. Validar parámetro sede
      console.log("Validando parámetro sede...");
      if (!sede || typeof sede !== "string") {
        console.error("❌ Parámetro sede inválido");
        return FormatterResponseService.validationError([
          {
            field: "sede",
            message: "aulas:validation.sede_required",
          },
        ]);
      }

      // 2. Obtener aulas por sede del modelo
      console.log("Obteniendo aulas por sede de base de datos...");
      const respuestaModel = await AulaModel.filtrarPorSede(sede);

      if (FormatterResponseService.isError(respuestaModel)) {
        return respuestaModel;
      }

      if (process.env.MODE === "DEVELOPMENT") {
        console.log("📊 Respuesta del modelo:", respuestaModel);
      }

      console.log(
        `✅ Se obtuvieron ${respuestaModel.data.length} aulas para sede ${sede}`
      );
      return FormatterResponseService.success(
        {
          aulas: respuestaModel.data,
          total: respuestaModel.data.length,
          sede: sede,
        },
        "aulas:success.obtained_by_campus_successfully",
        "aulas:titles.list_by_campus_obtained",
        {
          status: 200,
        }
      );
    } catch (error) {
      console.error("💥 Error en servicio obtener aulas por sede:", error);
      throw error;
    }
  }

  /**
   * @static
   * @async
   * @method obtenerAulasPorPnf
   * @description Obtener aulas disponibles para un horario específico
   * @param {number} codigoPNF - Código PNF para filtrar
   * @returns {Object} Resultado de la operación
   */
  static async obtenerAulasPorPnf(codigoPNF) {
    try {
      console.log(`📚 Obteniendo aulas para PNF: ${codigoPNF}`);

      // 1. Validar código PNF
      console.log("Validando código PNF...");
      const pnfValidation = ValidationService.validateId(codigoPNF, "pnf");
      if (!pnfValidation.isValid) {
        console.error("❌ Validación de PNF fallida:", pnfValidation.errors);
        return FormatterResponseService.validationError(pnfValidation.errors);
      }

      // 2. Obtener aulas por PNF del modelo
      console.log("Obteniendo aulas por PNF de base de datos...");
      const respuestaModel = await AulaModel.obtenerAulasPorPnf(codigoPNF);

      if (FormatterResponseService.isError(respuestaModel)) {
        return respuestaModel;
      }

      if (process.env.MODE === "DEVELOPMENT") {
        console.log("📊 Respuesta del modelo:", respuestaModel);
      }

      console.log(
        `✅ Se obtuvieron ${respuestaModel.data.length} aulas para PNF ${codigoPNF}`
      );
      return FormatterResponseService.success(
        {
          aulas_disponibles: respuestaModel.data,
          total: respuestaModel.data.length,
          pnf: codigoPNF,
        },
        "aulas:success.obtained_by_pnf_successfully",
        "aulas:titles.list_by_pnf_obtained",
        {
          status: 200,
        }
      );
    } catch (error) {
      console.error("💥 Error en servicio obtener aulas por PNF:", error);
      throw error;
    }
  }
}
