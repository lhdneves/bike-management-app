# 🚀 Configuração do Resend - Guia Completo

## 📋 Status Atual
- ✅ **Resend implementado** como provedor principal
- ✅ **Fallback SMTP** configurado como secundário  
- ⚠️ **Chave placeholder** - precisa de configuração real

## 🔧 Ativação do Resend (3 passos)

### 1️⃣ Criar Conta Resend (GRATUITO)
```bash
# Acesse: https://resend.com
# Plano gratuito: 3.000 emails/mês
# Verificação de domínio opcional
```

### 2️⃣ Obter API Key
1. Faça login no dashboard Resend
2. Vá em **API Keys** → **Create API Key**
3. Copie a chave (formato: `re_AbCdEf123...`)

### 3️⃣ Configurar no Projeto
Edite `backend/.env`:
```bash
# SUBSTITUA a linha 20:
RESEND_API_KEY="re_sua_chave_real_aqui"

# CONFIGURE seu domínio:
RESEND_FROM_EMAIL="noreply@seudominio.com"
RESEND_FROM_NAME="BikeManager"
```

## ✅ Validação da Configuração

### Teste 1: Health Check
```bash
curl http://localhost:3001/health
# Deve mostrar: "useResend": true
```

### Teste 2: Envio de Email
```bash
curl -X POST http://localhost:3001/api/password-reset/request \
  -H "Content-Type: application/json" \
  -d '{"email":"seu-email@exemplo.com"}'
```

### Teste 3: Logs do Console
Procure no console do backend:
```
✅ Password reset email sent via Resend to email@exemplo.com
```

## 🎯 Vantagens do Resend

### vs SMTP Tradicional
- ✅ **Entregabilidade superior** (99%+)
- ✅ **APIs modernas** (REST vs SMTP)
- ✅ **Analytics integradas**
- ✅ **Templates visuais**
- ✅ **Sem configuração de servidor**

### Funcionalidades Incluídas
- 📊 **Dashboard** com métricas
- 🔍 **Logs detalhados** de entrega
- 📧 **Bounce/complaint handling**
- 🎨 **Editor de templates**
- 🔗 **Webhooks** para eventos

## 🛡️ Segurança Implementada

### Fallback Automático
```typescript
// Se Resend falhar, usa SMTP automaticamente
if (this.useResend && this.resend) {
  // Tenta Resend primeiro
} else {
  // Fallback para SMTP
}
```

### Rate Limiting
- 3 tentativas por usuário/hora
- Proteção contra spam
- Logs de auditoria

## 📈 Monitoramento

### Health Checks Disponíveis
- `GET /health` - Status geral
- `GET /health/email` - Status email específico

### Métricas para Monitorar
- Taxa de entrega Resend
- Fallback para SMTP
- Errors e bounces
- Response time

## 🚨 Troubleshooting

### Problema: "useResend": false
**Solução**: Verificar se RESEND_API_KEY não é placeholder

### Problema: Emails não chegam  
**Solução**: 
1. Verificar logs do console
2. Verificar spam folder
3. Configurar SPF/DKIM no domínio

### Problema: API Key inválida
**Solução**: Regenerar chave no dashboard Resend

## 📞 Suporte

- **Documentação**: https://resend.com/docs
- **Status**: https://status.resend.com
- **Discord**: https://discord.gg/resend