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

## 🛠️ Configuração

1. **Crie um projeto no Supabase**: https://supabase.com
2. **Configure as variáveis de ambiente**:
   - Copie `config/supabase.example.js` para `config/supabase.js`
   - Adicione suas credenciais do Supabase
3. **Execute o schema do banco**: Execute o SQL em `database/schema.sql` no Supabase
4. **Abra o projeto**: Abra `index.html` em um servidor local

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
