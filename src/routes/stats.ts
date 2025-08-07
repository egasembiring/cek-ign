import { Router } from 'express';
import { allQuery } from '../config/database';
import { logger } from '../utils/logger';

const router = Router();

/**
 * @swagger
 * /api/stats:
 *   get:
 *     summary: Get API usage statistics
 *     tags: [Statistics]
 *     responses:
 *       200:
 *         description: API usage statistics
 */
router.get('/', async (req, res, next) => {
  try {
    // Get overall API stats
    const apiStats = await allQuery(`
      SELECT 
        COUNT(*) as total_requests,
        COUNT(DISTINCT ip_address) as unique_ips,
        AVG(response_time) as avg_response_time,
        COUNT(CASE WHEN status_code >= 200 AND status_code < 300 THEN 1 END) as successful_requests,
        COUNT(CASE WHEN status_code >= 400 THEN 1 END) as error_requests
      FROM api_stats
      WHERE created_at >= datetime('now', '-24 hours')
    `);

    // Get game-specific stats
    const gameStats = await allQuery(`
      SELECT 
        g.name,
        g.code,
        COUNT(*) as check_count,
        COUNT(CASE WHEN ic.is_available = 1 THEN 1 END) as successful_checks
      FROM ign_checks ic
      JOIN games g ON ic.game_id = g.id
      WHERE ic.checked_at >= datetime('now', '-24 hours')
      GROUP BY g.id, g.name, g.code
      ORDER BY check_count DESC
    `);

    // Get most popular endpoints
    const endpointStats = await allQuery(`
      SELECT 
        endpoint,
        method,
        COUNT(*) as request_count,
        AVG(response_time) as avg_response_time
      FROM api_stats
      WHERE created_at >= datetime('now', '-24 hours')
      GROUP BY endpoint, method
      ORDER BY request_count DESC
      LIMIT 10
    `);

    // Get hourly request distribution for last 24 hours
    const hourlyStats = await allQuery(`
      SELECT 
        strftime('%H', created_at) as hour,
        COUNT(*) as request_count
      FROM api_stats
      WHERE created_at >= datetime('now', '-24 hours')
      GROUP BY strftime('%H', created_at)
      ORDER BY hour
    `);

    res.json({
      success: true,
      message: 'Statistics retrieved successfully',
      data: {
        overview: apiStats[0] || {
          total_requests: 0,
          unique_ips: 0,
          avg_response_time: 0,
          successful_requests: 0,
          error_requests: 0
        },
        games: gameStats,
        endpoints: endpointStats,
        hourly_distribution: hourlyStats,
        period: 'Last 24 hours'
      },
      meta: {
        timestamp: new Date().toISOString(),
        request_id: req.headers['x-request-id']
      }
    });
  } catch (error) {
    logger.error('Error fetching statistics:', error);
    next(error);
  }
});

/**
 * @swagger
 * /api/stats/games:
 *   get:
 *     summary: Get detailed game statistics
 *     tags: [Statistics]
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [1h, 24h, 7d, 30d]
 *           default: 24h
 *     responses:
 *       200:
 *         description: Detailed game statistics
 */
router.get('/games', async (req, res, next) => {
  try {
    const period = req.query.period as string || '24h';
    
    // Convert period to SQL interval
    const intervals: { [key: string]: string } = {
      '1h': "datetime('now', '-1 hour')",
      '24h': "datetime('now', '-24 hours')",
      '7d': "datetime('now', '-7 days')",
      '30d': "datetime('now', '-30 days')"
    };

    const interval = intervals[period] || intervals['24h'];

    const gameStats = await allQuery(`
      SELECT 
        g.id,
        g.name,
        g.code,
        g.platform,
        COUNT(*) as total_checks,
        COUNT(CASE WHEN ic.is_available = 1 THEN 1 END) as successful_checks,
        COUNT(CASE WHEN ic.is_available = 0 THEN 1 END) as failed_checks,
        ROUND(
          (COUNT(CASE WHEN ic.is_available = 1 THEN 1 END) * 100.0) / COUNT(*), 
          2
        ) as success_rate,
        COUNT(DISTINCT ic.user_id) as unique_users,
        MIN(ic.checked_at) as first_check,
        MAX(ic.checked_at) as last_check
      FROM games g
      LEFT JOIN ign_checks ic ON g.id = ic.game_id 
        AND ic.checked_at >= ${interval}
      WHERE g.status = 'active'
      GROUP BY g.id, g.name, g.code, g.platform
      ORDER BY total_checks DESC
    `);

    res.json({
      success: true,
      message: 'Game statistics retrieved successfully',
      data: {
        games: gameStats,
        period: period,
        total_games: gameStats.length
      },
      meta: {
        timestamp: new Date().toISOString(),
        request_id: req.headers['x-request-id']
      }
    });
  } catch (error) {
    logger.error('Error fetching game statistics:', error);
    next(error);
  }
});

export { router as statsRoutes };