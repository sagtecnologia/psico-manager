# 🚀 Deploy em Produção - Psico Manager

## ⚠️ Pré-requisitos

1. Conta ativa no [Supabase](https://supabase.com)
2. Projeto criado no Supabase com o banco de dados configurado
3. Suas credenciais do Supabase (Project URL e anon key)

## 📋 Método Recomendado: Deploy com Meta Tags

### Vantagens:
- ✅ Não precisa criar arquivos adicionais
- ✅ Funciona em qualquer plataforma (Netlify, Vercel, GitHub Pages)
- ✅ Mais simples e direto

### Passo a Passo:

#### 1. Obter Credenciais do Supabase
1. Acesse [https://app.supabase.com](https://app.supabase.com)
2. Selecione seu projeto
3. Vá em **Settings** → **API**
4. Copie:
   - **Project URL** (ex: `https://abc123.supabase.co`)
   - **anon/public key** (chave longa começando com `eyJ...`)

#### 2. Editar os Arquivos HTML

Edite os seguintes arquivos e substitua as credenciais nas meta tags:

**Arquivos a editar:**
- `index.html`
- `dashboard.html`
- `pages/pacientes.html`
- `pages/agenda.html`
- `pages/prontuarios.html`
- `pages/evolucoes.html`
- `pages/financeiro.html`
- `pages/documentos.html`
- `pages/relatorios.html`
- `pages/perfil.html`
- `pages/configuracoes.html`

**Procure por estas linhas e substitua os valores:**
```html
<meta name="supabase-url" content="https://seu-projeto.supabase.co">
<meta name="supabase-key" content="sua-chave-anonima-aqui">
```

**Substitua por:**
```html
<meta name="supabase-url" content="https://SUA-URL-AQUI.supabase.co">
<meta name="supabase-key" content="SUA-CHAVE-AQUI">
```

#### 3. Configurar o Banco de Dados

Execute os scripts SQL no Supabase (na ordem):

1. **Schema principal:**
   - Abra o SQL Editor no Supabase
   - Cole o conteúdo de `database/schema.sql`
   - Execute

2. **Políticas de segurança:**
   - Cole o conteúdo de `database/fix-rls-complete.sql`
   - Execute

#### 4. Fazer Deploy

**Opção A: Netlify (Recomendado - Grátis)**

1. Crie conta em [netlify.com](https://netlify.com)
2. Clique em "Add new site" → "Import an existing project"
3. Conecte com GitHub e selecione seu repositório
4. Configure:
   - Build command: (deixe vazio)
   - Publish directory: `/`
5. Clique em "Deploy"
6. Aguarde o deploy finalizar

**Opção B: Vercel (Grátis)**

1. Crie conta em [vercel.com](https://vercel.com)
2. Clique em "Add New..." → "Project"
3. Import seu repositório do GitHub
4. Configure:
   - Framework Preset: Other
   - Root Directory: ./
5. Clique em "Deploy"

**Opção C: GitHub Pages (Grátis)**

1. No repositório, vá em Settings → Pages
2. Source: Deploy from a branch
3. Branch: master / (root)
4. Clique em "Save"
5. Aguarde alguns minutos

#### 5. Verificação Pós-Deploy

Após o deploy, verifique:

✅ **Configuração do Supabase:**
- Abra o console do navegador (F12)
- Acesse a página de login do seu site
- Deve aparecer: `✓ Cliente Supabase inicializado`
- **NÃO deve aparecer:** `❌ Erro: Credenciais do Supabase não configuradas!`

✅ **Teste de Login:**
- Clique em "Criar Conta"
- Preencha os dados e crie um usuário
- Faça login com as credenciais
- Deve redirecionar para o dashboard

✅ **Teste de Funcionalidades:**
- Dashboard deve carregar sem erros
- Menu lateral deve funcionar
- Navegação entre páginas deve ser fluida

---

## 🔧 Método Alternativo: Desenvolvimento Local

Se você está rodando localmente (não em produção):

### 1. Criar arquivo de configuração
```bash
cp config/supabase.template.js config/supabase.js
```

### 2. Editar `config/supabase.js`
```javascript
const SUPABASE_URL = 'https://sua-url.supabase.co';
const SUPABASE_ANON_KEY = 'sua-chave-aqui';
```

### 3. Iniciar servidor local
```bash
# Python
python -m http.server 8000

# Node.js
npx serve
```

### 4. Acessar
```
http://localhost:8000
```

---

## 🔒 Segurança

### ⚠️ IMPORTANTE:
- As credenciais nas meta tags são **públicas** (anon key)
- Isso é **normal e seguro** - a chave anon é feita para ser exposta
- A segurança real está nas **políticas RLS** do Supabase
- **NUNCA** exponha a `service_role` key

### Proteção de Dados:
- ✅ Row Level Security (RLS) ativado em todas as tabelas
- ✅ Políticas configuradas por psicólogo
- ✅ Cada usuário só acessa seus próprios dados
- ✅ Conformidade com LGPD

## 🛠️ Troubleshooting

### ❌ Erro: "Credenciais do Supabase não configuradas"
**Causa:** As meta tags não foram editadas com as credenciais reais.

**Solução:**
1. Abra cada arquivo HTML
2. Procure por `<meta name="supabase-url"`
3. Substitua os valores de exemplo pelas suas credenciais
4. Faça commit e redeploy:
   ```bash
   git add .
   git commit -m "Adicionar credenciais Supabase"
   git push
   ```

### ❌ Erro: "Invalid login credentials"
**Causa:** Usuário não existe ou senha incorreta.

**Solução:**
1. Clique em "Criar Conta" na tela de login
2. Preencha todos os dados obrigatórios
3. Após criar, faça login normalmente

### ❌ Erro no console: "Cannot read properties of undefined"
**Causa:** Script supabase-init.js não está sendo carregado.

**Solução:**
1. Verifique se o arquivo `config/supabase-init.js` existe
2. Limpe o cache do navegador (Ctrl+Shift+Del)
3. Recarregue a página (Ctrl+F5)

### ❌ Dashboard não carrega dados
**Causa:** RLS não configurado corretamente.

**Solução:**
1. Acesse o Supabase Dashboard
2. Vá em **Authentication** → **Policies**
3. Execute novamente: `database/fix-rls-complete.sql`
4. Faça logout e login novamente

### ❌ Erro 404 no Netlify
**Causa:** Configuração de rotas SPA.

**Solução:**
1. Crie arquivo `netlify.toml` na raiz:
   ```toml
   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```
2. Commit e redeploy

## 📞 Suporte

Se encontrar problemas:
1. Verifique o console do navegador (F12)
2. Verifique os logs do Supabase
3. Abra uma issue no GitHub: https://github.com/sagtecnologia/psico-manager/issues

## 🎉 Pronto!

Seu sistema está online e pronto para uso! 🚀
