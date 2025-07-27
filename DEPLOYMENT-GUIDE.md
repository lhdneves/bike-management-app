# 🚀 Production Deployment Guide

This guide covers deploying the Bicycle Maintenance System to production using recommended platforms.

## 📋 Deployment Stack

- **Frontend**: Vercel (Next.js hosting)
- **Backend**: Railway (Node.js hosting)
- **Database**: Neon PostgreSQL (already configured)
- **Redis**: Railway Redis or Upstash
- **Email**: Resend (already configured)
- **DNS**: Cloudflare (recommended)
- **Monitoring**: Sentry + Railway logs

## 🔧 Pre-Deployment Setup

### 1. Domain Setup
```bash
# Purchase domain from registrar (Namecheap, GoDaddy, etc.)
# Configure DNS to point to:
# - Frontend: Vercel nameservers
# - Backend: Railway/custom domain
```

### 2. SSL Certificate
- Vercel handles SSL automatically
- Railway provides SSL for custom domains
- Use Cloudflare for additional security

### 3. Environment Variables Security
```bash
# Generate secure JWT secret (min 32 characters)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Update production environment files
cp backend/.env.production.example backend/.env.production
cp frontend/.env.production.example frontend/.env.production
```

## 🏗️ Platform Setup

### 1. Frontend Deployment (Vercel)

#### Option A: Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy from project root
cd frontend
vercel --prod

# Configure environment variables in Vercel dashboard
```

#### Option B: GitHub Integration
1. Connect GitHub repository to Vercel
2. Set build settings:
   - Framework: Next.js
   - Build Command: `cd frontend && npm run build`
   - Output Directory: `frontend/.next`
   - Install Command: `cd frontend && npm ci`

3. Configure environment variables:
   ```
   NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com/api
   NEXT_PUBLIC_APP_NAME=Bike Manager
   NODE_ENV=production
   ```

### 2. Backend Deployment (Railway)

#### Option A: Railway CLI
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Initialize project
railway init

# Deploy
railway up

# Add Redis service
railway add redis

# Configure custom domain
railway domain add api.yourdomain.com
```

#### Option B: GitHub Integration
1. Connect GitHub repository to Railway
2. Create new project from repository
3. Configure build settings in `railway.json`
4. Add Redis service
5. Configure environment variables:
   ```
   DATABASE_URL=your-neon-pooled-url
   DIRECT_URL=your-neon-direct-url
   JWT_SECRET=your-generated-secret
   RESEND_API_KEY=your-resend-key
   REDIS_URL=redis://default:password@redis.railway.internal:6379
   FRONTEND_URL=https://yourdomain.com
   NODE_ENV=production
   ```

### 3. Database Setup (Neon)
```bash
# Run migrations on production
cd backend
npx prisma migrate deploy

# Verify connection
npx prisma studio
```

## 🔒 Security Configuration

### 1. Environment Variables Checklist
- [ ] Strong JWT secret (32+ characters)
- [ ] Production database URLs
- [ ] Secure Redis connection
- [ ] Production frontend URL
- [ ] Rate limiting enabled
- [ ] HTTPS-only cookies

### 2. Network Security
- [ ] CORS configured for production domains
- [ ] Rate limiting active
- [ ] SSL/HTTPS enforced
- [ ] Security headers set

### 3. Database Security
- [ ] Connection pooling enabled
- [ ] SSL mode required
- [ ] Limited connection string exposure

## 📊 Monitoring Setup

### 1. Application Monitoring
```bash
# Add Sentry for error tracking
npm install @sentry/node @sentry/nextjs

# Configure in backend/src/index.ts
import * as Sentry from "@sentry/node";
Sentry.init({ dsn: process.env.SENTRY_DSN });

# Configure in frontend/next.config.js
const { withSentryConfig } = require("@sentry/nextjs");
```

### 2. Performance Monitoring
- Railway provides built-in metrics
- Vercel Analytics for frontend performance
- Neon dashboard for database metrics

