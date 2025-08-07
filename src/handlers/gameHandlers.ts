import { logger } from '../utils/logger';

export interface IGNCheckResponse {
  success: boolean;
  code: number;
  data?: {
    game: string;
    account: {
      ign: string;
      [key: string]: any;
    };
  };
  error?: {
    name: string;
    message: string;
  };
}

// Base interface for codashop response
interface CodeshopResponse {
  success?: boolean;
  errorCode?: string;
  confirmationFields?: {
    productName: string;
    username: string;
    [key: string]: any;
  };
  user?: {
    userId: string;
    zoneId: string;
  };
}

class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

export async function checkMLBB(id: string, zone: string): Promise<IGNCheckResponse> {
  try {
    const response = await fetch("https://order-sg.codashop.com/initPayment.action", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Origin: "https://www.codashop.com",
        Referer: "https://www.codashop.com/",
      },
      body: new URLSearchParams({
        "voucherPricePoint.id": "27684",
        "voucherPricePoint.price": "527250",
        "voucherPricePoint.variablePrice": "0",
        "user.userId": id,
        "user.zoneId": zone,
        voucherTypeName: "MOBILE_LEGENDS",
        shopLang: "id_ID",
      }),
    });

    const data = await response.json() as CodeshopResponse;

    if (!data.success) {
      throw new NotFoundError("IGN Tidak Ditemukan");
    }

    return {
      success: true,
      code: 200,
      data: {
        game: data.confirmationFields!.productName,
        account: {
          ign: data.confirmationFields!.username.replace(/\+/g, " "),
          id: data.user!.userId,
          zone: data.user!.zoneId,
        },
      },
    };
  } catch (error) {
    logger.error('MLBB check error:', error);
    if (error instanceof NotFoundError) {
      return {
        success: false,
        code: 404,
        error: {
          name: 'Not Found',
          message: error.message
        }
      };
    }
    throw error;
  }
}

export async function checkGenshin(uid: string): Promise<IGNCheckResponse> {
  try {
    const server = getGenshinServer(uid);
    
    const response = await fetch("https://order-sg.codashop.com/initPayment.action", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Origin: "https://www.codashop.com",
        Referer: "https://www.codashop.com/",
      },
      body: new URLSearchParams({
        "voucherPricePoint.id": "116054",
        "voucherPricePoint.price": "16500",
        "voucherPricePoint.variablePrice": "0",
        "user.userId": uid,
        "user.zoneId": server,
        voucherTypeName: "GENSHIN_IMPACT",
        shopLang: "id_ID",
      }),
    });

    const data = await response.json() as CodeshopResponse;

    if (data.errorCode === "-100") {
      throw new NotFoundError("IGN Tidak Ditemukan");
    }

    return {
      success: true,
      code: 200,
      data: {
        game: data.confirmationFields!.productName,
        account: {
          ign: data.confirmationFields!.username,
          uid: data.user!.userId,
          server: renderGenshinServer(data.user!.zoneId),
        },
      },
    };
  } catch (error) {
    logger.error('Genshin check error:', error);
    if (error instanceof NotFoundError) {
      return {
        success: false,
        code: 404,
        error: {
          name: 'Not Found',
          message: error.message
        }
      };
    }
    throw error;
  }
}

// New game handlers using generic codashop method
export async function checkPUBGMobile(id: string): Promise<IGNCheckResponse> {
  return await checkCodeshopGame(id, "194305", "16500", "PUBG_MOBILE", "PUBG Mobile");
}

export async function checkFreeFire(id: string): Promise<IGNCheckResponse> {
  return await checkCodeshopGame(id, "46741", "16500", "FREE_FIRE", "Free Fire");
}

export async function checkCODMobile(id: string): Promise<IGNCheckResponse> {
  return await checkCodeshopGame(id, "242461", "16500", "CALL_OF_DUTY_MOBILE", "Call of Duty Mobile");
}

export async function checkValorant(riot_id: string): Promise<IGNCheckResponse> {
  return await checkCodeshopGame(riot_id, "297513", "105000", "VALORANT", "Valorant");
}

export async function checkLeagueOfLegends(riot_id: string): Promise<IGNCheckResponse> {
  return await checkCodeshopGame(riot_id, "59721", "105000", "LEAGUE_OF_LEGENDS", "League of Legends");
}

// Generic function for codashop-supported games
async function checkCodeshopGame(
  userId: string, 
  voucherPricePointId: string, 
  price: string, 
  voucherTypeName: string, 
  gameName: string,
  zoneId: string = "os_001"
): Promise<IGNCheckResponse> {
  try {
    const response = await fetch("https://order-sg.codashop.com/initPayment.action", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Origin: "https://www.codashop.com",
        Referer: "https://www.codashop.com/",
      },
      body: new URLSearchParams({
        "voucherPricePoint.id": voucherPricePointId,
        "voucherPricePoint.price": price,
        "voucherPricePoint.variablePrice": "0",
        "user.userId": userId,
        "user.zoneId": zoneId,
        voucherTypeName: voucherTypeName,
        shopLang: "id_ID",
      }),
    });

    const data = await response.json() as CodeshopResponse;

    if (!data.success || data.errorCode === "-100") {
      throw new NotFoundError("IGN Tidak Ditemukan");
    }

    return {
      success: true,
      code: 200,
      data: {
        game: data.confirmationFields?.productName || gameName,
        account: {
          ign: data.confirmationFields?.username || "Hidden",
          id: data.user?.userId || userId,
        },
      },
    };
  } catch (error) {
    logger.error(`${gameName} check error:`, error);
    if (error instanceof NotFoundError) {
      return {
        success: false,
        code: 404,
        error: {
          name: 'Not Found',
          message: error.message
        }
      };
    }
    throw error;
  }
}

// For games not supported by codashop, return mock responses
export async function checkUnsupportedGame(gameId: string, userInput: any): Promise<IGNCheckResponse> {
  // These games don't have direct API support yet
  const gameNames: { [key: string]: string } = {
    'dota2': 'Dota 2',
    'cs2': 'Counter-Strike 2',
    'apex': 'Apex Legends',
    'fortnite': 'Fortnite',
    'minecraft': 'Minecraft',
    'roblox': 'Roblox',
    'fifa-mobile': 'FIFA Mobile',
    'efootball': 'eFootball'
  };

  return {
    success: false,
    code: 501,
    error: {
      name: 'Not Implemented',
      message: `IGN checking for ${gameNames[gameId] || gameId} is not yet supported`
    }
  };
}

// Genshin Impact helper functions
function getGenshinServer(uid: string): string {
  const serverMap: { [key: string]: string } = {
    '6': 'os_usa',
    '7': 'os_euro',
    '8': 'os_asia',
    '9': 'os_cht'
  };
  
  const firstDigit = uid.charAt(0);
  return serverMap[firstDigit] || 'os_asia';
}

function renderGenshinServer(code: string): string {
  const serverNames: { [key: string]: string } = {
    'os_usa': 'America',
    'os_euro': 'Europe',
    'os_asia': 'Asia',
    'os_cht': 'TW_HK_MO'
  };
  
  return serverNames[code] || 'Asia';
}
