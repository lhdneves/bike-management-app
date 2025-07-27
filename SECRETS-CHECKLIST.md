# 🔒 SECRETS & SECURITY CHECKLIST

## 🔑 SECRETS PARA ATUALIZAR

### ✅ GERADOS/SEGUROS
- **Novo JWT_SECRET**: `823f291d6e616491586c90e8940e900d4aa41d3d51d5a4b603bfe2a4085aaf3e041f14c1327071a03d77bb1b11237bda423becc442362244cd48a0211b429b25`
- **DATABASE_URL**: ✅ Neon configurado com SSL
- **RESEND_API_KEY**: ✅ Configurado (`re_4snYeu4u_8SSvuNvbHM5cWRQ6Zm7p1hqL`)

### ⚠️ PRECISAM SER ATUALIZADOS NO DEPLOY

#### Railway (Backend):
```bash
# Core secrets
JWT_SECRET=823f291d6e616491586c90e8940e900d4aa41d3d51d5a4b603bfe2a4085aaf3e041f14c1327071a03d77bb1b11237bda423becc442362244cd48a0211b429b25
NODE_ENV=production
FRONTEND_URL=https://SEU-APP.vercel.app

# Database (copy from current .env)
DATABASE_URL=postgresql://neondb_owner:npg_0y3wizuxmvGb@ep-purple-fog-aczpctpi-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require
DIRECT_URL=postgresql://neondb_owner:npg_0y3wizuxmvGb@ep-purple-fog-aczpctpi.sa-east-1.aws.neon.tech/neondb?sslmode=require

# Email
RESEND_API_KEY=re_4snYeu4u_8SSvuNvbHM5cWRQ6Zm7p1hqL
RESEND_FROM_EMAIL=noreply@SEU-DOMINIO.com
```

#### Vercel (Frontend):
```bash
NEXT_PUBLIC_API_BASE_URL=https://SEU-BACKEND.onrender.com/api
NODE_ENV=production
```

## 🔍 VERIFICAÇÕES DE SEGURANÇA

### ✅ PONTOS SEGUROS
- SSL/TLS habilitado no database
- BCRYPT_SALT_ROUNDS = 12 (adequado)
- Rate limiting configurado
- CORS será configurado por plataforma

### ⚠️ PENDÊNCIAS
- [ ] Atualizar domínios reais nos templates
- [ ] Configurar CORS para domínios específicos
- [ ] Validar email domain ownership no Resend
- [ ] Testar JWT_SECRET em staging

## 🚨 SECRETS A NÃO COMMITAR

Certifique-se que estes arquivos estão no .gitignore:
- `.env`
- `.env.local`
- `.env.production.local`
- `*.pem`
- `*.key`

## 📋 CHECKLIST PRÉ-DEPLOY

- [ ] JWT_SECRET atualizado nos 2 ambientes
- [ ] NODE_ENV=production nos 2 ambientes  
- [ ] URLs atualizadas (FRONTEND_URL + API_BASE_URL)
- [ ] Domínio verificado no Resend
- [ ] Database connection testada
- [ ] .env adicionado ao .gitignore