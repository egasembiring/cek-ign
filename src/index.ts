import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import swaggerJSDoc from 'swagger-jsdoc';
import dotenv from 'dotenv';
import path from 'path';

import { initDatabase } from './config/database';
import { logger } from './utils/logger';
import { authRoutes } from './routes/auth';
import { gameRoutes } from './routes/games';
import { ignRoutes } from './routes/ign';
import { userRoutes } from './routes/user';
import { statsRoutes } from './routes/stats';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 6969;

// Initialize database
initDatabase();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: false,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
    meta: {
      timestamp: new Date().toISOString(),
      rate_limit: {
        remaining: 0,
        reset_time: Math.ceil(Date.now() / 1000) + 900
      }
    }
  },
  standardHeaders: true,
  legacyHeaders: false
});

app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use(requestLogger);

// Swagger documentation
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Cek IGN API',
      version: '2.0.0',
      description: 'Complete REST API for checking game IGN availability',
      contact: {
        name: 'API Support',
        email: 'support@cek-ign.com'
      }
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        },
        apiKey: {
          type: 'apiKey',
          in: 'header',
          name: 'X-API-Key'
        }
      }
    }
  },
  apis: ['./src/routes/*.ts', './src/schemas/*.ts']
};

const specs = swaggerJSDoc(swaggerOptions);
app.use('/playground', swaggerUi.serve, swaggerUi.setup(specs, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Cek IGN API Documentation'
}));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is healthy',
    data: {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '2.0.0',
      uptime: process.uptime()
    },
    meta: {
      timestamp: new Date().toISOString(),
      request_id: req.headers['x-request-id'] || 'unknown'
    }
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/games', gameRoutes);
app.use('/api', ignRoutes);
app.use('/api/user', userRoutes);
app.use('/api/stats', statsRoutes);

// Legacy endpoints for backward compatibility
app.get('/mlbb', (req, res) => {
  res.redirect(301, `/api/check-ign/mlbb?${new URLSearchParams(req.query as any).toString()}`);
});

app.get('/genshin', (req, res) => {
  res.redirect(301, `/api/check-ign/genshin?${new URLSearchParams(req.query as any).toString()}`);
});

// Serve swagger spec
app.get('/spec', (req, res) => {
  res.json(specs);
});

// Static file serving for documentation
app.use('/docs', express.static(path.join(__dirname, '../public')));

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    meta: {
      timestamp: new Date().toISOString(),
      request_id: req.headers['x-request-id'] || 'unknown'
    }
  });
});

app.listen(PORT, () => {
  logger.info(`🚀 Cek IGN API is running on port ${PORT}`);
  logger.info(`📚 Documentation available at http://localhost:${PORT}/playground`);
  logger.info(`🔍 Health check at http://localhost:${PORT}/api/health`);
});

export default app;
