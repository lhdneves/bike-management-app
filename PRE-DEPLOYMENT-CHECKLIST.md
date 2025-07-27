# 🚀 Pre-Deployment Checklist - Bicycle Maintenance System

## Overview
This checklist ensures your bicycle maintenance system is production-ready before deploying to free tier hosting platforms. Complete each section systematically to avoid deployment issues.

**System Stack:**
- Frontend: Next.js 14 → Vercel (Free Tier)
- Backend: Node.js/Express/TypeScript → Railway (Free Tier)
- Database: PostgreSQL → Neon (Free Tier)
- Email: Resend Service
- Background Jobs: Bull queue with in-memory fallback

---

## 1. 🧹 Code Preparation and Optimization

### 1.1 Backend Code Review (Priority: HIGH, Time: 2-3 hours)

- [ ] **Remove Development/Debug Code**
  ```bash
  # Search for console.log statements
  cd backend && grep -r "console\.log" src/ --exclude-dir=node_modules
  
  # Search for TODO/FIXME comments
  grep -r "TODO\|FIXME" src/ --exclude-dir=node_modules
  
  # Check for hardcoded URLs
  grep -r "localhost\|127\.0\.0\.1" src/ --exclude-dir=node_modules
  ```
  **Action:** Remove or replace all hardcoded development URLs

- [ ] **Optimize Database Queries**
  ```bash
  # Review Prisma queries for N+1 problems
  grep -r "findMany\|findFirst" src/ | grep -v "include:"
  ```
  **Action:** Add `include` statements for related data where needed

- [ ] **Update Production URLs**
  ```typescript
  // backend/src/index.ts - lines 48-84
  // Verify CORS origins are configurable
  // Verify Swagger servers use environment variables
  ```

### 1.2 Frontend Code Review (Priority: HIGH, Time: 1-2 hours)

- [ ] **API Endpoint Configuration**
  ```bash
  # Check for hardcoded API URLs
  cd frontend && grep -r "localhost\|127\.0\.0\.1" src/
  
  # Verify environment variable usage
  grep -r "NEXT_PUBLIC_API_BASE_URL" src/
  ```

- [ ] **Remove Debug Code**
  ```bash
  # Search for console statements
  grep -r "console\." src/ --exclude-dir=node_modules
  ```

- [ ] **Optimize Bundle Size**
  ```bash
  # Analyze bundle
  npm run build
  npx @next/bundle-analyzer
  ```

### 1.3 Build Verification (Priority: HIGH, Time: 30 minutes)

- [ ] **Backend Build Test**
  ```bash
  cd backend
  npm run build
  # Verify dist/ directory created
  # Check for TypeScript errors
  ```

- [ ] **Frontend Build Test**
  ```bash
  cd frontend
  npm run build
  # Verify .next/ directory created
  # Check for build warnings/errors
  ```

- [ ] **Root Build Test**
  ```bash
  # From project root
  npm run build
  # Verify both frontend and backend build successfully
  ```

---

## 2. 🔒 Environment Variables Audit

### 2.1 Backend Environment Setup (Priority: CRITICAL, Time: 45 minutes)

