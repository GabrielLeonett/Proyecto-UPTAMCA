import express from 'express';
import picocolors from 'picocolors';
import {userRouter} from './routes/userRoutes.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use('', userRouter);

app.listen(PORT, () => {
  console.log(picocolors.bgRed(`El servidor esta corriendo en: http://localhost:${PORT}`));
});