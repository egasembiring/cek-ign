import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";

import { port, swaggerConfig, corsConfig, nodeEnv } from "@/utils/config";
import { mlbb, genshin, freefire, pubgm, codm, coc, cor } from "@/plugins";
import { cache } from "@/utils/database";

const app = new Elysia()
  .use(swagger(swaggerConfig))
  .use(cors(corsConfig))
  .use(mlbb)
  .use(genshin)
  .use(freefire)
  .use(pubgm)
  .use(codm)
  .use(coc)
  .use(cor)
  .get("/spec", () => Bun.file("./spec.yaml"))
  .get("/", () => ({
    message: "Cek IGN API - Gaming Username Checker",
    version: "2.0.0",
    environment: nodeEnv,
    uptime: process.uptime(),
    endpoints: {
      mlbb: "/mlbb?id={id}&zone={zone}",
      genshin: "/genshin?uid={uid}",
      freefire: "/freefire?id={id}",
      pubgm: "/pubgm?id={id}",
      codm: "/codm?id={id}",
      coc: "/coc?tag={tag}",
      cor: "/cor?tag={tag}",
    },
    documentation: "/playground",
    health: "/health",
  }))
  .get("/health", () => ({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: nodeEnv,
    cache: {
      size: cache.size(),
    },
    memory: process.memoryUsage(),
  }))
  .get("/cache/stats", () => ({
    size: cache.size(),
    timestamp: new Date().toISOString(),
  }))
  .delete("/cache", () => {
    cache.clear();
    return {
      success: true,
      message: "Cache cleared successfully",
      timestamp: new Date().toISOString(),
    };
  })
  .listen(port);

console.log(`🚀 Cek IGN API is running at ${app.server?.hostname}:${app.server?.port}`);
console.log(
  `📖 Documentation available at http://${app.server?.hostname}:${app.server?.port}/playground`,
);
console.log(
  `💚 Health check available at http://${app.server?.hostname}:${app.server?.port}/health`,
);
console.log(`🌍 Environment: ${nodeEnv}`);
