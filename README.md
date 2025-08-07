# Cek IGN API - Complete REST API for Game IGN Checking

A comprehensive REST API for checking IGN (In-Game Name) availability across multiple popular games. Built with Node.js, Express, and SQLite for maximum compatibility with shared hosting environments like cPanel.

## 🎮 Supported Games

- **Mobile Legends: Bang Bang** - MOBA mobile game
- **Genshin Impact** - Action RPG
- **PUBG Mobile** - Battle royale mobile
- **Free Fire** - Battle royale mobile  
- **Call of Duty Mobile** - FPS mobile
- **Valorant** - FPS PC
- **League of Legends** - MOBA PC
- **Dota 2** - MOBA PC *(coming soon)*
- **Counter-Strike 2** - FPS PC *(coming soon)*
- **Apex Legends** - Battle royale *(coming soon)*
- **Fortnite** - Battle royale *(coming soon)*
- **Minecraft** - Sandbox game *(coming soon)*
- **Roblox** - Platform game *(coming soon)*
- **FIFA Mobile** - Sports mobile *(coming soon)*
- **eFootball** - Sports mobile *(coming soon)*

## 🚀 Features

### Core Features
- ✅ **IGN Checking** - Check username availability across supported games
- ✅ **User Authentication** - JWT-based authentication with API keys
- ✅ **Rate Limiting** - Configurable rate limiting per IP/user
- ✅ **Request History** - Track all IGN checks with full history
- ✅ **Bulk Checking** - Check multiple IGNs in a single request
- ✅ **Statistics** - Comprehensive API usage statistics
- ✅ **Caching** - Built-in caching for improved performance

### Security Features
- 🔒 **Input Validation** - Joi-based request validation
- 🔒 **SQL Injection Protection** - Parameterized queries
- 🔒 **Security Headers** - Helmet.js security middleware
- 🔒 **CORS Configuration** - Configurable CORS settings
- 🔒 **Password Hashing** - bcryptjs for secure password storage

### Documentation & Monitoring
- 📚 **Swagger Documentation** - Interactive API documentation
- 📊 **Request Logging** - Winston-based logging
- 📈 **API Analytics** - Detailed usage metrics
- 🏥 **Health Checks** - API health monitoring

## 🛠️ Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Local Development

1. **Clone the repository**
```bash
git clone https://github.com/egasembiring/cek-ign.git
cd cek-ign
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Build the application**
```bash
npm run build
```

5. **Start development server**
```bash
npm run dev
```

The API will be available at `http://localhost:6969`

### Production Deployment

1. **Build for production**
```bash
npm run build
```

2. **Start with PM2**
```bash
npm install -g pm2
pm2 start ecosystem.config.js
```

## 🏠 cPanel Hosting Setup

### 1. Node.js Application Setup
1. Login to cPanel
2. Go to "Node.js App" or "Node.js Selector"
3. Create a new Node.js application:
   - **Node.js version**: 18.x or higher
   - **Application root**: `public_html/api` (or your preferred directory)
   - **Application URL**: `yourdomain.com/api`
   - **Startup file**: `dist/index.js`

### 2. File Upload
1. Upload all files to your application root directory
2. Ensure the following structure:
```
public_html/api/
├── dist/           # Compiled JavaScript
├── database/       # SQLite database files
├── logs/          # Log files
├── .env           # Environment variables
├── package.json
└── ecosystem.config.js
```

### 3. Environment Configuration
Create `.env` file in your application root:
```env
PORT=6969
NODE_ENV=production
DATABASE_PATH=./database/cek_ign.db
JWT_SECRET=your-super-secret-jwt-key-change-this
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
CORS_ORIGIN=*
```

### 4. Dependencies Installation
In cPanel Terminal or SSH:
```bash
cd public_html/api
npm install --only=production
```

### 5. Start the Application
```bash
npm start
# or with PM2
pm2 start ecosystem.config.js
```

## 📖 API Documentation