- [ ] **Generate Secure JWT Secret**
  ```bash
  # Generate 32-character secure secret
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
  **Action:** Update `.env.production` with generated secret

- [ ] **Database URLs Verification**
  - [ ] Neon PostgreSQL connection strings ready
  - [ ] SSL mode enabled (`?sslmode=require`)
  - [ ] Pooled and direct URLs configured
  ```bash
  # Test database connection
  cd backend && node -e "
  require('dotenv').config();
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();
  prisma.\$connect().then(() => console.log('✅ Database connected')).catch(console.error);
  "
  ```

- [ ] **Email Configuration (Resend)**
  - [ ] Resend API key obtained
  - [ ] Domain verification completed (if using custom domain)
  - [ ] From email address verified
  ```bash
  # Test email service
  cd backend && npm run test -- --testNamePattern="email"
  ```

- [ ] **Security Settings**
  ```env
  # Verify these are set for production:
  BCRYPT_SALT_ROUNDS=12
  RATE_LIMIT_WINDOW_MS=900000
  RATE_LIMIT_MAX_REQUESTS=50  # Reduced for production
  PASSWORD_RESET_RATE_LIMIT=5
  ```

- [ ] **Production Environment File**
  ```bash
  # Create production environment file
  cp backend/.env.production.example backend/.env.production
  # Fill in all required values
  ```

### 2.2 Frontend Environment Setup (Priority: HIGH, Time: 15 minutes)

- [ ] **API Configuration**
  ```env
  # frontend/.env.production
  NEXT_PUBLIC_API_BASE_URL=https://your-api-domain.railway.app/api
  NEXT_PUBLIC_APP_NAME=Bicycle Maintenance System
  NODE_ENV=production
  ```

- [ ] **Remove Development Variables**
  ```bash
  # Ensure no localhost URLs in production config
  grep -v "localhost" frontend/.env.production.example > frontend/.env.production
  ```

### 2.3 Environment Variables Security Check (Priority: CRITICAL, Time: 15 minutes)

- [ ] **Sensitive Data Audit**
  ```bash
  # Check for exposed secrets in git
  git log --all --full-history -- "**/.env*"
  
  # Verify .env files are in .gitignore
  cat .gitignore | grep -E "\.env|\.env\.*"
  ```

- [ ] **Production Secrets Strength**
  - [ ] JWT_SECRET: minimum 32 characters, cryptographically secure
  - [ ] Database passwords: strong complexity
  - [ ] API keys: valid and not exposed

---

## 3. 🛡️ Security Hardening

### 3.1 Application Security (Priority: HIGH, Time: 1 hour)

- [ ] **Security Headers Verification**
  ```typescript
  // backend/src/index.ts - Verify helmet() is configured
  // Check CORS settings for production domains only
  ```

- [ ] **Rate Limiting Configuration**
  ```bash
  # Test rate limiting
  cd backend && npm run test -- --testNamePattern="rate"
  ```

- [ ] **Input Validation**
  ```bash
  # Check express-validator usage
  grep -r "body\|param\|query" backend/src/routes/
  ```

- [ ] **Authentication Security**
  ```bash
  # Verify JWT implementation
  cd backend && npm run test -- --testNamePattern="auth"
  ```

### 3.2 Database Security (Priority: HIGH, Time: 30 minutes)

- [ ] **Database Access Control**
  ```sql
  -- Verify Neon database user has minimal required permissions
  -- Check connection limits and SSL enforcement
  ```

- [ ] **Query Security**
  ```bash
  # Check for SQL injection vulnerabilities
  grep -r "query\|sql" backend/src/ | grep -v "prisma"
  ```

- [ ] **Migration Security**
  ```bash
  # Verify no sensitive data in migrations
  cd backend && find prisma/migrations -name "*.sql" -exec grep -l "password\|secret\|key" {} \;
  ```

### 3.3 Dependency Security (Priority: MEDIUM, Time: 30 minutes)

- [ ] **Security Audit**
  ```bash
  # Backend security audit
  cd backend && npm audit --audit-level=moderate
  
  # Frontend security audit
  cd frontend && npm audit --audit-level=moderate
  
  # Fix any critical/high vulnerabilities
  npm audit fix
  ```

- [ ] **Dependency Updates**
  ```bash
  # Check for outdated packages
  cd backend && npm outdated
  cd frontend && npm outdated
  
  # Update patch versions only for stability
  npm update --save
  ```

---

## 4. ⚡ Performance Optimization

### 4.1 Backend Performance (Priority: MEDIUM, Time: 1 hour)

- [ ] **Database Query Optimization**
  ```bash
  # Review slow queries in Prisma
  cd backend && grep -r "findMany\|findFirst" src/ | wc -l
  ```

- [ ] **Caching Implementation**
  ```typescript
  // Verify compression middleware is enabled
  // Check if response caching is implemented where appropriate
  ```

- [ ] **Memory Usage Optimization**
  ```bash
  # Check for memory leaks
  cd backend && npm run test:coverage
  ```

### 4.2 Frontend Performance (Priority: MEDIUM, Time: 45 minutes)

- [ ] **Bundle Size Optimization**
  ```bash
  cd frontend && npm run build
  # Check bundle size report
  # Verify tree shaking is working
  ```

- [ ] **Image Optimization**
  ```bash
  # Check for unoptimized images
  find frontend/public -name "*.jpg" -o -name "*.png" | xargs ls -lh
  ```

- [ ] **Code Splitting Verification**
  ```typescript
  // Verify dynamic imports are used for large components
  // Check if lazy loading is implemented
  ```

### 4.3 Resource Optimization (Priority: LOW, Time: 30 minutes)

- [ ] **Static Asset Optimization**
  ```bash
  # Compress static assets
  # Verify CDN readiness
  ```

- [ ] **API Response Optimization**
  ```bash
  # Check API response sizes
  cd backend && npm run test -- --verbose
  ```

---

## 5. 🧪 Testing Preparation

### 5.1 Backend Testing (Priority: HIGH, Time: 1.5 hours)

- [ ] **Unit Tests Execution**
  ```bash
  cd backend && npm run test
  # All tests should pass
  ```

- [ ] **Integration Tests**
  ```bash
  cd backend && npm run test -- integration-password-reset.test.ts
  cd backend && npm run test -- maintenance.test.ts
  cd backend && npm run test -- scheduled-maintenance.test.ts
  ```

- [ ] **Test Coverage Review**
  ```bash
  cd backend && npm run test:coverage
  # Target: >80% coverage for critical paths
  ```

- [ ] **API Endpoint Testing**
  ```bash
  # Test all major endpoints
  cd backend && npm run test -- auth.test.ts
  ```

### 5.2 Frontend Testing (Priority: MEDIUM, Time: 1 hour)

- [ ] **Component Tests**
  ```bash
  cd frontend && npm run test
  # All tests should pass
  ```

- [ ] **Type Checking**
  ```bash
  cd frontend && npm run type-check
  # No TypeScript errors
  ```

### 5.3 End-to-End Testing (Priority: MEDIUM, Time: 1 hour)

- [ ] **Critical User Flows**
  - [ ] User registration and login
  - [ ] Bike creation and management
  - [ ] Maintenance record creation
  - [ ] Password reset flow
  - [ ] Email functionality

- [ ] **Browser Compatibility**
  ```bash
  # Test on different browsers
  # Verify responsive design
  ```

---

## 6. 📚 Documentation Updates

### 6.1 Production Documentation (Priority: MEDIUM, Time: 45 minutes)

- [ ] **Environment Setup Documentation**
  ```bash
  # Update README.md with production setup instructions
  # Document environment variables
  # Include troubleshooting guide
  ```

- [ ] **API Documentation**
  ```bash
  # Verify Swagger documentation is complete
  # Test API docs at /api-docs endpoint
  cd backend && npm run dev
  # Visit http://localhost:3001/api-docs
  ```

- [ ] **Deployment Guide Updates**
  ```bash
  # Update DEPLOYMENT-GUIDE.md with any new requirements
  # Verify all commands are current
  ```

### 6.2 Operational Documentation (Priority: LOW, Time: 30 minutes)

- [ ] **Monitoring Setup Guide**
  - [ ] Health check endpoints documented
  - [ ] Error handling procedures
  - [ ] Backup and recovery procedures

- [ ] **Maintenance Procedures**
  - [ ] Database maintenance tasks
  - [ ] Log rotation procedures
  - [ ] Update procedures

---

## 7. 💾 Backup and Rollback Preparation

### 7.1 Database Backup (Priority: HIGH, Time: 30 minutes)

- [ ] **Database Schema Backup**
  ```bash
  cd backend && npx prisma db pull
  # Verify schema.prisma is up to date
  ```

- [ ] **Data Backup (if applicable)**
  ```bash
  # Export current data if migrating from existing system
  # Create data seed files for production
  ```

- [ ] **Migration Rollback Plan**
  ```bash
  # Document rollback procedures
  # Test migration rollback in development
  cd backend && npx prisma migrate reset --force
  ```

### 7.2 Code Rollback Preparation (Priority: MEDIUM, Time: 15 minutes)

- [ ] **Git Tag Creation**
  ```bash
  # Create release tag
  git tag -a v1.0.0-production -m "Production release v1.0.0"
  git push origin v1.0.0-production
  ```

- [ ] **Rollback Procedures Documentation**
  ```bash
  # Document steps to rollback to previous version
  # Include database rollback procedures
  ```

---

## 8. 🌐 Account Setup for Deployment Platforms

### 8.1 Railway Setup (Backend) (Priority: HIGH, Time: 30 minutes)

- [ ] **Account Creation**
  - [ ] Create Railway account
  - [ ] Connect GitHub repository
  - [ ] Verify billing setup (free tier monitoring)

- [ ] **Service Configuration**
  ```bash
  # Install Railway CLI
  npm install -g @railway/cli
  
  # Login and initialize
  railway login
  # railway init  # Don't run yet, just prepare
  ```

- [ ] **Environment Variables Preparation**
  - [ ] Prepare all production environment variables
  - [ ] Plan Redis service addition

### 8.2 Vercel Setup (Frontend) (Priority: HIGH, Time: 20 minutes)

- [ ] **Account Creation**
  - [ ] Create Vercel account
  - [ ] Connect GitHub repository
  - [ ] Verify domain limits on free tier

- [ ] **Project Configuration**
  ```bash
  # Install Vercel CLI
  npm install -g vercel
  
  # Login
  vercel login
  # vercel  # Don't deploy yet, just prepare
  ```

### 8.3 Neon Database Setup (Priority: HIGH, Time: 15 minutes)

- [ ] **Database Verification**
  - [ ] Verify Neon project is set up
  - [ ] Confirm connection strings are working
  - [ ] Check free tier limits

- [ ] **Backup Strategy**
  ```bash
  # Set up automated backups if available on free tier
  # Document manual backup procedures
  ```

---

## 9. 🌍 Domain and DNS Considerations

### 9.1 Domain Planning (Priority: MEDIUM, Time: 30 minutes)

- [ ] **Subdomain Strategy**
  ```
  # Free tier friendly approach:
  - Main app: your-app.vercel.app (Vercel subdomain)
  - API: your-api.railway.app (Railway subdomain)
  - Alternative: Use your own domain with DNS pointing
  ```

- [ ] **SSL Certificate Planning**
  - [ ] Verify Vercel provides SSL automatically
  - [ ] Verify Railway provides SSL for custom domains
  - [ ] Plan for domain verification

### 9.2 DNS Configuration (Priority: LOW, Time: 20 minutes)

- [ ] **DNS Record Planning**
  ```dns
  # If using custom domain:
  A     @           76.76.19.19 (Vercel IP - example)
  CNAME api         your-api.railway.app
  CNAME www         your-app.vercel.app
  ```

- [ ] **Email DNS Records (Resend)**
  ```dns
  # If using custom domain for emails:
  TXT   @           "v=spf1 include:spf.resend.com ~all"
  TXT   _dmarc      "v=DMARC1; p=none"
  ```

---

## 10. 📊 Post-Deployment Monitoring Setup

### 10.1 Health Monitoring (Priority: HIGH, Time: 45 minutes)

- [ ] **Health Check Endpoints**
  ```bash
  # Verify health endpoints exist
  curl http://localhost:3001/health
  curl http://localhost:3001/health/email
  ```

- [ ] **Uptime Monitoring Setup**
  - [ ] Configure Railway health checks
  - [ ] Set up external uptime monitoring (UptimeRobot - free)
  - [ ] Plan alert notifications

### 10.2 Error Monitoring (Priority: MEDIUM, Time: 30 minutes)

- [ ] **Error Tracking Setup**
  ```bash
  # Consider Sentry (free tier available)
  # Or use Railway/Vercel built-in logging
  ```

- [ ] **Log Management**
  ```bash
  # Plan log rotation and management
  # Set up structured logging for production
  ```

### 10.3 Performance Monitoring (Priority: MEDIUM, Time: 20 minutes)

- [ ] **Performance Baselines**
  - [ ] Document expected response times
  - [ ] Set up basic performance monitoring
  - [ ] Plan resource usage tracking

---

## 🎯 Priority Summary

### CRITICAL (Must Complete Before Deployment)
1. Environment Variables Audit
2. Security Headers Verification
3. Database Connection Testing
4. Backend/Frontend Build Verification

### HIGH PRIORITY (Complete Day Before Deployment)
1. Code Review and Cleanup
2. Security Hardening
3. Testing Execution
4. Platform Account Setup

### MEDIUM PRIORITY (Complete Week Before Deployment)
1. Performance Optimization
2. Documentation Updates
3. Monitoring Setup
4. DNS Planning

### LOW PRIORITY (Nice to Have)
1. Advanced Performance Tuning
2. Comprehensive Documentation
3. Advanced Monitoring

---

## ⏱️ Time Estimates

| Category | Time Required |
|----------|---------------|
| Code Preparation | 3-4 hours |
| Environment Setup | 1.5 hours |
| Security Hardening | 2 hours |
| Performance Optimization | 2 hours |
| Testing | 3.5 hours |
| Documentation | 1.5 hours |
| Backup/Rollback Prep | 1 hour |
| Platform Setup | 1.5 hours |
| DNS/Domain Setup | 1 hour |
| Monitoring Setup | 1.5 hours |
| **Total** | **18-19 hours** |

**Recommended Timeline:** Complete over 3-4 days with breaks for testing between major sections.

---

## ✅ Final Deployment Readiness Check

Before proceeding with deployment, ensure:

- [ ] All CRITICAL and HIGH priority items completed
- [ ] All tests passing
- [ ] Environment variables configured and tested
- [ ] Documentation updated
- [ ] Rollback plan documented
- [ ] Monitoring alerts configured
- [ ] Team notified of deployment schedule

**Ready to Deploy?** ✅ → Proceed to `DEPLOYMENT-GUIDE.md`

---

*Generated for Bicycle Maintenance System v1.0.0 - Production Deployment Preparation*