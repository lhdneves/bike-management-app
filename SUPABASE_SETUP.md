# 🚀 Supabase Setup - Passo a Passo

## 1. Criar Projeto no Supabase

1. Acesse [Supabase Dashboard](https://supabase.com/dashboard)
2. Clique em **"New Project"**
3. Escolha sua organização
4. Preencha os detalhes:
   - **Nome:** `bicycle-maintenance-system`
   - **Senha do Database:** Gere uma senha forte
   - **Região:** Escolha mais próxima do Brasil
5. Clique **"Create new project"**

## 2. Executar Script do Banco

1. Aguarde o projeto ficar pronto (2-3 minutos)
2. Vá em **SQL Editor** no painel do Supabase
3. Copie todo o conteúdo do arquivo `database/supabase-setup.sql`
4. Cole no editor e clique **Run**

## 3. Obter String de Conexão

1. Vá em **Settings** > **Database**
2. Copie a **Connection string** (formato URI)
3. Será algo como:
   ```
   postgresql://postgres:[SUA-SENHA]@db.[PROJECT-REF].supabase.co:5432/postgres
   ```

## 4. Configurar Variáveis de Ambiente

Edite o arquivo `backend/.env` e substitua:

```env
DATABASE_URL="postgresql://postgres:sua-senha-aqui@db.seu-project-ref.supabase.co:5432/postgres"
DIRECT_URL="postgresql://postgres:sua-senha-aqui@db.seu-project-ref.supabase.co:5432/postgres"
```

## 5. Testar Conexão

Execute no terminal:

```bash
cd backend
npm install
npx prisma db pull
npx prisma generate
```

Se funcionou, você verá as tabelas sendo sincronizadas.

## 6. Usuários de Teste

O script cria usuários para teste:

### Administrador
- **Email:** admin@bikemanager.com
- **Senha:** admin123

### Dono de Bicicleta  
- **Email:** joao@example.com
- **Senha:** owner123

### Mecânico
- **Email:** carlos@mecanicosilva.com
- **Senha:** mechanic123

## 7. Próximos Passos

Após configuração bem-sucedida:

1. ✅ Configurar Supabase
2. ✅ Executar script SQL
3. ✅ Atualizar .env
4. ✅ Testar conexão Prisma
5. 🔄 **Executar setup do projeto:** `npm run setup`
6. 🔄 **Iniciar desenvolvimento:** `npm run dev`

## ❗ Problemas Comuns

### Erro de Conexão
- Verifique se copiou a senha corretamente
- Confirme que o projeto Supabase está ativo
- Teste a string de conexão no SQL Editor

### Erro do Prisma
- Execute `npx prisma db pull` para sincronizar
- Execute `npx prisma generate` para atualizar client
- Verifique se DATABASE_URL está correto

---

**Está tudo pronto!** Agora você pode seguir com o desenvolvimento das histórias.