import { Router } from 'express';
import bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import Joi from 'joi';
import { runQuery, getQuery } from '../config/database';
import { logger } from '../utils/logger';

const router = Router();

// Validation schemas
const registerSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: "johndoe"
 *               email:
 *                 type: string
 *                 example: "john@example.com"
 *               password:
 *                 type: string
 *                 example: "password123"
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error or user already exists
 */
router.post('/register', async (req, res, next) => {
  try {
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => ({
          path: detail.path.join('.'),
          message: detail.message
        })),
        meta: {
          timestamp: new Date().toISOString(),
          request_id: req.headers['x-request-id']
        }
      });
    }

    const { username, email, password } = value;

    // Check if user already exists
    const existingUser = await getQuery(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [username, email]
    );

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists',
        error: {
          name: 'ConflictError',
          message: 'Username or email already taken'
        },
        meta: {
          timestamp: new Date().toISOString(),
          request_id: req.headers['x-request-id']
        }
      });
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Generate API key
    const apiKey = uuidv4();

    // Create user
    const result = await runQuery(
      `INSERT INTO users (username, email, password_hash, api_key) 
       VALUES (?, ?, ?, ?)`,
      [username, email, passwordHash, apiKey]
    );

    // Generate JWT token
    const jwtSecret = process.env.JWT_SECRET || 'fallback-secret-key';
    const payload = { userId: result.id, username, email };
    const options = { expiresIn: process.env.JWT_EXPIRES_IN || '24h' } as jwt.SignOptions;
    const token = jwt.sign(payload, jwtSecret, options);

    logger.info('User registered successfully', { userId: result.id, username, email });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: result.id,
          username,
          email,
          api_key: apiKey,
          created_at: new Date().toISOString()
        },
        token
      },
      meta: {
        timestamp: new Date().toISOString(),
        request_id: req.headers['x-request-id']
      }
    });
  } catch (error) {
    logger.error('Registration error:', error);
    next(error);
  }
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: "john@example.com"
 *               password:
 *                 type: string
 *                 example: "password123"
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', async (req, res, next) => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => ({
          path: detail.path.join('.'),
          message: detail.message
        })),
        meta: {
          timestamp: new Date().toISOString(),
          request_id: req.headers['x-request-id']
        }
      });
    }

    const { email, password } = value;

    // Find user
    const user = await getQuery(
      'SELECT id, username, email, password_hash, api_key, created_at FROM users WHERE email = ?',
      [email]
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
        error: {
          name: 'UnauthorizedError',
          message: 'Email or password is incorrect'
        },
        meta: {
          timestamp: new Date().toISOString(),
          request_id: req.headers['x-request-id']
        }
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
        error: {
          name: 'UnauthorizedError',
          message: 'Email or password is incorrect'
        },
        meta: {
          timestamp: new Date().toISOString(),
          request_id: req.headers['x-request-id']
        }
      });
    }

    // Generate JWT token
    const jwtSecret = process.env.JWT_SECRET || 'fallback-secret-key';
    const payload = { userId: user.id, username: user.username, email: user.email };
    const options = { expiresIn: process.env.JWT_EXPIRES_IN || '24h' } as jwt.SignOptions;
    const token = jwt.sign(payload, jwtSecret, options);

    logger.info('User logged in successfully', { userId: user.id, email });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          api_key: user.api_key,
          created_at: user.created_at
        },
        token
      },
      meta: {
        timestamp: new Date().toISOString(),
        request_id: req.headers['x-request-id']
      }
    });
  } catch (error) {
    logger.error('Login error:', error);
    next(error);
  }
});

export { router as authRoutes };