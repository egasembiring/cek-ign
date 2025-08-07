# Cek IGN API - cPanel Deployment Guide

## Prerequisites
- cPanel with Node.js support (version 18+)
- Access to Terminal/SSH
- File Manager access

## Step 1: Upload Files
1. Build the project locally:
   ```bash
   npm run build
   ```
2. Upload the following to your cPanel file manager:
   - `dist/` directory (compiled code)
   - `database/` directory
   - `package.json`
   - `ecosystem.config.js`
   - `.env` (configured)
   - `.htaccess`

## Step 2: Configure Node.js Application
1. Go to cPanel → Node.js App
2. Create a new application:
   - **Node.js version**: 18.x or higher
   - **Application root**: `public_html/api` (or your directory)
   - **Application URL**: `yourdomain.com/api`
   - **Startup file**: `dist/index.js`
   - **Application mode**: Production

## Step 3: Environment Variables
Set these in the Node.js app configuration:
- `NODE_ENV=production`
- `PORT=6969` (or port assigned by cPanel)
- `JWT_SECRET=your-secure-secret-key`
- `DATABASE_PATH=./database/cek_ign.db`

## Step 4: Install Dependencies
In Terminal:
```bash
cd ~/public_html/api
npm install --only=production
```

## Step 5: Start Application
```bash
npm start
```

## Troubleshooting

### Common Issues:
1. **Port conflicts**: Use cPanel assigned port
2. **File permissions**: Ensure database directory is writable
3. **Module not found**: Run `npm install` in app directory

### Logs:
- Check `logs/combined.log` for application logs
- Check cPanel error logs for server issues

### Performance Optimization:
- Enable compression in cPanel
- Use PM2 for process management
- Configure proper caching headers