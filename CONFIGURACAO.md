# 📋 Guia de Configuração - Psico Manager

## 🚀 Passo a Passo para Configurar o Sistema

### 1. Criar Conta no Supabase

1. Acesse: https://supabase.com
2. Clique em "Start your project"
3. Crie uma conta gratuita (GitHub, Google ou email)
4. Crie um novo projeto:
   - Nome: `psico-manager` (ou o que preferir)
   - Database Password: Crie uma senha forte
   - Region: Escolha a mais próxima do Brasil (South America)

### 2. Configurar o Banco de Dados

1. No painel do Supabase, vá em **SQL Editor**
2. Clique em "+ New Query"
3. Copie TODO o conteúdo do arquivo `database/schema.sql`
4. Cole no editor SQL
5. Clique em "Run" ou pressione Ctrl+Enter
6. Aguarde a execução (pode levar alguns segundos)
7. Verifique se não há erros

### 3. Obter as Credenciais do Projeto

1. No menu lateral, clique em **Settings** (⚙️)
2. Vá em **API**
3. Localize e copie:
   - **Project URL** (algo como: `https://xxxxx.supabase.co`)
   - **anon public** key (uma chave longa começando com `eyJ...`)

### 4. Configurar o Frontend

1. Navegue até a pasta `config/`
2. Copie o arquivo `supabase.example.js`
3. Renomeie a cópia para `supabase.js`
4. Abra `supabase.js` e substitua:
   ```javascript
   const SUPABASE_CONFIG = {
     url: 'https://seu-projeto.supabase.co',  // ← Cole sua Project URL
     anonKey: 'sua-anon-key-aqui'              // ← Cole sua anon key
   };
   ```

### 5. Testar o Sistema

#### Opção A: Live Server (Recomendado)
1. Instale a extensão "Live Server" no VS Code
2. Clique com botão direito no arquivo `index.html`
3. Selecione "Open with Live Server"
4. O navegador abrirá automaticamente

#### Opção B: Servidor Python
```bash
# No terminal, na pasta do projeto:
python -m http.server 8000
# Acesse: http://localhost:8000
```

#### Opção C: Servidor Node.js
```bash
npx http-server -p 8000
# Acesse: http://localhost:8000
```

### 6. Criar Primeira Conta

1. Na tela de login, clique em "Criar nova conta"
2. Preencha:
   - Nome completo
   - CRP (pode ser fictício para testes: 06/12345)
   - Email
   - Senha (mínimo 8 caracteres)
3. Aceite os termos
4. Clique em "Criar Conta"
5. **Verifique seu email** e confirme o cadastro
6. Faça login com suas credenciais

## ✅ Checklist de Verificação

- [ ] Projeto criado no Supabase
- [ ] Schema SQL executado sem erros
- [ ] Arquivo `config/supabase.js` configurado com credenciais corretas
- [ ] Sistema rodando em servidor local
- [ ] Primeira conta criada e confirmada por email
- [ ] Login funcional
- [ ] Dashboard carregando corretamente

## 🔒 Segurança - IMPORTANTE!

### ⚠️ NUNCA COMMITE O ARQUIVO `config/supabase.js`

Este arquivo contém suas credenciais secretas. Ele já está no `.gitignore`.

### Verificar Row Level Security (RLS)

No Supabase, vá em **Database** > **Tables** e verifique se todas as tabelas têm:
- 🔒 RLS habilitado (ícone de cadeado verde)
- Políticas configuradas

Se alguma tabela estiver com cadeado vermelho, execute novamente o schema SQL.

## 🐛 Solução de Problemas Comuns

### Erro: "Invalid API key"
- Verifique se copiou corretamente a `anon key` do Supabase
- Certifique-se de que está usando a key **anon public**, não a **service_role**

### Erro: "Failed to fetch"
- Verifique a URL do projeto
- Confirme que o projeto está ativo no Supabase
- Verifique sua conexão com a internet

### Erro ao criar conta: "Invalid email"
- O Supabase requer emails válidos
- Use um email real para receber a confirmação

### Tabelas não aparecem
- Execute novamente o schema SQL
- Aguarde alguns segundos após a execução
- Recarregue a página do Supabase

### Login não funciona após criar conta
- Verifique seu email e confirme o cadastro
- Aguarde alguns minutos (pode haver delay)
- Tente fazer logout e login novamente

## 📱 Testar Funcionalidades

### 1. Dashboard
- Deve mostrar 0 em todas as métricas inicialmente
- Deve exibir "Nenhuma sessão agendada"

### 2. Pacientes
- Clique em "Novo Paciente"
- Preencha o formulário
- Marque o consentimento LGPD
- Salve e verifique se aparece na lista

### 3. Navegação
- Teste todos os itens do menu lateral
- Verifique se o menu mobile funciona (redimensione a janela)

## 🎨 Personalização

### Alterar Cores
Edite o arquivo `css/global.css` nas variáveis CSS:
```css
:root {
  --primary: #6366f1;     /* Cor primária */
  --secondary: #10b981;   /* Cor secundária */
  --accent: #8b5cf6;      /* Cor de destaque */
}
```

### Alterar Logo
Substitua o SVG nos arquivos HTML ou adicione uma imagem:
```html
<img src="assets/logo.png" alt="Logo">
```

## 📧 Configurar Email (Opcional)

Por padrão, o Supabase usa emails de teste. Para produção:

1. No Supabase, vá em **Authentication** > **Email Templates**
2. Configure um provedor SMTP (SendGrid, Mailgun, etc.)
3. Personalize os templates de email

## 🌐 Deploy em Produção

### Netlify (Recomendado)
1. Crie conta no Netlify
2. Conecte seu repositório Git
3. Configure build settings:
   - Build command: (vazio)
   - Publish directory: `.`
4. Adicione variáveis de ambiente no Netlify (opcional)

### Vercel
1. Instale Vercel CLI: `npm i -g vercel`
2. Na pasta do projeto: `vercel`
3. Siga as instruções

### GitHub Pages
1. Crie repositório no GitHub
2. Faça push do código
3. Vá em Settings > Pages
4. Selecione a branch main
5. **⚠️ ATENÇÃO**: Não inclua `config/supabase.js` no Git!

## 📚 Próximos Passos

Após configurar o básico, você pode:

1. Criar mais pacientes de teste
2. Agendar sessões na Agenda
3. Criar prontuários
4. Registrar evoluções
5. Controlar pagamentos
6. Fazer upload de documentos

## 🆘 Suporte

Se encontrar problemas:

1. Verifique o Console do navegador (F12)
2. Revise as credenciais do Supabase
3. Confirme que o schema foi executado
4. Verifique se RLS está habilitado

## 🎉 Pronto!

Seu sistema está configurado e pronto para uso!
