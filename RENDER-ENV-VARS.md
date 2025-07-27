# 🔧 VARIÁVEIS DE AMBIENTE PARA RENDER

## 📋 COPIE E COLE NO RENDER DASHBOARD

### Environment Variables (Settings → Environment):

```bash
# Core Configuration
NODE_ENV=production
PORT=3001

# Database (Neon PostgreSQL)
DATABASE_URL=postgresql://neondb_owner:npg_0y3wizuxmvGb@ep-purple-fog-aczpctpi-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require
DIRECT_URL=postgresql://neondb_owner:npg_0y3wizuxmvGb@ep-purple-fog-aczpctpi.sa-east-1.aws.neon.tech/neondb?sslmode=require

# JWT Security
JWT_SECRET=823f291d6e616491586c90e8940e900d4aa41d3d51d5a4b603bfe2a4085aaf3e041f14c1327071a03d77bb1b11237bda423becc442362244cd48a0211b429b25
JWT_EXPIRES_IN=7d

# Frontend URL (atualizar após deploy do Vercel)
FRONTEND_URL=https://bicycle-maintenance-frontend.vercel.app
ALLOWED_ORIGINS=https://bicycle-maintenance-frontend.vercel.app

# Email Configuration (Resend)
RESEND_API_KEY=re_4snYeu4u_8SSvuNvbHM5cWRQ6Zm7p1hqL
RESEND_FROM_EMAIL=noreply@bikemanager.app
RESEND_FROM_NAME=Bicycle Maintenance

# Password Reset Settings
PASSWORD_RESET_TOKEN_EXPIRY=3600
PASSWORD_RESET_RATE_LIMIT=10

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Security
BCRYPT_SALT_ROUNDS=12

# Queue Configuration (In-memory for free tier)
EMAIL_QUEUE_NAME=email-processing
EMAIL_QUEUE_CONCURRENCY=5

# Cron Jobs
MAINTENANCE_REMINDER_ENABLED=true
MAINTENANCE_REMINDER_CRON=0 9 * * *
DEFAULT_REMINDER_DAYS=7
MAX_REMINDER_DAYS=30
```

## ⚠️ IMPORTANTE

1. **Copie uma variável por vez** no Render Dashboard
2. **FRONTEND_URL**: Atualize após deploy do Vercel
3. **RESEND_FROM_EMAIL**: Use seu domínio real quando tiver
4. **Redis não incluído**: Sistema usa fallback in-memory

## 🔄 APÓS VERCEL DEPLOY

Atualize estas variáveis com URLs reais:
- FRONTEND_URL
- ALLOWED_ORIGINS