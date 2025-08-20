import { type CORSConfig } from "@elysiajs/cors";
import { type ElysiaSwaggerConfig } from "@elysiajs/swagger";

export const port = process.env.PORT || 6969;
export const nodeEnv = process.env.NODE_ENV || "development";
export const apiTimeout = parseInt(process.env.API_TIMEOUT || "10000");
export const apiRetries = parseInt(process.env.API_RETRIES || "3");

export const corsConfig: CORSConfig = {
  credentials: false,
  origin: process.env.CORS_ORIGINS?.split(",") || "*",
  methods: "GET",
};

export const swaggerConfig: ElysiaSwaggerConfig<"/playground"> = {
  path: "/playground",
  scalarConfig: {
    spec: {
      url: "/spec",
    },
    hideModels: true,
    darkMode: true,
    forceDarkModeState: "dark",
    hideDarkModeToggle: true,
    theme: "purple",
    defaultHttpClient: {
      targetKey: "javascript",
      clientKey: "fetch",
    },
  },
  documentation: {
    info: {
      title: "Cek IGN API",
      description: "API untuk mengecek In-Game Name (IGN) berbagai game populer",
      version: "2.0.0",
      contact: {
        name: "egasembiring",
        url: "https://github.com/egasembiring/cek-ign",
      },
      license: {
        name: "MIT",
        url: "https://opensource.org/licenses/MIT",
      },
    },
    externalDocs: {
      description: "GitHub Repository",
      url: "https://github.com/egasembiring/cek-ign",
    },
    tags: [
      {
        name: "MOBA Games",
        description: "Mobile Legends, Wild Rift, Arena of Valor",
      },
      {
        name: "Battle Royale",
        description: "Free Fire, PUBG Mobile, Call of Duty Mobile",
      },
      {
        name: "Strategy Games",
        description: "Clash of Clans, Clash Royale",
      },
      {
        name: "RPG Games",
        description: "Genshin Impact, Honkai series",
      },
    ],
    servers: [
      {
        url: nodeEnv === "production" ? "https://your-domain.com" : `http://localhost:${port}`,
        description: nodeEnv === "production" ? "Production server" : "Development server",
      },
    ],
  },
  exclude: ["/spec"],
};
