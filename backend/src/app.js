import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { errorHandler } from '../middlewares/error.middleware.js';
import { notFound } from '../middlewares/notFound.middleware.js';

// Module Imports
import authRoute from '../modules/auth/index.js';
import usersRoute from '../modules/users/index.js';
import categoriesRoute from '../modules/categories/index.js';
import vehiclesRoute from '../modules/vehicles/index.js';
import vehicleImagesRoute from '../modules/vehicleImages/index.js';
import rentalOrdersRoute from '../modules/rentalOrders/index.js';
import paymentsRoute from '../modules/payments/index.js';
import securityDepositsRoute from '../modules/securityDeposits/index.js';
import dashboardRoute from '../modules/dashboard/index.js';
import reportsRoute from '../modules/reports/index.js';
import analyticsRoute from '../modules/analytics/index.js';
import stripeRoute from '../modules/stripe/index.js';
import invoicesRoute from '../modules/invoices/index.js';
import userAddressesRoute from '../modules/userAddresses/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Production Hardening: Stripe Webhook requires raw body parsing before express.json()
app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }));
app.use((req, res, next) => {
  if (req.originalUrl === '/api/stripe/webhook') {
    req.rawBody = req.body;
  }
  next();
});

// Production Hardening Middleware
app.use(helmet());
app.use(compression());

// Browsers reject Access-Control-Allow-Origin: * when credentials are included.
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:3000')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`Not allowed by CORS: ${origin}`));
      }
    },
    credentials: true,
  })
);
app.use(morgan('dev'));
app.use(express.json({ limit: '15mb' })); // Request size limits for Base64 document uploads
app.use(express.urlencoded({ extended: true, limit: '15mb' }));
app.use(cookieParser());

// Rate Limiting (Disabled for development as requested previously)
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 100,
//   message: 'Too many requests from this IP, please try again later.'
// });
// app.use('/api', limiter);

// Swagger Documentation Setup
const swaggerDocument = JSON.parse(fs.readFileSync(path.join(__dirname, '../swagger.json'), 'utf8'));
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Server is healthy', timestamp: new Date() });
});

// API Routes
app.use('/api/auth', authRoute);
app.use('/api/users', usersRoute);
app.use('/api/categories', categoriesRoute);
app.use('/api/vehicles', vehiclesRoute);
app.use('/api', vehicleImagesRoute); // Mounts under /vehicles and /vehicle-images natively
app.use('/api/rental-orders', rentalOrdersRoute);
app.use('/api/payments', paymentsRoute);
app.use('/api/security-deposits', securityDepositsRoute);
app.use('/api/dashboard', dashboardRoute);
app.use('/api/reports', reportsRoute);
app.use('/api/analytics', analyticsRoute);
app.use('/api/stripe', stripeRoute);
app.use('/api/invoices', invoicesRoute);
app.use('/api/user-addresses', userAddressesRoute);

// Error Handling
app.use(notFound);
app.use(errorHandler);

export default app;
