import ValidationService from "./validation.service.js";
import NotificationService from "./notification.service.js";
import CoordinadorModel from "../models/coordinador.model.js";
import FormatterResponseService from "../utils/FormatterResponseService.js";
import { loadEnv } from "../utils/utilis.js";

loadEnv();

/**
 * @class CoordinadorService
 * @description Servicio para operaciones de negocio relacionadas con coordinadores
 */
export default class CoordinadorService {
  /**
   * @static
   * @method getTranslation
   * @description Obtiene traducción para el servicio coordinador
   */
  static getTranslation(req, key, params = {}) {
    try {
      if (req && req.t) {
        const translation = req.t(key, params);
        return translation;
      }

      // Fallback básico en español
      const fallback = {
        // Logs del servicio
        "coordinadores:service.asignarCoordinador.start": "Iniciando asignación de coordinador...",
        "coordinadores:service.asignarCoordinador.validating_data": "Validando datos de asignación...",
        "coordinadores:service.asignarCoordinador.validating_user": "Validando ID de usuario...",
        "coordinadores:service.asignarCoordinador.creating_coordinador": "Asignando coordinador en base de datos...",
        "coordinadores:service.asignarCoordinador.sending_notifications": "Enviando notificaciones...",
        "coordinadores:service.asignarCoordinador.success": "Coordinador asignado exitosamente",
        
        "coordinadores:service.listarCoordinadores.start": "Obteniendo listado de coordinadores...",
        "coordinadores:service.obtenerCoordinador.start": "Buscando coordinador cédula: {{cedula}}",
        "coordinadores:service.actualizarCoordinador.start": "Actualizando coordinador ID: {{id}}",
        "coordinadores:service.eliminarCoordinador.start": "Eliminando coordinador ID: {{id}}",

        // Mensajes de éxito
        "coordinadores:success.coordinador_asignado": "Coordinador asignado exitosamente",
        "coordinadores:success.coordinador_actualizado": "Coordinador actualizado exitosamente",
        "coordinadores:success.coordinador_eliminado": "Coordinador destituido exitosamente",
        "coordinadores:success.coordinador_obtenido": "Coordinador obtenido exitosamente",
        "coordinadores:success.coordinadores_obtenidos": "Coordinadores obtenidos exitosamente",
        "coordinadores:success.search_completed": "Búsqueda de coordinadores completada",

        // Mensajes de error
        "coordinadores:errors.validation_failed": "Error de validación",
        "coordinadores:errors.not_found": "Coordinador no encontrado",
        "coordinadores:errors.duplicate": "Coordinador ya existe",
        "coordinadores:errors.in_use": "Coordinador en uso",
        "coordinadores:errors.invalid_id": "ID inválido",
        "coordinadores:errors.invalid_cedula": "Cédula inválida",
        "coordinadores:errors.invalid_user": "ID de usuario inválido",

        // Notificaciones
        "coordinadores:notifications.coordinador_asignado_title": "Nuevo Coordinador Asignado",
        "coordinadores:notifications.coordinador_asignado_content": "Se ha asignado al profesor {{nombre}} como coordinador del PNF {{pnf}}",
        "coordinadores:notifications.coordinador_actualizado_title": "Coordinador Actualizado",
        "coordinadores:notifications.coordinador_actualizado_content": "Se han actualizado los datos del coordinador {{nombre}}",
        "coordinadores:notifications.coordinador_eliminado_title": "Coordinador Destituido",
        "coordinadores:notifications.coordinador_eliminado_content": "Se ha destituido al coordinador {{nombre}} del PNF {{pnf}}",

        // Títulos para respuestas
        "coordinadores:titles.coordinador_asignado": "Coordinador Asignado",
        "coordinadores:titles.coordinador_actualizado": "Coordinador Actualizado",
        "coordinadores:titles.coordinador_eliminado": "Coordinador Destituido",
        "coordinadores:titles.coordinador_encontrado": "Coordinador Encontrado",
        "coordinadores:titles.lista_coordinadores": "Lista de Coordinadores",
      };

      let translation = fallback[key] || key;

      // Interpolación básica de parámetros
      Object.keys(params).forEach((param) => {
        translation = translation.replace(`{{${param}}}`, params[param]);
      });

      return translation;
    } catch (error) {
      return key;
    }
  }

