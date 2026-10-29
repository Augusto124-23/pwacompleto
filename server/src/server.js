import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import morgan from 'morgan';

// Importar rutas
import authRoutes from './routes/auth.routes.js';
import taskRoutes from './routes/task.routes.js';
import pushRoutes from './routes/push.routes.js'; // <-- NUEVO

// Crear la aplicación de express
const app = express();
app.use(cors({
  origin: ['https://pwacompleto-1m7z.vercel.app', 'http://localhost:5173'],
  credentials: true
}));
app.use(express.json());
app.use(morgan('dev'));

app.get('/', (req, res) => res.json({ok: true, name: 'todo-pwa-api'}));
app.use('/api/tasks', taskRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/push', pushRoutes); // <-- NUEVO (Rutas para notificaciones)

const {PORT = 4000, MONGODB_URI} = process.env;

mongoose.connect(MONGODB_URI, {dbName: 'BackPWA'})
.then(() => {
    console.log('Conectado a la base de datos', mongoose.connection.name);
    app.listen(PORT, () => console.log(`API corriendo en http://localhost:${PORT}`));
})
.catch(err => {
    console.error('Error al conectar a la base de datos', err);
    process.exit(1);
});