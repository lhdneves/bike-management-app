# 🔗 ATUALIZAR URLs DE PRODUÇÃO

## ⚠️ IMPORTANTE: Execute após ter as URLs reais

Após fazer deploy nos serviços, você receberá URLs como:
- Render: `https://bicycle-maintenance-backend.onrender.com` (você escolhe o nome)
- Vercel: `https://bicycle-maintenance-frontend-xxxx.vercel.app`

---

## 🛠️ COMANDOS PARA ATUALIZAR

### 1. Atualizar Railway (Backend)
No Railway Dashboard → Environment Variables:

```bash
# Substituir FRONTEND_URL com URL real do Vercel
FRONTEND_URL=https://bicycle-maintenance-frontend-xxxx.vercel.app

# Adicionar CORS origins
ALLOWED_ORIGINS=https://bicycle-maintenance-frontend-xxxx.vercel.app,https://seu-dominio-custom.com

# Atualizar email
RESEND_FROM_EMAIL=noreply@seu-dominio-custom.com
```

### 2. Atualizar Vercel (Frontend)
No Vercel Dashboard → Settings → Environment Variables:

```bash
# Substituir com URL real do Railway
NEXT_PUBLIC_API_BASE_URL=https://bicycle-maintenance-backend-production-xxxx.up.railway.app/api
```

### 3. Redeploy Ambos
- Railway: Trigger new deployment
- Vercel: Trigger new deployment

---

## 📝 TEMPLATE DE SUBSTITUIÇÃO

Use find/replace nos arquivos:

**Railway Backend:**
```bash
# Substituir no Environment Variables
FRONTEND_URL=https://SUA-URL-VERCEL.vercel.app
ALLOWED_ORIGINS=https://SUA-URL-VERCEL.vercel.app
```

**Vercel Frontend:**
```bash
# Substituir no Environment Variables  
NEXT_PUBLIC_API_BASE_URL=https://SUA-URL-RAILWAY.up.railway.app/api
```

---

## ✅ CHECKLIST APÓS ATUALIZAÇÃO

- [ ] URLs atualizadas no Railway
- [ ] URLs atualizadas no Vercel
- [ ] Redeploy Railway concluído
- [ ] Redeploy Vercel concluído
- [ ] Teste de conectividade OK
- [ ] CORS funcionando
- [ ] Emails sendo enviados

---

## 🔍 COMO TESTAR

```bash
# Testar backend
curl https://SUA-URL-RAILWAY.up.railway.app/health

# Testar frontend
curl https://SUA-URL-VERCEL.vercel.app

# Testar CORS
curl -H "Origin: https://SUA-URL-VERCEL.vercel.app" \
     https://SUA-URL-RAILWAY.up.railway.app/health
```