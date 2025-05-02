import express from 'express';
import picocolors from 'picocolors';
import {authRouter} from './routes/authRoutes.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use('', authRouter);

app.listen(PORT, () => {
  console.log(picocolors.bgRed(`El servidor esta corriendo en: http://localhost:${PORT}`));
});