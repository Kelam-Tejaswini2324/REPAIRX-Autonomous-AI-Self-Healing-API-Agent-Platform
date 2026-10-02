// Standalone Express App Instance for Target Microservice
import express from 'express';
import cors from 'cors';
import userRoutes from './routes/userRoutes.js';

export const createTargetApp = () => {
  const app = express();
  app.use(cors());
  app.use(express.json());
  
  // Mount routes at /api/v1
  app.use('/api/v1', userRoutes);
  
  // Catch 404
  app.use((req, res) => {
    res.status(404).json({ success: false, error: 'Endpoint not found: ' + req.method + ' ' + req.url });
  });

  return app;
};