### Base URL
- **Development**: `http://localhost:6969`
- **Production**: `https://yourdomain.com/api`

### Interactive Documentation
Visit `/playground` for Swagger UI documentation:
- **Local**: `http://localhost:6969/playground`
- **Production**: `https://yourdomain.com/api/playground`

### Authentication

#### JWT Token Authentication
```bash
# Include in Authorization header
Authorization: Bearer <your-jwt-token>
```

#### API Key Authentication
```bash
# Include in X-API-Key header
X-API-Key: <your-api-key>
```

### Core Endpoints

#### Authentication
```http
POST /api/auth/register    # Register new user
POST /api/auth/login       # Login user
```

#### Games
```http
GET  /api/games           # List all supported games
GET  /api/games/:gameId   # Get specific game details
GET  /api/games/search    # Search games
```

#### IGN Checking
```http
POST /api/check-ign                    # Check IGN (flexible)
GET  /api/check-ign/:gameId/:ign       # Quick IGN check
POST /api/bulk-check                   # Bulk IGN checking
```

#### User Management
```http
GET  /api/user/profile           # Get user profile
GET  /api/user/:userId/history   # Get user's check history
```

#### Statistics
```http
GET  /api/stats              # General API statistics
GET  /api/stats/games        # Game-specific statistics
```

#### Health Check
```http
GET  /api/health            # API health status
```

## 📝 Usage Examples

### Register User
```javascript
const response = await fetch('/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'johndoe',
    email: 'john@example.com',
    password: 'password123'
  })
});
```

### Check MLBB IGN
```javascript
const response = await fetch('/api/check-ign', {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json',
    'Authorization': 'Bearer <your-token>'
  },
  body: JSON.stringify({
    gameId: 'mlbb',
    params: {
      id: '469123581',
      zone: '2418'
    }
  })
});
```

### Check Genshin Impact UID
```javascript
const response = await fetch('/api/check-ign/genshin/800081806');
```

### Bulk Check Multiple Games
```javascript
const response = await fetch('/api/bulk-check', {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json',
    'Authorization': 'Bearer <your-token>'
  },
  body: JSON.stringify({
    checks: [
      { gameId: 'mlbb', params: { id: '469123581', zone: '2418' } },
      { gameId: 'genshin', params: { uid: '800081806' } },
      { gameId: 'pubg-mobile', params: { id: '5123456789' } }
    ]
  })
});
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `6969` |
| `NODE_ENV` | Environment | `development` |
| `DATABASE_PATH` | SQLite database path | `./database/cek_ign.db` |
| `JWT_SECRET` | JWT signing secret | **Required** |
| `JWT_EXPIRES_IN` | JWT expiration time | `24h` |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | `900000` (15 min) |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | `100` |
| `CORS_ORIGIN` | CORS allowed origins | `*` |
| `LOG_LEVEL` | Logging level | `info` |

### Rate Limiting
Default: 100 requests per 15 minutes per IP
- Configurable via environment variables
- Different limits for authenticated vs anonymous users
- Bypass available for API key users

## 🗃️ Database Schema

The API uses SQLite with the following main tables:

- **users** - User accounts and API keys
- **games** - Supported games configuration
- **ign_checks** - IGN check history
- **api_stats** - API usage statistics
- **rate_limits** - Rate limiting data

## 📊 Monitoring & Analytics

### Built-in Statistics
- Total API requests
- Response times
- Success/error rates
- Game-specific usage
- User activity patterns

### Logging
- Request/response logging
- Error tracking
- Performance metrics
- Security events

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🐛 Issue Reporting

Please report issues on [GitHub Issues](https://github.com/egasembiring/cek-ign/issues) with:
- Detailed description
- Steps to reproduce
- Expected vs actual behavior
- Environment details

## 📞 Support

- **Documentation**: `/playground` endpoint
- **GitHub**: [Issues](https://github.com/egasembiring/cek-ign/issues)
- **Email**: support@cek-ign.com

---

Built with ❤️ for the gaming community
