/**
 * Módulo para el manejo de operaciones con coordinadores en la base de datos
 * @module CoordinadorModel
 * @description Contiene métodos para asignar, mostrar y gestionar coordinadores
 */

// Importación de librería para envío de correos electrónicos
import { enviarEmail } from "../utils/EnviarCorreos.js";

// Importación de la conexión a la base de datos
import db from "../database/db.js";

// Importación de clase para formateo de respuestas
import FormatResponseModel from "../utils/FormatResponseModel.js";

// Importación de función para parsear datos a json
import { loadEnv } from "../utils/utilis.js";
import NotificationService from "../services/Notification.services.js";

export default class CoordinadorModel {
  /**
   * Asigna un profesor como coordinador de un PNF
   * @method asignarCoordinador
   * @static
   * @async
   * @param {Object} params - Parámetros de entrada
   * @param {number} params.cedula_profesor - Cédula del profesor a asignar como coordinador
   * @param {number} params.id_pnf - ID del PNF al que se asignará como coordinador
   * @param {Object} params.usuario_accion - Información del usuario que realiza la asignación
   * @returns {Promise<Object>} Objeto con el resultado de la operación
   * @throws {Error} Si ocurre un error durante la asignación
   *
   * @example
   * const resultado = await CoordinadorModel.asignarCoordinador({
   *   cedula_profesor: 12345678,
   *   id_pnf: 1,
   *   usuario_accion: { id: 1, nombres: "Admin" }
   * });
   */
  static async asignarCoordinador({ cedula_profesor, id_pnf, usuario_accion }) {
    const notificationService = new NotificationService();

    try {
      // 1. Llamar procedimiento almacenado para asignar coordinador
      const query = `CALL asignar_coordinador(?, ?, ?, NULL)`;

      const params = [usuario_accion.id, cedula_profesor, id_pnf];

      const { rows } = await db.raw(query, params);

      // 2. Verificar respuesta del procedimiento
      const resultado = FormatResponseModel.respuestaPostgres(
        rows,
        "Coordinador asignado con éxito"
      );

      // 3. Obtener datos adicionales para notificaciones
      const datosCoordinador = resultado.data || {};
      const actionUrl = `${process.env.ORIGIN_FRONTEND}/coordinadores/${cedula_profesor}`;

      // 🔥 NOTIFICACIONES EN TIEMPO REAL

      // 4.1 Notificación para administradores y directivos
      try {
        await notificationService.crearNotificacionMasiva({
          titulo: "Nuevo Coordinador Asignado",
          tipo: "sistema",
          contenido: `El profesor ${datosCoordinador.nombres} ${datosCoordinador.apellidos} ha sido asignado como coordinador del PNF ${datosCoordinador.nombre_pnf}`,
          metadatos: {
            accion: "asignacion_coordinador",
            coordinador_id: datosCoordinador.id_coordinador,
            profesor_id: datosCoordinador.id_profesor,
            pnf_id: id_pnf,
            pnf_nombre: datosCoordinador.nombre_pnf,
            asignado_por: usuario_accion.id,
            fecha_asignacion: new Date().toISOString(),
            action_url: actionUrl,
          },
          roles_ids: [1, 2, 3], // SuperAdmin, Vicerrector, Director General
        });
        console.log("✅ Notificación enviada a administradores");
      } catch (notifError) {
        console.warn(
          "⚠️ Error enviando notificación a administradores:",
          notifError.message
        );
      }

      // 4.2 Notificación para el profesor asignado como coordinador
      try {
        await notificationService.crearNotificacionIndividual({
          titulo: "Has sido asignado como Coordinador",
          tipo: "asignacion",
          user_id: cedula_profesor,
          contenido: `Has sido designado como coordinador del PNF ${datosCoordinador.nombre_pnf}. Ahora tienes acceso a funciones adicionales en el sistema.`,
          metadatos: {
            accion: "designacion_coordinador",
            pnf_id: id_pnf,
            pnf_nombre: datosCoordinador.nombre_pnf,
            fecha_inicio: datosCoordinador.fecha_inicio,
            asignado_por: usuario_accion.id,
            action_url: actionUrl,
            permisos_url: `${process.env.ORIGIN_FRONTEND}/coordinadores/permisos`,
          },
        });
        console.log("✅ Notificación enviada al nuevo coordinador");
      } catch (coordinadorError) {
        console.warn(
          "⚠️ Error enviando notificación al coordinador:",
          coordinadorError.message
        );
      }

      // 4.3 Notificación para otros coordinadores del mismo PNF (si existen)
      try {
        await notificationService.crearNotificacionMasiva({
          titulo: "Nuevo Colega en la Coordinación",
          tipo: "informacion",
          contenido: `Se ha asignado a ${datosCoordinador.nombres} ${datosCoordinador.apellidos} como coordinador del PNF ${datosCoordinador.nombre_pnf}`,
          metadatos: {
            accion: "nuevo_coordinador_pnf",
            pnf_id: id_pnf,
            pnf_nombre: datosCoordinador.nombre_pnf,
            nuevo_coordinador: `${datosCoordinador.nombres} ${datosCoordinador.apellidos}`,
            coordinador_id: datosCoordinador.id_coordinador,
            action_url: actionUrl,
            equipo_url: `${process.env.ORIGIN_FRONTEND}/coordinadores/equipo/${id_pnf}`,
          },
          roles_ids: [4], // Rol de coordinador
          metadatos_adicionales: {
            pnf_id: id_pnf, // Filtrar solo coordinadores del mismo PNF
          },
        });
        console.log("✅ Notificación enviada a otros coordinadores");
      } catch (colegasError) {
        console.warn(
          "⚠️ Error enviando notificación a colegas coordinadores:",
          colegasError.message
        );
      }

      // 4.4 Notificación general para la comunidad académica
      try {
        await notificationService.crearNotificacionMasiva({
          titulo: "Nueva Designación de Coordinación",
          tipo: "general",
          contenido: `Tenemos el agrado de informar que el profesor ${datosCoordinador.nombres} ${datosCoordinador.apellidos} ha sido designado como coordinador del PNF ${datosCoordinador.nombre_pnf}`,
          metadatos: {
            accion: "anuncio_coordinador",
            tipo_notificacion: "informacion_general",
            coordinador_nombre: `${datosCoordinador.nombres} ${datosCoordinador.apellidos}`,
            pnf_nombre: datosCoordinador.nombre_pnf,
            area_responsabilidad: "Coordinación Académica",
            action_url: pnfUrl,
            contacto_url: `${process.env.ORIGIN_FRONTEND}/contacto/coordinacion`,
          },
          roles_ids: [], // Notificación masiva
          users_ids: [], // Para todos los usuarios
        });
        console.log("✅ Notificación masiva enviada a la comunidad académica");
      } catch (masivaError) {
        console.warn(
          "⚠️ Error enviando notificación masiva:",
          masivaError.message
        );
      }

      // 5. Cargar variables de entorno para el correo
      loadEnv();

      // 6. Enviar correo de designación al nuevo coordinador
      try {
        const Correo = {
          asunto: "Designación como Coordinador - Sistema Académico",
          html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2 style="color: #2c3e50;">¡Felicitaciones, ${
          datosCoordinador.nombres
        }!</h2>
        <p>Ha sido designado oficialmente como <strong>Coordinador del PNF ${
          datosCoordinador.nombre_pnf
        }</strong>.</p>
        
        <div style="background-color: #e8f4fd; padding: 15px; border-left: 4px solid #3498db; margin: 15px 0;">
          <p><strong>Información de su designación:</strong></p>
          <ul>
            <li><strong>PNF:</strong> ${datosCoordinador.nombre_pnf}</li>
            <li><strong>Fecha de designación:</strong> ${new Date().toLocaleDateString()}</li>
            <li><strong>Designado por:</strong> ${
              usuario_accion.nombres || "Administración"
            }</li>
          </ul>
        </div>

        <p><strong>Próximos pasos y responsabilidades:</strong></p>
        <ul>
          <li>Gestión académica del PNF asignado</li>
          <li>Supervisión de planes de estudio</li>
          <li>Coordinación con el cuerpo docente</li>
          <li>Reportes académicos periódicos</li>
        </ul>

        <p>Para acceder a las funciones de coordinación, utilice el siguiente enlace:</p>
      </div>
      <div style="display: flex; flex-direction: row; justify-content: center; align-items: center; width: 100%;">
        <a href="${actionUrl}" style="display: inline-block; background-color: #1C75BA; color: white; 
                  padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-bottom: 20px;">
            Acceder al Panel de Coordinación
        </a>
      </div>
      <div style="margin-top: 20px; padding: 15px; background-color: #f8f9fa; border-radius: 5px;">
        <p style="margin: 0; font-size: 14px; color: #666;">
          <strong>Recursos adicionales:</strong><br>
          <a href="${
            process.env.ORIGIN_FRONTEND
          }/coordinadores/manual" style="color: #1C75BA;">Manual del Coordinador</a> | 
          <a href="${
            process.env.ORIGIN_FRONTEND
          }/soporte" style="color: #1C75BA;">Soporte Técnico</a>
        </p>
      </div>
      `,
        };

        await enviarEmail({
          Destinatario: datosCoordinador.email,
          Correo: Correo,
        });
        console.log("✅ Correo de designación enviado al coordinador");
      } catch (emailError) {
        console.warn("⚠️ Correo no enviado:", emailError.message);
      }

      return resultado;
    } catch (error) {
      // 7. Manejo de errores
      throw FormatResponseModel.respuestaError(
        error,
        "Error al asignar coordinador"
      );
    }
  }

  /**
   * Obtiene el listado de todos los coordinadores
   * @method listarCoordinadores
   * @static
   * @async
   * @param {Object} [filtros] - Filtros opcionales para la búsqueda
   * @param {number} [filtros.pnf_id] - Filtrar por ID de PNF
   * @param {string} [filtros.estatus] - Filtrar por estatus (activo/inactivo)
   * @returns {Promise<Object>} Lista de coordinadores
   */
  static async listarCoordinadores() {
    try {
      let query = `
        SELECT * FROM public.coordinadores_informacion_completa
      `;

      const { rows } = await db.raw(query);

      return FormatResponseModel.respuestaPostgres(
        rows,
        "Coordinadores obtenidos exitosamente"
      );
    } catch (error) {
      throw FormatResponseModel.respuestaError(
        error,
        "Error al obtener coordinadores"
      );
    }
  }

  /**
   * Desasigna a un coordinador de su PNF
   * @method desasignarCoordinador
   * @static
   * @async
   * @param {Object} params - Parámetros de entrada
   * @param {number} params.id_coordinador - ID del coordinador a desasignar
   * @param {Object} params.usuario_accion - Usuario que realiza la desasignación
   * @param {string} [params.motivo] - Motivo de la desasignación
   * @returns {Promise<Object>} Resultado de la operación
   */
  static async desasignarCoordinador({
    id_coordinador,
    usuario_accion,
    motivo,
  }) {
    const notificationService = new NotificationService();

    try {
      const query = `CALL desasignar_coordinador(?, ?, ?, NULL)`;
      const params = [usuario_accion.id, id_coordinador, motivo];

      const { rows } = await db.raw(query, params);
      const resultado = FormatResponseModel.respuestaPostgres(
        rows,
        "Coordinador desasignado exitosamente"
      );

      // Notificación de desasignación
      if (resultado.data) {
        await notificationService.crearNotificacionMasiva({
          titulo: "Coordinador Desasignado",
          tipo: "sistema",
          contenido: `El coordinador ${resultado.data.nombres} ${resultado.data.apellidos} ha sido desasignado del PNF ${resultado.data.nombre_pnf}`,
          metadatos: {
            accion: "desasignacion_coordinador",
            coordinador_id: id_coordinador,
            pnf_id: resultado.data.id_pnf,
            motivo: motivo,
            desasignado_por: usuario_accion.id,
            fecha_desasignacion: new Date().toISOString(),
            action_url: `${process.env.ORIGIN_FRONTEND}/coordinadores/historial`,
          },
          roles_ids: [1, 2, 3], // Administradores
        });
      }

      return resultado;
    } catch (error) {
      throw FormatResponseModel.respuestaError(
        error,
        "Error al desasignar coordinador"
      );
    }
  }
}
