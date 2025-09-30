import { 
  connectNotificationListener, 
  getNotificationClient,
  disconnectNotificationListener
} from '../db.js';
import db from "../database/db.js";

export default class NotificationModel {
  static listeners = new Map();

  static async setup(userId, callback) {
    try {
      const client = await connectNotificationListener();
      
      if (this.listeners.has(userId)) {
        console.log(`Listener ya existe para usuario ${userId}`);
        return;
      }

      await client.query(`LISTEN notificaciones_${userId}`);
      
      const handler = (msg) => {
        try {
          const data = JSON.parse(msg.payload);
          callback(data);
        } catch (error) {
          console.error('Error procesando notificación:', error);
        }
      };

      client.on('notification', handler);
      this.listeners.set(userId, handler);

      console.log(`Listener activado para usuario ${userId}`);
    } catch (error) {
      console.error('Error configurando listener:', error);
      throw error;
    }
  }

  static async teardown(userId) {
    try {
      const client = getNotificationClient();
      const handler = this.listeners.get(userId);
      
      if (handler) {
        client.removeListener('notification', handler);
        await client.query(`UNLISTEN notificaciones_${userId}`);
        this.listeners.delete(userId);
        console.log(`Listener removido para usuario ${userId}`);
      }

      if (this.listeners.size === 0) {
        await disconnectNotificationListener();
      }
    } catch (error) {
      console.error('Error removiendo listener:', error);
      throw error;
    }
  }

  static async getUnread(userId) {
    try {
      return await db('notifications')
        .where({ 
          user_id: userId, 
          is_read: false 
        })
        .orderBy('created_at', 'desc');
    } catch (error) {
      console.error('Error obteniendo notificaciones:', error);
      throw error;
    }
  }
}