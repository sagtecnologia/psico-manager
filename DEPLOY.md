# 🚀 Deploy em Produção - Psico Manager

## ⚠️ Pré-requisitos

1. Conta ativa no [Supabase](https://supabase.com)
2. Projeto criado no Supabase com o banco de dados configurado
3. Servidor web para hospedar os arquivos (Apache, Nginx, GitHub Pages, Vercel, etc.)

## 📋 Passo a Passo

### 1. Configurar o Supabase

#### 1.1. Criar o arquivo de configuração
```bash
# Na pasta do projeto, copie o template:
cp config/supabase.template.js config/supabase.js
```

#### 1.2. Adicionar suas credenciais
Edite o arquivo `config/supabase.js` e substitua:
```javascript
const SUPABASE_URL = 'https://seu-projeto.supabase.co'; // Sua URL
const SUPABASE_ANON_KEY = 'sua-chave-anonima-aqui'; // Sua chave
```

**Como obter as credenciais:**
1. Acesse [https://app.supabase.com](https://app.supabase.com)
2. Selecione seu projeto
3. Vá em **Settings** → **API**
4. Copie:
   - **Project URL** → `SUPABASE_URL`
   - **anon/public key** → `SUPABASE_ANON_KEY`

### 2. Configurar o Banco de Dados

Execute os scripts SQL no Supabase (na ordem):

1. **Schema principal:**
   ```sql
   -- Execute: database/schema.sql
   ```

2. **Políticas de segurança:**
   ```sql
   -- Execute: database/fix-rls-complete.sql
   ```

3. **Atualizar status de sessões (se necessário):**
   ```sql
   -- Execute: database/update-sessoes-status.sql
   ```

**Como executar:**
1. Acesse seu projeto no Supabase
2. Vá em **SQL Editor**
3. Crie uma nova query
4. Cole o conteúdo do arquivo e execute

### 3. Deploy dos Arquivos

#### Opção A: GitHub Pages (Grátis)
```bash
# Já está no GitHub!
# Habilite GitHub Pages:
# 1. Vá em Settings > Pages
# 2. Selecione branch: master
# 3. Clique em Save
```

#### Opção B: Vercel (Grátis)
```bash
# Instale o Vercel CLI
npm i -g vercel

# Na pasta do projeto:
vercel

# Siga as instruções
```

#### Opção C: Netlify (Grátis)
```bash
# Instale o Netlify CLI
npm i -g netlify-cli

# Na pasta do projeto:
netlify deploy

# Para produção:
netlify deploy --prod
```

#### Opção D: Servidor Próprio
```bash
# Faça upload via FTP/SSH de todos os arquivos
# Certifique-se que config/supabase.js está presente!
```

### 4. Verificação Pós-Deploy

Após o deploy, verifique:

✅ **Configuração do Supabase:**
- Abra o console do navegador (F12)
- Acesse a página de login
- Deve aparecer: `✓ Cliente Supabase inicializado`
- **NÃO deve aparecer:** `❌ Erro: Cliente Supabase não inicializado!`

✅ **Teste de Login:**
- Tente fazer login com usuário existente
- OU crie um novo cadastro
- Deve redirecionar para o dashboard

✅ **Teste de Funcionalidades:**
- Dashboard deve carregar os cards
- Menu lateral deve funcionar
- Navegação entre páginas deve ser fluida

## 🔒 Segurança

### Arquivos Protegidos

O arquivo `config/supabase.js` está no `.gitignore` e **NUNCA** deve ser commitado no Git.

### Variáveis de Ambiente (Opcional)

Para maior segurança, você pode usar variáveis de ambiente:

**Crie um arquivo `.env` (também no .gitignore):**
```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima-aqui
```

**E modifique `config/supabase.js`:**
```javascript
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
```

## 🛠️ Troubleshooting

### Erro: "Cliente Supabase não inicializado"
**Causa:** Arquivo `config/supabase.js` não existe ou não foi carregado.
**Solução:**
1. Verifique se o arquivo existe
2. Verifique se as credenciais estão corretas
3. Limpe o cache do navegador (Ctrl+Shift+Del)

### Erro no Login: "Invalid login credentials"
**Causa:** Usuário não existe ou senha incorreta.
**Solução:**
1. Crie um novo usuário usando o botão "Criar Conta"
2. Verifique se o email está correto
3. Verifique no Supabase Dashboard > Authentication se o usuário foi criado

### Erro: "Cannot read properties of undefined (reading 'auth')"
**Causa:** O script `config/supabase.js` não foi carregado antes do `login.js`.
**Solução:**
1. Verifique a ordem dos scripts no HTML
2. Certifique-se que está assim:
```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="config/supabase.js"></script>
<script src="js/auth/login.js"></script>
```

### Páginas não carregam após login
**Causa:** RLS (Row Level Security) não configurado corretamente.
**Solução:**
1. Execute o script: `database/fix-rls-complete.sql`
2. Verifique no Supabase Dashboard > Authentication > Policies

## 📞 Suporte

Se encontrar problemas:
1. Verifique o console do navegador (F12)
2. Verifique os logs do Supabase
3. Abra uma issue no GitHub: https://github.com/sagtecnologia/psico-manager/issues

## 🎉 Pronto!

Seu sistema está online e pronto para uso! 🚀