  /**
   * @static
   * @async
   * @method asignarCoordinador
   * @description Asigna un profesor como coordinador de un PNF
   * @param {Object} datos - Datos de asignación del coordinador
   * @param {object} user_action - Usuario que realiza la acción
   * @param {object} req - Request object para internacionalización
   * @returns {Object} Resultado de la operación
   */
  static async asignarCoordinador(datos, user_action, req = null) {
    try {
      console.log(this.getTranslation(req, "coordinadores:service.asignarCoordinador.start"));
      
      if (process.env.MODE === "DEVELOPMENT") {
        console.log("📝 Datos recibidos:", {
          datos: JSON.stringify(datos, null, 2),
          user_action: user_action,
        });
      }

      // 1. Validar datos de asignación
      console.log(this.getTranslation(req, "coordinadores:service.asignarCoordinador.validating_data"));
      const validation = ValidationService.validateAsignacionCoordinador(datos, {}, req);

      if (!validation.isValid) {
        console.error("❌ Validación de datos fallida:", validation.errors);
        return FormatterResponseService.validationError(
          validation.errors,
          this.getTranslation(req, "coordinadores:errors.validation_failed"),
          req
        );
      }

      // 2. Validar ID de usuario
      console.log(this.getTranslation(req, "coordinadores:service.asignarCoordinador.validating_user"));
      const idValidation = ValidationService.validateId(
        user_action.id,
        "usuario"
      );

      if (!idValidation.isValid) {
        console.error("❌ Validación de ID fallida:", idValidation.errors);
        return FormatterResponseService.validationError(
          idValidation.errors,
          this.getTranslation(req, "coordinadores:errors.invalid_user"),
          req
        );
      }

      // 3. Asignar coordinador en el modelo
      console.log(this.getTranslation(req, "coordinadores:service.asignarCoordinador.creating_coordinador"));
      const respuestaModel = await CoordinadorModel.asignarCoordinador(
        datos,
        user_action.id
      );

      if (FormatterResponseService.isError(respuestaModel)) {
        console.error("❌ Error en modelo:", respuestaModel);
        return respuestaModel;
      }

      if (process.env.MODE === "DEVELOPMENT") {
        console.log("📊 Respuesta del modelo:", respuestaModel);
      }

      // 4. Enviar notificación
      console.log(this.getTranslation(req, "coordinadores:service.asignarCoordinador.sending_notifications"));
      const notificationService = new NotificationService();
      await notificationService.crearNotificacionMasiva({
        titulo: this.getTranslation(req, "coordinadores:notifications.coordinador_asignado_title"),
        tipo: "coordinador_asignado",
        contenido: this.getTranslation(req, "coordinadores:notifications.coordinador_asignado_content", {
          nombre: respuestaModel.data.coordinador.nombres,
          pnf: respuestaModel.data.coordinador.nombre_pnf
        }),
        metadatos: {
          coordinador_cedula: datos.cedula_profesor,
          coordinador_nombre: respuestaModel.data.coordinador.nombres,
          pnf_id: datos.id_pnf,
          pnf_nombre: respuestaModel.data.coordinador.nombre_pnf,
          fecha_inicio: datos.fecha_inicio,
          usuario_asignador: user_action.id,
          fecha_asignacion: new Date().toISOString(),
        },
        roles_ids: [7, 8, 9, 10], // IDs de roles administrativos
        users_ids: [user_action.id, datos.cedula_profesor],
      });

      console.log("🎉 " + this.getTranslation(req, "coordinadores:service.asignarCoordinador.success"));

      return FormatterResponseService.success(
        {
          message: this.getTranslation(req, "coordinadores:success.coordinador_asignado"),
          coordinador: {
            cedula: datos.cedula_profesor,
            nombre: respuestaModel.data.coordinador.nombres,
            pnf: respuestaModel.data.coordinador.nombre_pnf,
            fecha_inicio: datos.fecha_inicio,
            fecha_fin: datos.fecha_fin || null,
          },
        },
        this.getTranslation(req, "coordinadores:success.coordinador_asignado"),
        {
          status: 201,
          title: this.getTranslation(req, "coordinadores:titles.coordinador_asignado"),
        },
        req
      );
    } catch (error) {
      console.error("💥 Error en servicio asignar coordinador:", error);
      throw error;
    }
  }

