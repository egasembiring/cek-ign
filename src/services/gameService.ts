import { allQuery, getQuery } from '../config/database';

export interface Game {
  id: number;
  name: string;
  code: string;
  description: string;
  platform: string;
  status: string;
  endpoint?: string;
  voucher_type: string;
  voucher_price_point: string;
  price: string;
  created_at: string;
}

export class GameService {
  static async getAllGames(): Promise<Game[]> {
    return await allQuery(
      'SELECT * FROM games WHERE status = ? ORDER BY name',
      ['active']
    );
  }

  static async getGameByCode(code: string): Promise<Game | null> {
    return await getQuery(
      'SELECT * FROM games WHERE code = ? AND status = ?',
      [code, 'active']
    );
  }

  static async getGameById(id: number): Promise<Game | null> {
    return await getQuery(
      'SELECT * FROM games WHERE id = ? AND status = ?',
      [id, 'active']
    );
  }

  static async searchGames(query: string): Promise<Game[]> {
    const searchTerm = `%${query}%`;
    return await allQuery(
      `SELECT * FROM games 
       WHERE status = ? AND (
         name LIKE ? OR 
         description LIKE ? OR 
         platform LIKE ?
       )
       ORDER BY name`,
      ['active', searchTerm, searchTerm, searchTerm]
    );
  }
}