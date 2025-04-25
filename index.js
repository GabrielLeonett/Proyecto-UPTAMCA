import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Configuración para servir archivos estáticos desde 'dist'
app.use(express.static(path.join(__dirname, 'dist')));


// Ruta principal que sirve el index.html de React
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'login.js'));
});

app.listen(3000, () => {
  console.log('Server is running on port: http://localhost:3000');
});