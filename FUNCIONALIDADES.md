# 🧠 Psico Manager - Sistema Completo de Gestão

## ✨ Características do Sistema

### ✅ Desenvolvido
- 🔐 **Autenticação completa** (Login, Registro, Recuperação de senha)
- 📊 **Dashboard interativo** com métricas em tempo real
- 👥 **Gestão de Pacientes** (CRUD completo com validações LGPD)
- 🎨 **Interface moderna e responsiva**
- 🔒 **Segurança avançada** (Row Level Security)
- 📱 **Design mobile-first**

### 📦 Tecnologias Utilizadas
- **Frontend**: HTML5, CSS3, JavaScript Vanilla
- **Backend**: Supabase (PostgreSQL + Auth)
- **Segurança**: Row Level Security (RLS), LGPD compliant

## 📁 Estrutura do Projeto

```
psico-manager/
├── index.html                  # Página de login/registro
├── dashboard.html              # Dashboard principal
├── README.md                   # Documentação
├── CONFIGURACAO.md             # Guia de configuração
├── .gitignore                  # Arquivos ignorados pelo Git
│
├── config/
│   ├── supabase.example.js     # Exemplo de configuração
│   └── supabase.js             # ⚠️ Suas credenciais (NÃO commitar!)
│
├── database/
│   └── schema.sql              # Schema completo do banco
│
├── css/
│   ├── global.css              # Estilos globais
│   ├── auth.css                # Estilos de autenticação
│   └── modules/
│       ├── dashboard.css       # Estilos do dashboard
│       └── pacientes.css       # Estilos do módulo pacientes
│
├── js/
│   ├── utils/
│   │   └── helpers.js          # Funções auxiliares
│   ├── auth/
│   │   └── login.js            # Lógica de autenticação
│   └── modules/
│       ├── dashboard.js        # Lógica do dashboard
│       └── pacientes.js        # Lógica do módulo pacientes
│
└── pages/
    ├── pacientes.html          # Gestão de pacientes
    ├── agenda.html             # (Em desenvolvimento)
    ├── prontuarios.html        # (Em desenvolvimento)
    ├── evolucoes.html          # (Em desenvolvimento)
    ├── financeiro.html         # (Em desenvolvimento)
    └── documentos.html         # (Em desenvolvimento)
```

## 🚀 Como Usar

### 1. Configuração Inicial
Siga o guia completo em [CONFIGURACAO.md](CONFIGURACAO.md)

### 2. Resumo Rápido
```bash
# 1. Criar projeto no Supabase
# 2. Executar database/schema.sql
# 3. Copiar config/supabase.example.js para config/supabase.js
# 4. Adicionar suas credenciais
# 5. Abrir index.html em um servidor local
```

## 🔑 Funcionalidades Principais

### Dashboard
- Métricas em tempo real
- Próximas sessões
- Atividades recentes
- Alertas e lembretes
- Aniversariantes do dia

### Pacientes
- ✅ Cadastro completo com validações
- ✅ Busca e filtros avançados
- ✅ Validação de CPF
- ✅ Máscaras automáticas (telefone, CPF, etc.)
- ✅ Detecção de menores de idade
- ✅ Consentimento LGPD obrigatório
- ✅ Status (Ativo, Inativo, Alta)
- ✅ Contato de emergência
- ✅ Responsável legal (para menores)

### Segurança e LGPD
- ✅ Row Level Security habilitado
- ✅ Dados criptografados
- ✅ Consentimento LGPD obrigatório
- ✅ Política de privacidade
- ✅ Controle de acesso por psicólogo
- ✅ Logout automático por inatividade (30 min)

## 📱 Design Responsivo

O sistema é totalmente responsivo e funciona em:
- 💻 Desktop (1920px+)
- 💻 Laptop (1366px+)
- 📱 Tablet (768px+)
- 📱 Mobile (320px+)

## 🎨 Paleta de Cores

