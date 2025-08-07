import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { getQuery } from '../config/database';
import { logger } from '../utils/logger';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    username: string;
    email: string;
  };
}

export async function authenticateToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
  const apiKey = req.headers['x-api-key'] as string;

  // Check API key first
  if (apiKey) {
    try {
      const user = await getQuery(
        'SELECT id, username, email FROM users WHERE api_key = ?',
        [apiKey]
      );
      
      if (user) {
        req.user = user;
        return next();
      }
    } catch (error) {
      logger.error('API key validation error:', error);
    }
  }

  // Check JWT token
  if (token) {
    try {
      const jwtSecret = process.env.JWT_SECRET || 'fallback-secret-key';
      const decoded = jwt.verify(token, jwtSecret) as any;
      const user = await getQuery(
        'SELECT id, username, email FROM users WHERE id = ?',
        [decoded.userId]
      );
      
      if (user) {
        req.user = user;
        return next();
      }
    } catch (error) {
      logger.error('JWT validation error:', error);
    }
  }

  return res.status(401).json({
    success: false,
    message: 'Authentication required',
    error: {
      name: 'UnauthorizedError',
      message: 'Please provide a valid JWT token or API key'
    },
    meta: {
      timestamp: new Date().toISOString(),
      request_id: req.headers['x-request-id'] || 'unknown'
    }
  });
}

export function optionalAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  // Try to authenticate but don't fail if no auth provided
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  const apiKey = req.headers['x-api-key'] as string;

  if (apiKey || token) {
    authenticateToken(req, res, next);
  } else {
    next();
  }
}