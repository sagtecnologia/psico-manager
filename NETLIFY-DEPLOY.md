# ⚡ Configuração Rápida - Netlify

## 1. Editar as Credenciais do Supabase

Antes de fazer o deploy, você precisa adicionar suas credenciais do Supabase nos arquivos HTML.

### 📋 Obter Credenciais

1. Acesse: https://app.supabase.com
2. Selecione seu projeto
3. Vá em **Settings** → **API**
4. Copie:
   - **Project URL** (ex: `https://xyzabc123.supabase.co`)
   - **anon public** (chave longa começando com `eyJ...`)

### ✏️ Editar Arquivos

Edite os seguintes arquivos e substitua estas linhas:

```html
<meta name="supabase-url" content="https://seu-projeto.supabase.co">
<meta name="supabase-key" content="sua-chave-anonima-aqui">
```

**Por:**

```html
<meta name="supabase-url" content="https://SUA-URL-REAL.supabase.co">
<meta name="supabase-key" content="SUA-CHAVE-REAL-AQUI">
```

**Arquivos para editar:**
- [ ] `index.html` (tela de login)
- [ ] `dashboard.html` (dashboard principal)
- [ ] `pages/pacientes.html`
- [ ] `pages/agenda.html`
- [ ] `pages/prontuarios.html`
- [ ] `pages/evolucoes.html`
- [ ] `pages/financeiro.html`
- [ ] `pages/documentos.html`
- [ ] `pages/relatorios.html`
- [ ] `pages/perfil.html`
- [ ] `pages/configuracoes.html`

### 💾 Fazer Commit

```bash
git add .
git commit -m "Adicionar credenciais Supabase"
git push
```

---

## 2. Deploy no Netlify

### Via Interface Web:

1. Acesse: https://app.netlify.com
2. Clique em **"Add new site"** → **"Import an existing project"**
3. Conecte com **GitHub**
4. Selecione o repositório: `sagtecnologia/psico-manager`
5. Configure:
   - **Build command:** (deixe vazio)
   - **Publish directory:** `/`
6. Clique em **"Deploy site"**
7. Aguarde 2-3 minutos

### Via CLI (alternativo):

```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod
```

---

## 3. Configurar o Banco de Dados

### No Supabase:

1. Acesse: https://app.supabase.com
2. Selecione seu projeto
3. Vá em **SQL Editor**
4. Execute os scripts na ordem:

**Script 1: Schema**
```sql
-- Cole todo o conteúdo de: database/schema.sql
-- Clique em RUN
```

**Script 2: RLS Policies**
```sql
-- Cole todo o conteúdo de: database/fix-rls-complete.sql
-- Clique em RUN
```

---

## 4. Testar

1. Acesse o link do Netlify (ex: `https://psicomanage.netlify.app`)
2. Abra o console do navegador (F12)
3. Deve aparecer: `✓ Cliente Supabase inicializado via meta tags`
4. Clique em **"Criar Conta"**
5. Preencha os dados e crie um usuário
6. Faça login
7. Teste a navegação entre páginas

---

## ✅ Checklist Final

- [ ] Credenciais do Supabase editadas em todos os HTMLs
- [ ] Commit e push feitos
- [ ] Deploy no Netlify realizado
- [ ] Scripts SQL executados no Supabase
- [ ] Conta de usuário criada
- [ ] Login funcionando
- [ ] Dashboard carregando
- [ ] Navegação entre páginas OK

---

## 🆘 Problemas?

### Erro: "Credenciais do Supabase não configuradas"
- Você esqueceu de editar as meta tags nos arquivos HTML
- Edite, faça commit e o Netlify vai redesployar automaticamente

### Erro 404 ou página em branco
- Crie arquivo `netlify.toml` na raiz:
```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Dashboard não carrega dados
- Execute novamente o script `database/fix-rls-complete.sql`
- Faça logout e login novamente

---

## 📚 Mais Ajuda

Consulte o guia completo: [DEPLOY.md](DEPLOY.md)
