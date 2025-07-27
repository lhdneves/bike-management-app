# 🎯 CONFIGURAÇÃO RENDER - PASSO A PASSO

## 📋 FORMULÁRIO DE CONFIGURAÇÃO

**Cole estas configurações EXATAMENTE como estão:**

### ⚙️ Basic Configuration
```
Name: bicycle-maintenance-backend
Language: Node
Region: Ohio (US East)
Branch: main
Root Directory: backend
```

### 🏗️ Build & Deploy Settings
```
Build Command: npm install && npm run build
Start Command: npm start
```

### 🔧 Advanced Settings
```
Auto-Deploy: Yes
Node Version: 18
```

---

## 🔑 ENVIRONMENT VARIABLES

**Vá para Settings → Environment depois do deploy inicial**

**Adicione uma por vez:**

```bash
NODE_ENV=production
```

```bash
PORT=3001
```

```bash
DATABASE_URL=postgresql://neondb_owner:npg_0y3wizuxmvGb@ep-purple-fog-aczpctpi-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require
```

```bash
DIRECT_URL=postgresql://neondb_owner:npg_0y3wizuxmvGb@ep-purple-fog-aczpctpi.sa-east-1.aws.neon.tech/neondb?sslmode=require
```

```bash
JWT_SECRET=823f291d6e616491586c90e8940e900d4aa41d3d51d5a4b603bfe2a4085aaf3e041f14c1327071a03d77bb1b11237bda423becc442362244cd48a0211b429b25
```

```bash
JWT_EXPIRES_IN=7d
```

```bash
FRONTEND_URL=https://bicycle-maintenance-frontend.vercel.app
```

```bash
RESEND_API_KEY=re_4snYeu4u_8SSvuNvbHM5cWRQ6Zm7p1hqL
```

```bash
RESEND_FROM_EMAIL=noreply@bikemanager.app
```

```bash
RESEND_FROM_NAME=Bicycle Maintenance
```

```bash
PASSWORD_RESET_TOKEN_EXPIRY=3600
```

```bash
PASSWORD_RESET_RATE_LIMIT=10
```

```bash
RATE_LIMIT_WINDOW_MS=900000
```

```bash
RATE_LIMIT_MAX_REQUESTS=100
```

```bash
BCRYPT_SALT_ROUNDS=12
```

```bash
EMAIL_QUEUE_NAME=email-processing
```

```bash
EMAIL_QUEUE_CONCURRENCY=5
```

```bash
MAINTENANCE_REMINDER_ENABLED=true
```

```bash
MAINTENANCE_REMINDER_CRON=0 9 * * *
```

```bash
DEFAULT_REMINDER_DAYS=7
```

```bash
MAX_REMINDER_DAYS=30
```

---

## ✅ CHECKLIST

- [ ] Repositório conectado
- [ ] Name: bicycle-maintenance-backend
- [ ] Root Directory: backend
- [ ] Build Command: npm install && npm run build
- [ ] Start Command: npm start
- [ ] Auto-Deploy: Yes
- [ ] Todas environment variables adicionadas
- [ ] Deploy iniciado

---

## 🚨 SE DER ERRO

1. **Vá para Logs** na dashboard
2. **Copie o erro**
3. **Cole no chat**
4. **Aguarde correção**