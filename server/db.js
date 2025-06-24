import { Client } from 'pg';
import knex from 'knex';
import config from './knexfile.js';

// Configuración principal de Knex
const db = knex(config.development);

// Cliente separado para notificaciones
let notificationClient = null;

export async function connectNotificationListener() {
  if (!notificationClient) {
    // Extraer correctamente la connection string de Knex
    const connectionConfig = {
      host: db.client.config.connection.host || 'localhost',
      port: db.client.config.connection.port || 5432,
      user: db.client.config.connection.user,
      password: db.client.config.connection.password,
      database: db.client.config.connection.database
    };

    notificationClient = new Client(connectionConfig);
    await notificationClient.connect();
    console.log('Notification client connected');
  }
  return notificationClient;
}

export async function disconnectNotificationListener() {
  if (notificationClient) {
    await notificationClient.end();
    notificationClient = null;
    console.log('Notification client disconnected');
  }
}

export function getNotificationClient() {
  if (!notificationClient) {
    throw new Error('Notification client not connected. Call connectNotificationListener() first.');
  }
  return notificationClient;
}

export default db;