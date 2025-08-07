import { Router } from 'express';
import { GameService } from '../services/gameService';
import { logger } from '../utils/logger';

const router = Router();

/**
 * @swagger
 * /api/games:
 *   get:
 *     summary: Get all supported games
 *     tags: [Games]
 *     responses:
 *       200:
 *         description: List of all supported games
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Game'
 */
router.get('/', async (req, res, next) => {
  try {
    const games = await GameService.getAllGames();
    
    res.json({
      success: true,
      message: 'Games retrieved successfully',
      data: games.map(game => ({
        id: game.id,
        name: game.name,
        code: game.code,
        description: game.description,
        platform: game.platform,
        status: game.status
      })),
      meta: {
        timestamp: new Date().toISOString(),
        request_id: req.headers['x-request-id'],
        total_count: games.length
      }
    });
  } catch (error) {
    logger.error('Error fetching games:', error);
    next(error);
  }
});

/**
 * @swagger
 * /api/games/{gameId}:
 *   get:
 *     summary: Get specific game details
 *     tags: [Games]
 *     parameters:
 *       - in: path
 *         name: gameId
 *         required: true
 *         schema:
 *           type: string
 *         description: Game code (e.g., mlbb, genshin)
 *     responses:
 *       200:
 *         description: Game details
 *       404:
 *         description: Game not found
 */
router.get('/:gameId', async (req, res, next) => {
  try {
    const { gameId } = req.params;
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

    res.json({
      success: true,
      message: 'Game details retrieved successfully',
      data: {
        id: game.id,
        name: game.name,
        code: game.code,
        description: game.description,
        platform: game.platform,
        status: game.status,
        created_at: game.created_at
      },
      meta: {
        timestamp: new Date().toISOString(),
        request_id: req.headers['x-request-id']
      }
    });
  } catch (error) {
    logger.error('Error fetching game details:', error);
    next(error);
  }
});

/**
 * @swagger
 * /api/games/search:
 *   get:
 *     summary: Search games
 *     tags: [Games]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query
 *     responses:
 *       200:
 *         description: Search results
 */
router.get('/search', async (req, res, next) => {
  try {
    const { q } = req.query;
    
    if (!q || typeof q !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Search query is required',
        error: {
          name: 'ValidationError',
          message: 'Please provide a search query parameter "q"'
        },
        meta: {
          timestamp: new Date().toISOString(),
          request_id: req.headers['x-request-id']
        }
      });
    }

    const games = await GameService.searchGames(q);
    
    res.json({
      success: true,
      message: 'Search completed successfully',
      data: games.map(game => ({
        id: game.id,
        name: game.name,
        code: game.code,
        description: game.description,
        platform: game.platform,
        status: game.status
      })),
      meta: {
        timestamp: new Date().toISOString(),
        request_id: req.headers['x-request-id'],
        total_count: games.length,
        search_query: q
      }
    });
  } catch (error) {
    logger.error('Error searching games:', error);
    next(error);
  }
});

export { router as gameRoutes };