  /**
   * @static
   * @async
   * @method listarCoordinadores
   * @description Obtiene el listado de todos los coordinadores
   * @param {Object} queryParams - Parámetros de consulta
   * @param {object} req - Request object para internacionalización
   * @returns {Object} Resultado de la operación
   */
  static async listarCoordinadores(queryParams = {}, req = null) {
    try {
      console.log(this.getTranslation(req, "coordinadores:service.listarCoordinadores.start"));

      // Validar parámetros de consulta
      const allowedParams = [
        "page",
        "limit",
        "sort",
        "order",
        "activo",
        "id_pnf",
      ];
      const queryValidation = ValidationService.validateQueryParams(
        queryParams,
        allowedParams
      );

      if (!queryValidation.isValid) {
        console.error("❌ Validación de parámetros fallida:", queryValidation.errors);
        return FormatterResponseService.validationError(
          queryValidation.errors,
          this.getTranslation(req, "coordinadores:errors.validation_failed"),
          req
        );
      }

      const respuestaModel = await CoordinadorModel.listarCoordinadores(
        queryParams
      );

      if (FormatterResponseService.isError(respuestaModel)) {
        console.error("❌ Error en modelo:", respuestaModel);
        return respuestaModel;
      }

      console.log(
        `✅ Se encontraron ${respuestaModel.data?.length || 0} coordinadores`
      );

      return FormatterResponseService.success(
        {
          coordinadores: respuestaModel.data,
          total: respuestaModel.data?.length || 0,
          page: parseInt(queryParams.page) || 1,
          limit:
            parseInt(queryParams.limit) || respuestaModel.data?.length || 0,
        },
        this.getTranslation(req, "coordinadores:success.coordinadores_obtenidos"),
        {
          status: 200,
          title: this.getTranslation(req, "coordinadores:titles.lista_coordinadores"),
        },
        req
      );
    } catch (error) {
      console.error("💥 Error en servicio listar coordinadores:", error);
      throw error;
    }
  }

  /**
   * @static
   * @async
   * @method obtenerCoordinador
   * @description Obtiene los detalles de un coordinador específico
   * @param {number} cedula - Cédula del coordinador
   * @param {object} req - Request object para internacionalización
   * @returns {Object} Resultado de la operación
   */
  static async obtenerCoordinador(cedula, req = null) {
    try {
      console.log(this.getTranslation(req, "coordinadores:service.obtenerCoordinador.start", {
        cedula: cedula
      }));

      // Validar cédula
      const cedulaValidation = ValidationService.validateCedula(cedula, {}, req);
      if (!cedulaValidation.isValid) {
        console.error("❌ Validación de cédula fallida:", cedulaValidation.errors);
        return FormatterResponseService.validationError(
          cedulaValidation.errors,
          this.getTranslation(req, "coordinadores:errors.invalid_cedula"),
          req
        );
      }

      const respuestaModel = await CoordinadorModel.obtenerCoordinador(cedula);

      if (FormatterResponseService.isError(respuestaModel)) {
        console.error("❌ Error en modelo:", respuestaModel);
        return respuestaModel;
      }

      if (!respuestaModel.data || respuestaModel.data.length === 0) {
        console.error("❌ Coordinador no encontrado:", cedula);
        return FormatterResponseService.notFound(
          this.getTranslation(req, "coordinadores:errors.not_found"),
          cedula,
          req
        );
      }

      const coordinador = respuestaModel.data[0];

      console.log(
        `✅ Coordinador encontrado: ${coordinador.nombres} ${coordinador.apellidos}`
      );

      return FormatterResponseService.success(
        coordinador,
        this.getTranslation(req, "coordinadores:success.coordinador_obtenido"),
        {
          status: 200,
          title: this.getTranslation(req, "coordinadores:titles.coordinador_encontrado"),
        },
        req
      );
    } catch (error) {
      console.error("💥 Error en servicio obtener coordinador:", error);
      throw error;
    }
  }