### 3. Log Management
```bash
# Railway logs
railway logs

# Structured logging in production
npm install winston
```

## 🚀 Deployment Process

### 1. Initial Deployment
```bash
# 1. Test locally
npm run test
npm run build

# 2. Deploy backend
railway up
railway domain add api.yourdomain.com

# 3. Deploy frontend
vercel --prod
vercel domains add yourdomain.com

# 4. Run database migrations
railway run npx prisma migrate deploy

# 5. Verify deployments
curl https://api.yourdomain.com/health
curl https://yourdomain.com
```

### 2. CI/CD Pipeline
The included GitHub Actions workflow will:
1. Run tests on every push
2. Deploy backend to Railway (main branch)
3. Deploy frontend to Vercel (main branch)

### 3. Rollback Strategy
```bash
# Railway rollback
railway rollback

# Vercel rollback
vercel rollback

# Database migration rollback
npx prisma migrate reset --force
```

## 🔧 Configuration Updates

### Backend (Railway)
Update `backend/src/index.ts` for production:
```typescript
// CORS configuration
app.use(cors({
  origin: [
    'https://yourdomain.com',
    'https://www.yourdomain.com'
  ],
  credentials: true,
}));

// Swagger configuration
const swaggerOptions = {
  definition: {
    servers: [
      {
        url: 'https://api.yourdomain.com/api',
        description: 'Production server',
      },
    ],
  },
};
```

### Frontend (Vercel)
Update `frontend/src/utils/api.ts`:
```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.yourdomain.com/api';
```

## 📈 Performance Optimization

### 1. Database Optimization
- Use connection pooling (already configured with Neon)
- Optimize queries with indexes
- Monitor query performance

### 2. Backend Optimization
```typescript
// Compression middleware
app.use(compression());

// Static file serving
app.use('/uploads', express.static('uploads', {
  maxAge: '1y',
  etag: false
}));
```

### 3. Frontend Optimization
- Enable Next.js Image Optimization
- Use dynamic imports for code splitting
- Configure caching headers

## 💰 Cost Optimization

### Estimated Monthly Costs:
- **Vercel Pro**: $20/month (includes custom domains, analytics)
- **Railway**: $5-20/month (depends on usage)
- **Neon**: $19/month (for production tier)
- **Domain**: $10-15/year
- **Total**: ~$50-60/month for production-ready setup

### Cost-Saving Tips:
1. Use Vercel Hobby plan initially (free with limitations)
2. Monitor Railway usage and scale as needed
3. Use Cloudflare for DNS and CDN (free tier)
4. Implement efficient caching strategies

## 🛠️ Troubleshooting

### Common Issues:

1. **CORS Errors**
   ```typescript
   // Ensure production domains are in CORS whitelist
   origin: ['https://yourdomain.com', 'https://api.yourdomain.com']
   ```

2. **Database Connection Issues**
   ```bash
   # Check connection strings
   # Verify SSL mode in DATABASE_URL
   ```

3. **Email Delivery Issues**
   ```bash
   # Verify Resend API key
   # Check from email domain verification
   ```

4. **Build Failures**
   ```bash
   # Check Node.js version compatibility
   # Verify environment variables
   # Review build logs
   ```

## 📞 Support Resources

- **Railway**: https://railway.app/help
- **Vercel**: https://vercel.com/support
- **Neon**: https://neon.tech/docs
- **Resend**: https://resend.com/docs

## 🔄 Maintenance Tasks

### Weekly:
- Monitor error rates in Sentry
- Review performance metrics
- Check database query performance

### Monthly:
- Update dependencies
- Review security alerts
- Backup database
- Monitor costs

### Quarterly:
- Security audit
- Performance optimization review
- Cost optimization analysis

---

🎉 **Deployment Complete!** Your bicycle maintenance system is now running in production with enterprise-grade reliability and security.