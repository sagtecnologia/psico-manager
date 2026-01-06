# 🧠 Sistema de Gestão para Psicólogos

Sistema profissional completo para gestão de consultórios e clínicas de psicologia.

## 🚀 Tecnologias

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: Supabase (Auth + Database)
- **Segurança**: LGPD compliant, Row Level Security

## 📋 Funcionalidades

- ✅ Autenticação segura
- 📊 Dashboard com métricas
- 👥 Gestão de Pacientes
- 📅 Agenda de Sessões
- 📝 Prontuários Psicológicos
- 💰 Controle Financeiro
- 📄 Gestão de Documentos
- 🔒 Conformidade LGPD

## 🛠️ Instalação Local

1. **Clone o repositório**:
   ```bash
   git clone https://github.com/sagtecnologia/psico-manager.git
   cd psico-manager
   ```

2. **Configure o Supabase**:
   ```bash
   # Copie o template de configuração
   cp config/supabase.template.js config/supabase.js
   ```
   
3. **Adicione suas credenciais** no arquivo `config/supabase.js`:
   - Crie um projeto em [supabase.com](https://supabase.com)
   - Copie a Project URL e anon key
   - Cole no arquivo de configuração

4. **Configure o banco de dados**:
   - Execute `database/schema.sql` no SQL Editor do Supabase
   - Execute `database/fix-rls-complete.sql` para segurança

5. **Abra o projeto**:
   ```bash
   # Usando Python
   python -m http.server 8000
   
   # Ou usando Node.js
   npx serve
   ```
   
6. **Acesse**: http://localhost:8000

## 🚀 Deploy em Produção

Para fazer deploy em produção, consulte o guia completo:

👉 **[DEPLOY.md](DEPLOY.md)** - Instruções completas de deploy

### Quick Start para Deploy:
1. Crie `config/supabase.js` com suas credenciais
2. Execute os scripts SQL no Supabase
3. Faça upload dos arquivos para seu servidor
4. Acesse e teste!

**Plataformas recomendadas (grátis):**
- GitHub Pages
- Vercel
- Netlify

## 📁 Estrutura do Projeto

```
psico-manager/
├── index.html              # Página de login
├── dashboard.html          # Dashboard principal
├── css/
│   ├── global.css         # Estilos globais
│   ├── auth.css           # Estilos de autenticação
│   └── modules/           # Estilos por módulo
├── js/
│   ├── auth/              # Sistema de autenticação
│   ├── modules/           # Módulos do sistema
│   └── utils/             # Utilitários
├── pages/                 # Páginas HTML dos módulos
├── assets/                # Imagens e recursos
└── database/              # Scripts SQL
```

## 🔐 Segurança

- Autenticação via Supabase Auth
- Row Level Security (RLS) habilitado
- Criptografia de dados sensíveis
- Logout automático por inatividade
- Conformidade com LGPD

## 📱 Responsividade

Interface totalmente responsiva e adaptável para desktop, tablet e mobile.

## 📄 Licença

Proprietary - Todos os direitos reservados
