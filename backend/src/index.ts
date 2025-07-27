import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import dotenv from 'dotenv';

import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';
import { getHealthStatus, testEmailService } from './controllers/healthController';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import bikeRoutes from './routes/bikes';
import bikesNewRoutes from './routes/bikesNew';
import componentRoutes from './routes/components';
import maintenanceRoutes from './routes/maintenance';
import mechanicRoutes from './routes/mechanics';
import bannerRoutes from './routes/banners';
import passwordResetRoutes from './routes/passwordReset';
import jobsRoutes from './routes/jobs';
import { maintenanceReminderCron } from './jobs/maintenanceReminderCron';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX || '100'), // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Bicycle Maintenance API',
      version: '1.0.0',
      description: 'API for managing bicycle maintenance, components, and mechanics',
    },
    servers: process.env.NODE_ENV === 'production'
      ? [
          {
            url: 'https://api.yourdomain.com/api',
            description: 'Production server',
          },
        ]
      : [
          {
            url: `http://localhost:${PORT}/api`,
            description: 'Development server',
          },
        ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/routes/*.ts'], // paths to files containing OpenAPI definitions
};

const specs = swaggerJsdoc(swaggerOptions);

// Security Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  }
}));

// Dynamic CORS configuration
const allowedOrigins = process.env.NODE_ENV === 'production' 
  ? [
      process.env.FRONTEND_URL,
      ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [])
    ].filter(Boolean)
  : [
      'http://localhost:3000',
      'http://localhost:3001', 
      'http://localhost:3002',
      'http://localhost:3003'
    ];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(limiter);

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Health check endpoints
app.get('/health', getHealthStatus);
app.get('/health/email', testEmailService);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/bikes-old', bikeRoutes);
app.use('/api/bikes', bikesNewRoutes);
app.use('/api/components', componentRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/mechanics', mechanicRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/password-reset', passwordResetRoutes);
app.use('/api/jobs', jobsRoutes);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚲 Server running on port ${PORT}`);
  console.log(`📚 API Documentation available at http://localhost:${PORT}/api-docs`);
  console.log(`🏥 Health check available at http://localhost:${PORT}/health`);
  
  // Start maintenance reminder cron job
  console.log(`🕐 Starting maintenance reminder system...`);
  maintenanceReminderCron.start();
});

export default app;