```css
Primária:   #6366f1 (Índigo)
Secundária: #10b981 (Verde)
Destaque:   #8b5cf6 (Roxo)
Sucesso:    #10b981 (Verde)
Aviso:      #f59e0b (Laranja)
Erro:       #ef4444 (Vermelho)
Info:       #3b82f6 (Azul)
```

## 🗃️ Banco de Dados

### Tabelas Principais
- `psicologos` - Profissionais cadastrados
- `pacientes` - Pacientes com dados completos
- `sessoes` - Agendamento de sessões
- `prontuarios` - Prontuários psicológicos
- `evolucoes` - Evoluções clínicas
- `pagamentos` - Controle financeiro
- `documentos` - Arquivos e documentos

### Segurança (RLS)
Cada psicólogo só acessa seus próprios dados:
- Pacientes vinculados
- Sessões agendadas
- Prontuários criados
- Pagamentos registrados

## 🔧 Funções Auxiliares

### Formatação
- `formatCPF()` - Formata CPF
- `formatPhone()` - Formata telefone
- `formatCurrency()` - Formata moeda BRL
- `formatDate()` - Formata datas
- `formatDateTime()` - Formata data e hora

### Validação
- `validateCPF()` - Valida CPF com dígitos verificadores
- `validateEmail()` - Valida email
- `isMinor()` - Verifica se é menor de idade

### Utilidades
- `showToast()` - Exibe notificações
- `showLoading()` - Mostra loading em botões
- `debounce()` - Otimiza eventos de input
- `storage.*` - Helpers para localStorage
- `exportToCSV()` - Exporta dados para CSV

## 🚧 Módulos em Desenvolvimento

Os seguintes módulos estão com a estrutura pronta, mas precisam de implementação completa:

1. **Agenda** - Sistema de agendamento com calendário
2. **Prontuários** - Registro completo de prontuários
3. **Evoluções** - Anotações de evoluções por sessão
4. **Financeiro** - Controle de pagamentos e relatórios
5. **Documentos** - Upload e gestão de arquivos

## 📈 Roadmap Futuro

### Curto Prazo
- [ ] Implementar módulo Agenda com calendário
- [ ] Sistema de prontuários completo
- [ ] Registro de evoluções
- [ ] Controle financeiro

### Médio Prazo
- [ ] Upload de documentos (Storage do Supabase)
- [ ] Relatórios em PDF
- [ ] Gráficos e estatísticas
- [ ] Notificações por email

### Longo Prazo
- [ ] App mobile (React Native)
- [ ] Integração com agenda Google
- [ ] Videoconferência integrada
- [ ] Assinatura digital de documentos

## 🤝 Contribuindo

Este é um projeto de código aberto. Contribuições são bem-vindas!

1. Fork o projeto
2. Crie uma branch: `git checkout -b feature/nova-funcionalidade`
3. Commit suas mudanças: `git commit -m 'Adiciona nova funcionalidade'`
4. Push para a branch: `git push origin feature/nova-funcionalidade`
5. Abra um Pull Request

## ⚠️ Importante

### Segurança
- **NUNCA** exponha suas credenciais do Supabase
- **SEMPRE** use HTTPS em produção
- **MANTENHA** o RLS habilitado
- **FAÇA** backups regulares

### LGPD
- Obtenha consentimento explícito dos pacientes
- Mantenha dados atualizados e seguros
- Permita exclusão de dados quando solicitado
- Cumpra o prazo de resposta de 15 dias

## 📄 Licença

Este projeto é proprietário. Todos os direitos reservados.

## 📧 Contato

Para dúvidas ou suporte:
- Abra uma issue no GitHub
- Consulte a documentação
- Verifique o guia de configuração

## 🎉 Agradecimentos

Desenvolvido com ❤️ para auxiliar profissionais de psicologia na gestão de seus consultórios.

---

**Versão**: 1.0.0  
**Última atualização**: Janeiro 2026
