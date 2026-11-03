import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import { seedDatabase } from './utils/seedData.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import shopRoutes from './routes/shopRoutes.js';
import medicineRoutes from './routes/medicineRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import healthRoutes from './routes/healthRoutes.js';
import reminderRoutes from './routes/reminderRoutes.js';
import customerRoutes from './routes/customerRoutes.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable Cross-Origin Resource Sharing
app.use(
  cors({
    origin: '*',
    credentials: true,
  })
);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check API
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    application: 'MediTrack API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/shops', shopRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/health-profile', healthRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/customer', customerRoutes);

// Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

// Connect to Database & Start Server
const startServer = async () => {
  try {
    await connectDB();
    await seedDatabase();

    app.listen(PORT, () => {
      console.log(`=======================================================`);
      console.log(` MediTrack Backend running on http://localhost:${PORT}`);
      console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`=======================================================`);
    });
  } catch (err) {
    console.error('Failed to start MediTrack server:', err);
    process.exit(1);
  }
};

startServer();