  /**
   * @static
   * @async
   * @method actualizarCoordinador
   * @description Actualiza los datos de un coordinador existente
   * @param {number} id - ID del coordinador
   * @param {Object} datos - Datos actualizados del coordinador
   * @param {object} user_action - Usuario que realiza la acción
   * @param {object} req - Request object para internacionalización
   * @returns {Object} Resultado de la operación
   */
  static async actualizarCoordinador(id, datos, user_action, req = null) {
    try {
      console.log(this.getTranslation(req, "coordinadores:service.actualizarCoordinador.start", {
        id: id
      }));

      if (process.env.MODE === "DEVELOPMENT") {
        console.log("📝 Datos recibidos:", {
          id: id,
          datos: JSON.stringify(datos, null, 2),
          user_action: user_action,
        });
      }

      // 1. Validar ID del coordinador
      const idValidation = ValidationService.validateId(id, "coordinador", {}, req);
      if (!idValidation.isValid) {
        console.error("❌ Validación de ID fallida:", idValidation.errors);
        return FormatterResponseService.validationError(
          idValidation.errors,
          this.getTranslation(req, "coordinadores:errors.invalid_id"),
          req
        );
      }

      // 2. Validar ID de usuario
      const usuarioValidation = ValidationService.validateId(
        user_action.id,
        "usuario",
        {},
        req
      );
      if (!usuarioValidation.isValid) {
        console.error("❌ Validación de usuario fallida:", usuarioValidation.errors);
        return FormatterResponseService.validationError(
          usuarioValidation.errors,
          this.getTranslation(req, "coordinadores:errors.invalid_user"),
          req
        );
      }

      // 3. Validar datos de actualización
      const validation = ValidationService.validateActualizacionCoordinador(datos, {}, req);
      if (!validation.isValid) {
        console.error("❌ Validación de datos fallida:", validation.errors);
        return FormatterResponseService.validationError(
          validation.errors,
          this.getTranslation(req, "coordinadores:errors.validation_failed"),
          req
        );
      }

      // 4. Verificar que el coordinador existe
      const coordinadorExistente = await CoordinadorModel.obtenerCoordinadorPorId(id);

      if (FormatterResponseService.isError(coordinadorExistente)) {
        return coordinadorExistente;
      }

      if (!coordinadorExistente.data || coordinadorExistente.data.length === 0) {
        console.error("❌ Coordinador no encontrado:", id);
        return FormatterResponseService.notFound(
          this.getTranslation(req, "coordinadores:errors.not_found"),
          id,
          req
        );
      }

      // 5. Actualizar coordinador en el modelo
      console.log("📝 Actualizando coordinador en base de datos...");
      const respuestaModel = await CoordinadorModel.actualizarCoordinador(
        id,
        datos,
        user_action.id
      );

      if (FormatterResponseService.isError(respuestaModel)) {
        console.error("❌ Error en modelo:", respuestaModel);
        return respuestaModel;
      }

      // 6. Enviar notificación
      console.log("🔔 Enviando notificaciones...");
      const notificationService = new NotificationService();
      await notificationService.crearNotificacionMasiva({
        titulo: this.getTranslation(req, "coordinadores:notifications.coordinador_actualizado_title"),
        tipo: "coordinador_actualizado",
        contenido: this.getTranslation(req, "coordinadores:notifications.coordinador_actualizado_content", {
          nombre: `${coordinadorExistente.data[0].nombres} ${coordinadorExistente.data[0].apellidos}`
        }),
        metadatos: {
          coordinador_id: id,
          coordinador_cedula: coordinadorExistente.data[0].cedula,
          campos_actualizados: Object.keys(datos),
          usuario_actualizador: user_action.id,
          fecha_actualizacion: new Date().toISOString(),
        },
        roles_ids: [7, 8, 9, 10],
        users_ids: [user_action.id, coordinadorExistente.data[0].cedula],
      });

      console.log("✅ " + this.getTranslation(req, "coordinadores:service.asignarCoordinador.success"));

      return FormatterResponseService.success(
        {
          message: this.getTranslation(req, "coordinadores:success.coordinador_actualizado"),
          coordinador_id: id,
        },
        this.getTranslation(req, "coordinadores:success.coordinador_actualizado"),
        {
          status: 200,
          title: this.getTranslation(req, "coordinadores:titles.coordinador_actualizado"),
        },
        req
      );
    } catch (error) {
      console.error("💥 Error en servicio actualizar coordinador:", error);
      throw error;
    }
  }

