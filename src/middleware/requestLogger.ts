import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger';
import { runQuery } from '../config/database';

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  // Add request ID for tracing
  req.headers['x-request-id'] = req.headers['x-request-id'] || uuidv4();
  
  const startTime = Date.now();
  
  // Log request
  logger.info('Incoming request', {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    requestId: req.headers['x-request-id']
  });

  // Override res.end to capture response details
  const originalEnd = res.end.bind(res);
  res.end = function(chunk?: any, encoding?: any, ...args: any[]) {
    const responseTime = Date.now() - startTime;
    
    // Log response
    logger.info('Request completed', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      responseTime,
      ip: req.ip,
      requestId: req.headers['x-request-id']
    });

    // Store API stats in database (async, don't block response)
    setImmediate(async () => {
      try {
        await runQuery(
          `INSERT INTO api_stats (endpoint, method, status_code, response_time, ip_address, user_agent) 
           VALUES (?, ?, ?, ?, ?, ?)`,
          [req.url, req.method, res.statusCode, responseTime, req.ip, req.get('User-Agent')]
        );
      } catch (error) {
        logger.error('Failed to store API stats:', error);
      }
    });

    return originalEnd(chunk, encoding, ...args);
  };

  next();
}