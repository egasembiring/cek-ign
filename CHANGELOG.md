# Changelog

All notable changes to this project will be documented in this file.

## [2.0.0] - 2024-08-20

### ✨ Major Features

- **Complete API Rewrite**: Upgraded from version 1.x to 2.0.0 with comprehensive improvements
- **New Games Support**: Added support for 5 additional popular games:
  - Free Fire (`/freefire`)
  - PUBG Mobile (`/pubgm`)
  - Call of Duty Mobile (`/codm`)
  - Clash of Clans (`/coc`)
  - Clash Royale (`/cor`)

### 🚀 Performance Improvements

- **Caching System**: Implemented in-memory cache with configurable TTL to reduce API calls
- **Request Optimization**: Added fetchWithTimeout with retry mechanism and exponential backoff
- **Input Sanitization**: Enhanced security with proper input validation and sanitization

### 🛠️ Infrastructure Updates

- **Environment Configuration**: Added comprehensive environment variable support
- **Database Ready**: Prepared infrastructure for database integration (SQLite/MySQL/PostgreSQL)
- **Health Monitoring**: Added `/health` endpoint for monitoring server status
- **Cache Management**: Added `/cache/stats` and `DELETE /cache` for cache management

### 📚 Documentation & Developer Experience

- **Comprehensive README**: Complete rewrite with detailed documentation
- **Interactive API Documentation**: Enhanced Swagger/OpenAPI documentation at `/playground`
- **Code Quality**: Added Prettier for consistent code formatting
- **Better Error Handling**: Improved error messages and HTTP status codes

### 🔧 Technical Improvements

- **Updated Dependencies**: All dependencies updated to latest versions
- **TypeScript Enhancements**: Better type definitions and interfaces
- **Modular Architecture**: Improved code organization with better separation of concerns
- **Production Ready**: Added build scripts and production optimizations

### 📝 API Changes

- **New Root Endpoint**: Enhanced `/` with server status and endpoints overview
- **Consistent Response Format**: Standardized response format across all endpoints
- **Better Error Responses**: More descriptive error messages and proper HTTP status codes

### 🔒 Security

- **Input Validation**: Enhanced input validation for all parameters
- **CORS Configuration**: Configurable CORS settings via environment variables
- **Request Timeouts**: Added configurable request timeouts to prevent hanging requests

## [1.0.50] - Previous Version

### Features

- Mobile Legends: Bang Bang support (`/mlbb`)
- Genshin Impact support (`/genshin`)
- Basic API documentation
- Simple error handling
