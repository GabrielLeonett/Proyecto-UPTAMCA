import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Configuración de rutas absolutas
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logoPath = path.join(__dirname, 'logo.png'); // Ajusta esta ruta

// Verificación de existencia
if (!fs.existsSync(logoPath)) {
  throw new Error(`Archivo logo.png no encontrado en: ${logoPath}`);
}

// Uso en mailOptions
attachments: [{
  filename: 'logo.png',
  path: logoPath,
  cid: 'logo'
}]