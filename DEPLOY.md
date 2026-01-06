# 🚀 Deploy em Produção - Psico Manager

## ⚠️ Pré-requisitos

1. Conta ativa no [Supabase](https://supabase.com)
2. Projeto criado no Supabase com o banco de dados configurado

## 📋 Passo a Passo Simplificado

### 1. Configurar Credenciais do Supabase

#### 1.1. Obter suas credenciais
1. Acesse [https://app.supabase.com](https://app.supabase.com)
2. Selecione seu projeto
3. Vá em **Settings** → **API**
4. Copie:
   - **Project URL** (ex: `https://abc123.supabase.co`)
   - **anon/public key** (chave longa começando com `eyJ...`)

#### 1.2. Editar o arquivo de configuração

Edite o arquivo `config/supabase.js` e substitua as credenciais:

```javascript
const SUPABASE_URL = 'https://sua-url-aqui.supabase.co';
const SUPABASE_ANON_KEY = 'sua-chave-aqui';
```

### 2. Configurar o Banco de Dados

Execute os scripts SQL no Supabase:

1. Acesse seu projeto no Supabase
2. Vá em **SQL Editor**
3. Execute na ordem:
   - `database/schema.sql` - Cria as tabelas
   - `database/fix-rls-complete.sql` - Configura segurança

### 3. Fazer Deploy

**Opção A: Netlify (Recomendado)**
1. Acesse [netlify.com](https://netlify.com) e faça login
2. Clique em "Add new site" → "Import an existing project"
3. Conecte com GitHub e selecione o repositório
4. Configure:
   - Build command: (deixe vazio)
   - Publish directory: `/`
5. Clique em "Deploy"

**Opção B: Vercel**
1. Acesse [vercel.com](https://vercel.com) e faça login
2. Clique em "Add New..." → "Project"
3. Import seu repositório do GitHub
4. Clique em "Deploy"

**Opção C: GitHub Pages**
1. No repositório GitHub, vá em Settings → Pages
2. Source: Deploy from a branch
3. Branch: master / (root)
4. Salvar

### 4. Verificar

Após o deploy:
1. Acesse seu site
2. Abra o console do navegador (F12)
3. Deve aparecer: `✓ Cliente Supabase inicializado`
4. Teste criando uma conta e fazendo login

## 🛠️ Troubleshooting

### ❌ Erro no Login
**Causa:** Credenciais não configuradas ou incorretas.

**Solução:**
1. Verifique se editou `config/supabase.js` com suas credenciais reais
2. Confirme que as credenciais estão corretas no Supabase
3. Limpe o cache (Ctrl+Shift+Del) e recarregue

### ❌ Dashboard não carrega dados
**Causa:** RLS não configurado.

**Solução:**
1. Execute `database/fix-rls-complete.sql` no Supabase SQL Editor
2. Faça logout e login novamente

### ❌ Erro ao criar conta
**Causa:** Email já cadastrado ou validação falhou.

**Solução:**
1. Use um email diferente
2. Verifique no Supabase Dashboard > Authentication se o usuário existe
3. Verifique se preencheu todos os campos obrigatórios

## 🔒 Segurança

- ✅ A chave `anon key` é **pública e segura** para expor
- ✅ Row Level Security (RLS) protege os dados
- ✅ Cada psicólogo acessa apenas seus dados
- ✅ Conformidade com LGPD
- ⚠️ **NUNCA** exponha a `service_role` key

## 📞 Suporte

Problemas? Abra uma issue: [GitHub Issues](https://github.com/sagtecnologia/psico-manager/issues)
