import express from 'express';
import cors from 'cors';
import path from 'path';
import sequelize from './db';
import authRoutes from './routes/auth';
import articleRoutes from './routes/articles';
import uploadRoutes from './routes/upload';
import gardenRoutes from './routes/garden';
import trackingRoutes from './routes/tracking';
import analyticsRoutes from './routes/analytics';

const app = express();
const PORT = process.env.PORT || 3001;

app.set('trust proxy', true);
app.use(cors());
app.use(express.json());

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, '../../database/uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/garden', gardenRoutes);
app.use('/api/track', trackingRoutes);
app.use('/api/analytics', analyticsRoutes);

// Initialize DB and start server
sequelize.sync({ alter: true }).then(() => {
  console.log('Database synced');
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}).catch((error) => {
  console.error('Failed to sync database:', error);
});
