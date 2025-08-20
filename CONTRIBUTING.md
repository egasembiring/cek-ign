# Contributing to Cek IGN

🎮 Thank you for your interest in contributing to Cek IGN! This document provides guidelines for contributing to this project.

## 🚀 Getting Started

1. **Fork the repository**
2. **Clone your fork**
   ```bash
   git clone https://github.com/your-username/cek-ign.git
   cd cek-ign
   ```
3. **Install dependencies**
   ```bash
   bun install
   ```
4. **Start development server**
   ```bash
   bun run dev
   ```

## 🎯 How to Contribute

### Adding a New Game

To add support for a new game, you need to create:

1. **Handler** (`src/handlers/{game}.ts`)
2. **Plugin** (`src/plugins/{game}.ts`)
3. **Export in index** (`src/plugins/index.ts`)
4. **Use in main app** (`src/index.ts`)
5. **Update documentation** (README.md and spec.yaml)

#### Example Handler Structure:

```typescript
import { StatusMap } from "elysia";
import { NotFound } from "@/errors/NotFound";
import { fetchWithTimeout, sanitizeInput, createCacheKey } from "@/utils/helpers";
import { cache } from "@/utils/database";
import { type Response } from "@/types/Response";

type Query = {
  id: string;
  // other parameters specific to the game
};

export async function gameName({ id }: Query) {
  // Sanitize inputs
  const sanitizedId = sanitizeInput(id);

  // Check cache
  const cacheKey = createCacheKey("game_name", { id: sanitizedId });
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  // Make API request
  const hit = await fetchWithTimeout("https://api-endpoint.com", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      // other headers
    },
    body: new URLSearchParams({
      // parameters specific to the game
    }),
  });

  const response = await hit.json();

  if (!response.success) {
    throw new NotFound("Player not found");
  }

  const result = {
    success: true,
    code: StatusMap.OK,
    data: {
      game: response.productName,
      account: {
        ign: formatResponse(response.username),
        id: sanitizedId,
        // other game-specific fields
      },
    },
  };

  // Cache result
  cache.set(cacheKey, result);
  return result;
}
```

### Code Style

- Use **Prettier** for formatting: `bun run format`
- Follow **TypeScript** best practices
- Use **meaningful variable names**
- Add **type definitions** for all functions
- Include **error handling** for all API calls

### Testing

Before submitting your PR:

1. **Test locally**

   ```bash
   bun run dev
   ```

2. **Check formatting**

   ```bash
   bun run lint
   ```

3. **Test all endpoints**

   ```bash
   curl "http://localhost:6969/health"
   curl "http://localhost:6969/your-new-game?param=value"
   ```

4. **Check documentation**
   - Visit `http://localhost:6969/playground`
   - Ensure your game appears in the docs

### Documentation Updates

When adding a new game, update:

- **README.md**: Add game to supported games list and examples
- **spec.yaml**: Add OpenAPI specification for the endpoint
- **CHANGELOG.md**: Add entry for the new feature

## 📋 Pull Request Process

1. **Create a feature branch**

   ```bash
   git checkout -b feature/add-{game-name}
   ```

2. **Make your changes**
   - Add the handler, plugin, and documentation
   - Test thoroughly

3. **Commit your changes**

   ```bash
   git add .
   git commit -m "feat: add support for {Game Name}"
   ```

4. **Push to your fork**

   ```bash
   git push origin feature/add-{game-name}
   ```

5. **Create a Pull Request**
   - Use a descriptive title
   - Include screenshots of the working endpoint
   - Reference any relevant issues

## 🐛 Bug Reports

When reporting bugs, please include:

- **Description** of the issue
- **Steps to reproduce**
- **Expected behavior**
- **Actual behavior**
- **Environment details** (OS, Bun version, etc.)

## 💡 Feature Requests

For feature requests:

- **Describe the feature** and why it would be useful
- **Provide examples** of how it would work
- **Consider implementation complexity**

## 🎮 Game Support Criteria

For a game to be added to Cek IGN, it should:

- Be **popular** and widely played
- Have a **reliable API** for username verification (preferably Codashop)
- Support **consistent parameter formats**
- Have **stable API endpoints**

## 🏗️ Development Guidelines

### Project Structure

```
src/
├── handlers/     # Game-specific logic
├── plugins/      # Elysia route definitions
├── types/        # TypeScript definitions
├── utils/        # Helper functions
├── errors/       # Custom error classes
└── index.ts      # Main application
```

### Environment Variables

```bash
PORT=6969
NODE_ENV=development
API_TIMEOUT=10000
API_RETRIES=3
CORS_ORIGINS=*
```

### Error Handling

- Use custom error classes (`NotFound`, `InvalidUID`)
- Provide helpful error messages
- Return appropriate HTTP status codes

### Caching

- Cache successful responses for 5 minutes
- Use descriptive cache keys
- Handle cache misses gracefully

## 🤝 Community

- Be respectful and constructive
- Help others learn and grow
- Share knowledge and best practices
- Follow the [Code of Conduct](CODE_OF_CONDUCT.md)

## 📞 Getting Help

- **Issues**: [GitHub Issues](https://github.com/egasembiring/cek-ign/issues)
- **Discussions**: [GitHub Discussions](https://github.com/egasembiring/cek-ign/discussions)
- **Discord**: [Join our Discord](https://discord.gg/your-discord-link)

Thank you for contributing to Cek IGN! 🎮✨
