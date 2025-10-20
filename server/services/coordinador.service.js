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
   * @async
   * @method asignarCoordinador
   * @description Asigna un profesor como coordinador de un PNF
   * @param {Object} datos - Datos de asignación del coordinador
   * @param {object} user_action - Usuario que realiza la acción
   * @returns {Object} Resultado de la operación
   */
  static async asignarCoordinador(datos, user_action) {
    try {
      console.log("🔍 [asignarCoordinador] Iniciando asignación de coordinador...");

      if (process.env.MODE === "DEVELOPMENT") {
        console.log("📝 Datos recibidos:", {
          datos: JSON.stringify(datos, null, 2),
          user_action: user_action,
        });
      }

      // 1. Validar datos de asignación
      console.log("✅ Validando datos de asignación...");
      const validation = ValidationService.validateAsignacionCoordinador(datos);

      if (!validation.isValid) {
        console.error("❌ Validación de datos fallida:", validation.errors);
        return FormatterResponseService.validationError(
          validation.errors,
          "Error de validación en asignación de coordinador"
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

      // 3. Verificar que el profesor existe y está activo
      console.log("👨‍🏫 Verificando profesor...");
      const profesorValidation = await ValidationService.validateProfesorExists(datos.cedula_profesor);
      
      if (!profesorValidation.exists) {
        console.error("❌ Profesor no encontrado:", datos.cedula_profesor);
        return FormatterResponseService.notFound("Profesor", datos.cedula_profesor);
      }

      if (!profesorValidation.activo) {
        console.error("❌ Profesor inactivo:", datos.cedula_profesor);
        return FormatterResponseService.error(
          "Profesor inactivo",
          "No se puede asignar como coordinador a un profesor inactivo",
          400,
          "PROFESOR_INACTIVO",
          { cedula: datos.cedula_profesor }
        );
      }

      // 4. Verificar que el PNF existe y está activo
      console.log("📚 Verificando PNF...");
      const pnfValidation = await ValidationService.validatePnfExists(datos.id_pnf);
      
      if (!pnfValidation.exists) {
        console.error("❌ PNF no encontrado:", datos.id_pnf);
        return FormatterResponseService.notFound("PNF", datos.id_pnf);
      }

      if (!pnfValidation.activo) {
        console.error("❌ PNF inactivo:", datos.id_pnf);
        return FormatterResponseService.error(
          "PNF inactivo",
          "No se puede asignar coordinador a un PNF inactivo",
          400,
          "PNF_INACTIVO",
          { id_pnf: datos.id_pnf }
        );
      }

      // 6. Asignar coordinador en el modelo
      console.log("👑 Asignando coordinador en base de datos...");
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

      // 7. Enviar notificación
      console.log("🔔 Enviando notificaciones...");
      const notificationService = new NotificationService();
      await notificationService.crearNotificacionMasiva({
        titulo: "Nuevo Coordinador Asignado",
        tipo: "coordinador_asignado",
        contenido: `Se ha asignado al profesor ${profesorValidation.nombre} como coordinador del PNF ${pnfValidation.nombre}`,
        metadatos: {
          coordinador_cedula: datos.cedula_profesor,
          coordinador_nombre: profesorValidation.nombre,
          pnf_id: datos.id_pnf,
          pnf_nombre: pnfValidation.nombre,
          fecha_inicio: datos.fecha_inicio,
          usuario_asignador: user_action.id,
          fecha_asignacion: new Date().toISOString(),
        },
        roles_ids: [1, 2, 3], // IDs de roles administrativos
        users_ids: [user_action.id, datos.cedula_profesor],
      });

      console.log("🎉 Coordinador asignado exitosamente");

      return FormatterResponseService.success(
        {
          message: "Coordinador asignado exitosamente",
          coordinador: {
            cedula: datos.cedula_profesor,
            nombre: profesorValidation.nombre,
            pnf: pnfValidation.nombre,
            fecha_inicio: datos.fecha_inicio,
            fecha_fin: datos.fecha_fin || null,
          },
        },
        "Coordinador asignado exitosamente",
        {
          status: 201,
          title: "Coordinador Asignado",
        }
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
   * @returns {Object} Resultado de la operación
   */
  static async listarCoordinadores(queryParams = {}) {
    try {
      console.log("🔍 [listarCoordinadores] Obteniendo listado de coordinadores...");

      // Validar parámetros de consulta
      const allowedParams = ["page", "limit", "sort", "order", "activo", "id_pnf"];
      const queryValidation = ValidationService.validateQueryParams(
        queryParams,
        allowedParams
      );

      if (!queryValidation.isValid) {
        console.error("❌ Validación de parámetros fallida:", queryValidation.errors);
        return FormatterResponseService.validationError(
          queryValidation.errors,
          "Error de validación en parámetros de consulta"
        );
      }

      const respuestaModel = await CoordinadorModel.listarCoordinadores(queryParams);

      if (FormatterResponseService.isError(respuestaModel)) {
        console.error("❌ Error en modelo:", respuestaModel);
        return respuestaModel;
      }

      console.log(`✅ Se encontraron ${respuestaModel.data?.length || 0} coordinadores`);

      return FormatterResponseService.success(
        {
          coordinadores: respuestaModel.data,
          total: respuestaModel.data?.length || 0,
          page: parseInt(queryParams.page) || 1,
          limit: parseInt(queryParams.limit) || (respuestaModel.data?.length || 0),
        },
        "Coordinadores obtenidos exitosamente",
        {
          status: 200,
          title: "Lista de Coordinadores",
        }
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
   * @returns {Object} Resultado de la operación
   */
  static async obtenerCoordinador(cedula) {
    try {
      console.log(`🔍 [obtenerCoordinador] Buscando coordinador cédula: ${cedula}`);

      // Validar cédula
      const cedulaValidation = ValidationService.validateCedula(cedula);
      if (!cedulaValidation.isValid) {
        console.error("❌ Validación de cédula fallida:", cedulaValidation.errors);
        return FormatterResponseService.validationError(
          cedulaValidation.errors,
          "Cédula de coordinador inválida"
        );
      }

      const respuestaModel = await CoordinadorModel.obtenerCoordinador(cedula);

      if (FormatterResponseService.isError(respuestaModel)) {
        console.error("❌ Error en modelo:", respuestaModel);
        return respuestaModel;
      }

      if (!respuestaModel.data || respuestaModel.data.length === 0) {
        console.error("❌ Coordinador no encontrado:", cedula);
        return FormatterResponseService.notFound("Coordinador", cedula);
      }

      const coordinador = respuestaModel.data[0];

      console.log(`✅ Coordinador encontrado: ${coordinador.nombres} ${coordinador.apellidos}`);

      return FormatterResponseService.success(
        coordinador,
        "Coordinador obtenido exitosamente",
        {
          status: 200,
          title: "Coordinador Encontrado",
        }
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
   * @returns {Object} Resultado de la operación
   */
  static async actualizarCoordinador(id, datos, user_action) {
    try {
      console.log(`🔍 [actualizarCoordinador] Actualizando coordinador ID: ${id}`);

      if (process.env.MODE === "DEVELOPMENT") {
        console.log("📝 Datos recibidos:", {
          id: id,
          datos: JSON.stringify(datos, null, 2),
          user_action: user_action,
        });
      }

      // 1. Validar ID del coordinador
      const idValidation = ValidationService.validateId(id, "coordinador");
      if (!idValidation.isValid) {
        console.error("❌ Validación de ID fallida:", idValidation.errors);
        return FormatterResponseService.validationError(
          idValidation.errors,
          "ID de coordinador inválido"
        );
      }

      // 2. Validar ID de usuario
      const usuarioValidation = ValidationService.validateId(user_action.id, "usuario");
      if (!usuarioValidation.isValid) {
        console.error("❌ Validación de usuario fallida:", usuarioValidation.errors);
        return FormatterResponseService.validationError(
          usuarioValidation.errors,
          "ID de usuario inválido"
        );
      }

      // 3. Validar datos de actualización
      const validation = ValidationService.validateActualizacionCoordinador(datos);
      if (!validation.isValid) {
        console.error("❌ Validación de datos fallida:", validation.errors);
        return FormatterResponseService.validationError(
          validation.errors,
          "Error de validación en actualización de coordinador"
        );
      }

      // 4. Verificar que el coordinador existe
      const coordinadorExistente = await CoordinadorModel.obtenerCoordinadorPorId(id);
      
      if (FormatterResponseService.isError(coordinadorExistente)) {
        return coordinadorExistente;
      }

      if (!coordinadorExistente.data || coordinadorExistente.data.length === 0) {
        console.error("❌ Coordinador no encontrado:", id);
        return FormatterResponseService.notFound("Coordinador", id);
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
        titulo: "Coordinador Actualizado",
        tipo: "coordinador_actualizado",
        contenido: `Se han actualizado los datos del coordinador ${coordinadorExistente.data[0].nombres} ${coordinadorExistente.data[0].apellidos}`,
        metadatos: {
          coordinador_id: id,
          coordinador_cedula: coordinadorExistente.data[0].cedula,
          campos_actualizados: Object.keys(datos),
          usuario_actualizador: user_action.id,
          fecha_actualizacion: new Date().toISOString(),
        },
        roles_ids: [1, 2, 3],
        users_ids: [user_action.id, coordinadorExistente.data[0].cedula],
      });

      console.log("✅ Coordinador actualizado exitosamente");

      return FormatterResponseService.success(
        {
          message: "Coordinador actualizado exitosamente",
          coordinador_id: id,
        },
        "Coordinador actualizado exitosamente",
        {
          status: 200,
          title: "Coordinador Actualizado",
        }
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
   * @returns {Object} Resultado de la operación
   */
  static async eliminarCoordinador(id, user_action) {
    try {
      console.log(`🔍 [eliminarCoordinador] Eliminando coordinador ID: ${id}`);

      // 1. Validar ID del coordinador
      const idValidation = ValidationService.validateId(id, "coordinador");
      if (!idValidation.isValid) {
        console.error("❌ Validación de ID fallida:", idValidation.errors);
        return FormatterResponseService.validationError(
          idValidation.errors,
          "ID de coordinador inválido"
        );
      }

      // 2. Validar ID de usuario
      const usuarioValidation = ValidationService.validateId(user_action.id, "usuario");
      if (!usuarioValidation.isValid) {
        console.error("❌ Validación de usuario fallida:", usuarioValidation.errors);
        return FormatterResponseService.validationError(
          usuarioValidation.errors,
          "ID de usuario inválido"
        );
      }

      // 3. Verificar que el coordinador existe
      const coordinadorExistente = await CoordinadorModel.obtenerCoordinadorPorId(id);
      
      if (FormatterResponseService.isError(coordinadorExistente)) {
        return coordinadorExistente;
      }

      if (!coordinadorExistente.data || coordinadorExistente.data.length === 0) {
        console.error("❌ Coordinador no encontrado:", id);
        return FormatterResponseService.notFound("Coordinador", id);
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
        titulo: "Coordinador Destituido",
        tipo: "coordinador_eliminado",
        contenido: `Se ha destituido al coordinador ${coordinador.nombres} ${coordinador.apellidos} del PNF ${coordinador.nombre_pnf}`,
        metadatos: {
          coordinador_id: id,
          coordinador_cedula: coordinador.cedula,
          coordinador_nombre: `${coordinador.nombres} ${coordinador.apellidos}`,
          pnf_id: coordinador.id_pnf,
          pnf_nombre: coordinador.nombre_pnf,
          usuario_ejecutor: user_action.id,
          fecha_destitucion: new Date().toISOString(),
        },
        roles_ids: [1, 2, 3],
        users_ids: [user_action.id, coordinador.cedula],
      });

      console.log("✅ Coordinador eliminado exitosamente");

      return FormatterResponseService.success(
        {
          message: "Coordinador destituido exitosamente",
          coordinador: {
            id: id,
            cedula: coordinador.cedula,
            nombre: `${coordinador.nombres} ${coordinador.apellidos}`,
            pnf: coordinador.nombre_pnf,
          },
        },
        "Coordinador destituido exitosamente",
        {
          status: 200,
          title: "Coordinador Destituido",
        }
      );
    } catch (error) {
      console.error("💥 Error en servicio eliminar coordinador:", error);
      throw error;
    }
  }
}