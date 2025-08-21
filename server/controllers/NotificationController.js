import NotificationModel from "../models/notificationModel.js";

export default class NoticationController {
  static async mostrarNotificacion() {
    // Configurar listener
    const userId = 31264460;

    try {
      await NotificationModel.setup(userId, (notification) => {
        console.log("Nueva notificación:", notification);
        // Actualizar UI aquí
      });

      // Obtener notificaciones existentes
      const unread = await NotificationModel.getUnread(userId);
      console.log("Notificaciones no leídas:", unread);
    } catch (error) {
      console.error("Error inicializando notificaciones:", error);
    }

    // Al cerrar sesión o cuando ya no se necesiten
    await NotificationModel.teardown(userId);
  }
}
