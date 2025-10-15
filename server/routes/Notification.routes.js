import { Router } from "express";
import NotificationController from '../controllers/notification.controller.js';
import { middlewareAuth } from "../middlewares/auth.js";

const { 
  mostrarNotificacion,
  marcarComoLeida,
  eliminarNotificacion,
  obtenerNotificacionesNoLeidas 
} = NotificationController;

export const NotificationRouter = Router();

/**
 * =============================================
 * RUTAS DE NOTIFICACIONES
 * =============================================
 */

/**
 * @name GET /notifications
 * @description Obtener todas las notificaciones del usuario autenticado
 * @query {number} [page=1] - Número de página para paginación
 * @query {number} [limit=20] - Límite de notificaciones por página
 * @query {boolean} [unreadOnly=false] - Solo notificaciones no leídas
 * @middleware Requiere autenticación (cualquier rol)
 * @returns {Array} Lista de notificaciones
 * @example
 * // Obtener notificaciones paginadas
 * curl -X GET 'http://localhost:3000/notifications?page=1&limit=10' \
 *   --header 'Authorization: Bearer <token>'
 * 
 * // Obtener solo notificaciones no leídas
 * curl -X GET 'http://localhost:3000/notifications?unreadOnly=true' \
 *   --header 'Authorization: Bearer <token>'
 */
NotificationRouter.get(
  "/notifications",
  middlewareAuth(null),
  mostrarNotificacion
);

/**
 * @name GET /notifications/unread
 * @description Obtener notificaciones no leídas del usuario
 * @query {number} [limit=10] - Límite de notificaciones
 * @middleware Requiere autenticación (cualquier rol)
 * @returns {Array} Lista de notificaciones no leídas
 * @example
 * curl -X GET 'http://localhost:3000/notifications/unread?limit=5' \
 *   --header 'Authorization: Bearer <token>'
 */
NotificationRouter.get(
  "/notifications/unread",
  middlewareAuth(null),
  obtenerNotificacionesNoLeidas
);

/**
 * @name PUT /notifications/:id/read
 * @description Marcar una notificación como leída
 * @param {number} id - ID de la notificación
 * @middleware Requiere autenticación (cualquier rol)
 * @returns {Object} Confirmación de la operación
 * @example
 * curl -X PUT 'http://localhost:3000/notifications/123/read' \
 *   --header 'Authorization: Bearer <token>'
 */
NotificationRouter.put(
  "/notifications/:id/read",
  middlewareAuth(null),
  marcarComoLeida
);

/**
 * @name PUT /notifications/read-all
 * @description Marcar todas las notificaciones como leídas
 * @middleware Requiere autenticación (cualquier rol)
 * @returns {Object} Confirmación de la operación
 * @example
 * curl -X PUT 'http://localhost:3000/notifications/read-all' \
 *   --header 'Authorization: Bearer <token>'
 */
NotificationRouter.put(
  "/notifications/read-all",
  middlewareAuth(null),
  // Aquí iría el controlador para marcar todas como leídas
);

/**
 * @name DELETE /notifications/:id
 * @description Eliminar una notificación específica
 * @param {number} id - ID de la notificación
 * @middleware Requiere autenticación (cualquier rol)
 * @returns {Object} Confirmación de eliminación
 * @example
 * curl -X DELETE 'http://localhost:3000/notifications/123' \
 *   --header 'Authorization: Bearer <token>'
 */
NotificationRouter.delete(
  "/notifications/:id",
  middlewareAuth(null),
  eliminarNotificacion
);

/**
 * @name DELETE /notifications
 * @description Eliminar todas las notificaciones del usuario
 * @middleware Requiere autenticación (cualquier rol)
 * @returns {Object} Confirmación de eliminación
 * @example
 * curl -X DELETE 'http://localhost:3000/notifications' \
 *   --header 'Authorization: Bearer <token>'
 */
NotificationRouter.delete(
  "/notifications",
  middlewareAuth(null),
  // Aquí iría el controlador para eliminar todas las notificaciones
);

/**
 * @name GET /notifications/count
 * @description Obtener el conteo de notificaciones no leídas
 * @middleware Requiere autenticación (cualquier rol)
 * @returns {Object} { count: number }
 * @example
 * curl -X GET 'http://localhost:3000/notifications/count' \
 *   --header 'Authorization: Bearer <token>'
 */
NotificationRouter.get(
  "/notifications/count",
  middlewareAuth(null),
  // Aquí iría el controlador para obtener el conteo
);