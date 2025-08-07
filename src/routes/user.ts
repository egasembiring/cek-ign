import { Router } from 'express';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import { allQuery } from '../config/database';
import { logger } from '../utils/logger';

const router = Router();

/**
 * @swagger
 * /api/user/{userId}/history:
 *   get:
 *     summary: Get user's IGN check history
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *       - apiKey: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *     responses:
 *       200:
 *         description: User's check history
 *       403:
 *         description: Access denied
 */
router.get('/:userId/history', authenticateToken, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    // Check if user can access this history (own history or admin)
    if (req.user!.id !== parseInt(userId)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
        error: {
          name: 'ForbiddenError',
          message: 'You can only access your own history'
        },
        meta: {
          timestamp: new Date().toISOString(),
          request_id: req.headers['x-request-id']
        }
      });
    }

    const history = await allQuery(
      `SELECT 
         ic.id,
         ic.ign,
         ic.user_input,
         ic.is_available,
         ic.response_data,
         ic.checked_at,
         g.name as game_name,
         g.code as game_code,
         g.platform
       FROM ign_checks ic
       JOIN games g ON ic.game_id = g.id
       WHERE ic.user_id = ?
       ORDER BY ic.checked_at DESC
       LIMIT ? OFFSET ?`,
      [userId, limit, offset]
    );

    const total = await allQuery(
      'SELECT COUNT(*) as count FROM ign_checks WHERE user_id = ?',
      [userId]
    );

    const formattedHistory = history.map((entry: any) => ({
      id: entry.id,
      game: {
        name: entry.game_name,
        code: entry.game_code,
        platform: entry.platform
      },
      ign: entry.ign,
      user_input: JSON.parse(entry.user_input || '{}'),
      is_available: entry.is_available,
      response_data: JSON.parse(entry.response_data || '{}'),
      checked_at: entry.checked_at
    }));

    res.json({
      success: true,
      message: 'History retrieved successfully',
      data: {
        history: formattedHistory,
        pagination: {
          total: total[0].count,
          limit,
          offset,
          has_more: total[0].count > (offset + limit)
        }
      },
      meta: {
        timestamp: new Date().toISOString(),
        request_id: req.headers['x-request-id']
      }
    });
  } catch (error) {
    logger.error('Error fetching user history:', error);
    next(error);
  }
});

/**
 * @swagger
 * /api/user/profile:
 *   get:
 *     summary: Get current user profile
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *       - apiKey: []
 *     responses:
 *       200:
 *         description: User profile data
 */
router.get('/profile', authenticateToken, async (req: AuthenticatedRequest, res, next) => {
  try {
    // Get user stats
    const stats = await allQuery(
      `SELECT 
         COUNT(*) as total_checks,
         COUNT(CASE WHEN is_available = 1 THEN 1 END) as successful_checks,
         COUNT(DISTINCT game_id) as games_checked,
         MIN(checked_at) as first_check,
         MAX(checked_at) as last_check
       FROM ign_checks 
       WHERE user_id = ?`,
      [req.user!.id]
    );

    res.json({
      success: true,
      message: 'Profile retrieved successfully',
      data: {
        user: {
          id: req.user!.id,
          username: req.user!.username,
          email: req.user!.email
        },
        stats: stats[0] || {
          total_checks: 0,
          successful_checks: 0,
          games_checked: 0,
          first_check: null,
          last_check: null
        }
      },
      meta: {
        timestamp: new Date().toISOString(),
        request_id: req.headers['x-request-id']
      }
    });
  } catch (error) {
    logger.error('Error fetching user profile:', error);
    next(error);
  }
});

export { router as userRoutes };