  /**
   * @static
   * @async
   * @method eliminarCoordinador
   * @description Elimina un coordinador (destitución)
   * @param {number} id - ID del coordinador
   * @param {object} user_action - Usuario que realiza la acción
   * @param {object} req - Request object para internacionalización
   * @returns {Object} Resultado de la operación
   */
  static async eliminarCoordinador(id, user_action, req = null) {
    try {
      console.log(this.getTranslation(req, "coordinadores:service.eliminarCoordinador.start", {
        id: id
      }));

      // 1. Validar ID del coordinador
      const idValidation = ValidationService.validateId(id, "coordinador", {}, req);
      if (!idValidation.isValid) {
        console.error("❌ Validación de ID fallida:", idValidation.errors);
        return FormatterResponseService.validationError(
          idValidation.errors,
          this.getTranslation(req, "coordinadores:errors.invalid_id"),
          req
        );
      }

      // 2. Validar ID de usuario
      const usuarioValidation = ValidationService.validateId(
        user_action.id,
        "usuario",
        {},
        req
      );
      if (!usuarioValidation.isValid) {
        console.error("❌ Validación de usuario fallida:", usuarioValidation.errors);
        return FormatterResponseService.validationError(
          usuarioValidation.errors,
          this.getTranslation(req, "coordinadores:errors.invalid_user"),
          req
        );
      }

      // 3. Verificar que el coordinador existe
      const coordinadorExistente = await CoordinadorModel.obtenerCoordinadorPorId(id);

      if (FormatterResponseService.isError(coordinadorExistente)) {
        return coordinadorExistente;
      }

      if (!coordinadorExistente.data || coordinadorExistente.data.length === 0) {
        console.error("❌ Coordinador no encontrado:", id);
        return FormatterResponseService.notFound(
          this.getTranslation(req, "coordinadores:errors.not_found"),
          id,
          req
        );
      }

      const coordinador = coordinadorExistente.data[0];

      // 4. Eliminar coordinador en el modelo
      console.log("🗑️ Eliminando coordinador en base de datos...");
      const respuestaModel = await CoordinadorModel.eliminarCoordinador(
        id,
        user_action.id
      );

      if (FormatterResponseService.isError(respuestaModel)) {
        console.error("❌ Error en modelo:", respuestaModel);
        return respuestaModel;
      }

      // 5. Enviar notificación
      console.log("🔔 Enviando notificaciones...");
      const notificationService = new NotificationService();
      await notificationService.crearNotificacionMasiva({
        titulo: this.getTranslation(req, "coordinadores:notifications.coordinador_eliminado_title"),
        tipo: "coordinador_eliminado",
        contenido: this.getTranslation(req, "coordinadores:notifications.coordinador_eliminado_content", {
          nombre: `${coordinador.nombres} ${coordinador.apellidos}`,
          pnf: coordinador.nombre_pnf
        }),
        metadatos: {
          coordinador_id: id,
          coordinador_cedula: coordinador.cedula,
          coordinador_nombre: `${coordinador.nombres} ${coordinador.apellidos}`,
          pnf_id: coordinador.id_pnf,
          pnf_nombre: coordinador.nombre_pnf,
          usuario_ejecutor: user_action.id,
          fecha_destitucion: new Date().toISOString(),
        },
        roles_ids: [7, 8, 9, 10],
        users_ids: [user_action.id, coordinador.cedula],
      });

      console.log("✅ " + this.getTranslation(req, "coordinadores:service.asignarCoordinador.success"));

      return FormatterResponseService.success(
        {
          message: this.getTranslation(req, "coordinadores:success.coordinador_eliminado"),
          coordinador: {
            id: id,
            cedula: coordinador.cedula,
            nombre: `${coordinador.nombres} ${coordinador.apellidos}`,
            pnf: coordinador.nombre_pnf,
          },
        },
        this.getTranslation(req, "coordinadores:success.coordinador_eliminado"),
        {
          status: 200,
          title: this.getTranslation(req, "coordinadores:titles.coordinador_eliminado"),
        },
        req
      );
    } catch (error) {
      console.error("💥 Error en servicio eliminar coordinador:", error);
      throw error;
    }
  }
}