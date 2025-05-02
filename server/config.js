//Constantes para la Aplicación
export const APP_NAME = 'MyApp';
export const APP_VERSION = '1.0.0';

// Constantes para la Base de Datos
export const APP_DB_USER = process.env.DB_USER || 'postgres';
export const APP_DB_PASSWORD = process.env.DB_PASSWORD || '1234';
export const APP_DB_HOST = process.env.DB_HOST || 'localhost';
export const APP_DB_PORT = process.env.DB_PORT || 5432;
export const APP_DB_NAME = process.env.DB_NAME || 'proyecto_uptamca';

// Constantes para el Servidor
export const APP_SERVER_PORT = process.env.PORT || 3000;
export const APP_SERVER_HOST = process.env.HOST || 'localhost';
export const APP_SERVER_PROTOCOL = process.env.PROTOCOL || 'http';

// Constantes para la Autenticación
export const APP_AUTH_SECRET_KEY = "44W2My8AgYWB82Zwtjg$^fEGc!ufqN@dCfJREEty2^jBNUedXj"