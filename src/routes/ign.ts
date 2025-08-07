import { Router } from 'express';
import Joi from 'joi';
import { GameService } from '../services/gameService';
import { 
  checkMLBB, 
  checkGenshin, 
  checkPUBGMobile, 
  checkFreeFire, 
  checkCODMobile, 
  checkValorant, 
  checkLeagueOfLegends,
  checkUnsupportedGame,
  IGNCheckResponse 
} from '../handlers/gameHandlers';
import { optionalAuth, AuthenticatedRequest } from '../middleware/auth';
import { logger } from '../utils/logger';
import { runQuery } from '../config/database';

const router = Router();

// Validation schemas
const ignCheckSchema = Joi.object({
  gameId: Joi.string().required(),
  params: Joi.object().required()
});

const bulkCheckSchema = Joi.object({
  checks: Joi.array().items(
    Joi.object({
      gameId: Joi.string().required(),
      params: Joi.object().required()
    })
  ).min(1).max(10).required()
});

/**
 * @swagger
 * /api/check-ign:
 *   post:
 *     summary: Check IGN availability for any game
 *     tags: [IGN Check]
 *     security:
 *       - bearerAuth: []
 *       - apiKey: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               gameId:
 *                 type: string
 *                 example: "mlbb"
 *               params:
 *                 type: object
 *                 example: {"id": "469123581", "zone": "2418"}
 *     responses:
 *       200:
 *         description: IGN check result
 */
router.post('/check-ign', optionalAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { error, value } = ignCheckSchema.validate(req.body);
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

    const { gameId, params } = value;
    const game = await GameService.getGameByCode(gameId);
    
    if (!game) {
      return res.status(404).json({
        success: false,
        message: 'Game not found',
        error: {
          name: 'NotFoundError',
          message: `Game with code '${gameId}' not found`
        },
        meta: {
          timestamp: new Date().toISOString(),
          request_id: req.headers['x-request-id']
        }
      });
    }

    const result = await performIGNCheck(gameId, params);
    
    // Store check history if user is authenticated
    if (req.user && result.success) {
      try {
        await runQuery(
          `INSERT INTO ign_checks (user_id, game_id, ign, user_input, is_available, response_data, ip_address)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            req.user.id,
            game.id,
            result.data?.account.ign || 'unknown',
            JSON.stringify(params),
            result.success,
            JSON.stringify(result.data),
            req.ip
          ]
        );
      } catch (dbError) {
        logger.error('Failed to store IGN check history:', dbError);
      }
    }

    res.status(result.code).json({
      ...result,
      meta: {
        timestamp: new Date().toISOString(),
        request_id: req.headers['x-request-id'],
        rate_limit: {
          remaining: 95, // Mock rate limit info
          reset_time: Math.ceil(Date.now() / 1000) + 900
        }
      }
    });
  } catch (error) {
    logger.error('IGN check error:', error);
    next(error);
  }
});

/**
 * @swagger
 * /api/check-ign/{gameId}/{ign}:
 *   get:
 *     summary: Check specific IGN for a game (simplified endpoint)
 *     tags: [IGN Check]
 *     parameters:
 *       - in: path
 *         name: gameId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: ign
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: zone
 *         schema:
 *           type: string
 *         description: Zone ID for games that require it (like MLBB)
 *     responses:
 *       200:
 *         description: IGN check result
 */
router.get('/check-ign/:gameId/:ign', optionalAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { gameId, ign } = req.params;
    const { zone } = req.query;

    const game = await GameService.getGameByCode(gameId);
    if (!game) {
      return res.status(404).json({
        success: false,
        message: 'Game not found',
        meta: {
          timestamp: new Date().toISOString(),
          request_id: req.headers['x-request-id']
        }
      });
    }

    // Build params based on game type
    let params: any = {};
    if (gameId === 'mlbb') {
      if (!zone) {
        return res.status(400).json({
          success: false,
          message: 'Zone parameter is required for Mobile Legends',
          meta: {
            timestamp: new Date().toISOString(),
            request_id: req.headers['x-request-id']
          }
        });
      }
      params = { id: ign, zone: zone as string };
    } else if (gameId === 'genshin') {
      params = { uid: ign };
    } else {
      params = { id: ign };
    }

    const result = await performIGNCheck(gameId, params);
    
    res.status(result.code).json({
      ...result,
      meta: {
        timestamp: new Date().toISOString(),
        request_id: req.headers['x-request-id'],
        rate_limit: {
          remaining: 95,
          reset_time: Math.ceil(Date.now() / 1000) + 900
        }
      }
    });
  } catch (error) {
    logger.error('IGN check error:', error);
    next(error);
  }
});

/**
 * @swagger
 * /api/bulk-check:
 *   post:
 *     summary: Check multiple IGNs at once
 *     tags: [IGN Check]
 *     security:
 *       - bearerAuth: []
 *       - apiKey: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               checks:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     gameId:
 *                       type: string
 *                     params:
 *                       type: object
 *     responses:
 *       200:
 *         description: Bulk check results
 */
router.post('/bulk-check', optionalAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { error, value } = bulkCheckSchema.validate(req.body);
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

    const { checks } = value;
    const results: any[] = [];

    for (const check of checks) {
      try {
        const game = await GameService.getGameByCode(check.gameId);
        if (!game) {
          results.push({
            gameId: check.gameId,
            success: false,
            error: { name: 'NotFoundError', message: 'Game not found' }
          });
          continue;
        }

        const result = await performIGNCheck(check.gameId, check.params);
        results.push({
          gameId: check.gameId,
          ...result
        });
      } catch (error) {
        logger.error(`Bulk check error for ${check.gameId}:`, error);
        results.push({
          gameId: check.gameId,
          success: false,
          error: { name: 'Error', message: 'Internal error occurred' }
        });
      }
    }

    res.json({
      success: true,
      message: 'Bulk check completed',
      data: {
        results,
        total_checks: checks.length,
        successful_checks: results.filter(r => r.success).length
      },
      meta: {
        timestamp: new Date().toISOString(),
        request_id: req.headers['x-request-id']
      }
    });
  } catch (error) {
    logger.error('Bulk check error:', error);
    next(error);
  }
});

// Helper function to route to correct game checker
async function performIGNCheck(gameId: string, params: any): Promise<IGNCheckResponse> {
  switch (gameId) {
    case 'mlbb':
      return await checkMLBB(params.id, params.zone);
    case 'genshin':
      return await checkGenshin(params.uid);
    case 'pubg-mobile':
      return await checkPUBGMobile(params.id);
    case 'free-fire':
      return await checkFreeFire(params.id);
    case 'cod-mobile':
      return await checkCODMobile(params.id);
    case 'valorant':
      return await checkValorant(params.riot_id || params.id);
    case 'lol':
      return await checkLeagueOfLegends(params.riot_id || params.id);
    default:
      return await checkUnsupportedGame(gameId, params);
  }
}

export { router as ignRoutes };