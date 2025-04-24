import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Configuración de paths para ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para servir archivos estáticos CORRECTAMENTE
app.use(express.static(join(__dirname, '../dist')));

// Ruta principal para SPA - CORREGIDA la sintaxis
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, '../dist', 'index.html'));
});

// Manejo de errores mejorado
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Algo salió mal!');
});

app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});