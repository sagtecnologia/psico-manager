-- ================================
-- SISTEMA DE GESTÃO PARA PSICÓLOGOS
-- Schema do Banco de Dados - Supabase
-- ================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ================================
-- TABELA: PSICÓLOGOS
-- ================================
CREATE TABLE psicologos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  nome VARCHAR(255) NOT NULL,
  crp VARCHAR(20) NOT NULL UNIQUE,
  especialidade VARCHAR(255),
  abordagem VARCHAR(100),
  telefone VARCHAR(20),
  email VARCHAR(255),
  valor_sessao DECIMAL(10, 2),
  horario_inicio TIME,
  horario_fim TIME,
  status VARCHAR(20) DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo')),
  foto_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================
-- TABELA: PACIENTES
-- ================================
CREATE TABLE pacientes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  psicologo_id UUID REFERENCES psicologos(id) ON DELETE CASCADE,
  nome_completo VARCHAR(255) NOT NULL,
  data_nascimento DATE NOT NULL,
  cpf VARCHAR(14) UNIQUE,
  telefone VARCHAR(20),
  email VARCHAR(255),
  endereco TEXT,
  cidade VARCHAR(100),
  estado VARCHAR(2),
  cep VARCHAR(10),
  responsavel_legal VARCHAR(255),
  telefone_responsavel VARCHAR(20),
  contato_emergencia VARCHAR(255),
  telefone_emergencia VARCHAR(20),
  consentimento_lgpd BOOLEAN DEFAULT false,
  data_consentimento TIMESTAMPTZ,
  status VARCHAR(20) DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo', 'alta')),
  observacoes TEXT,
  foto_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================
-- TABELA: SESSÕES
-- ================================
CREATE TABLE sessoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  psicologo_id UUID REFERENCES psicologos(id) ON DELETE CASCADE,
  paciente_id UUID REFERENCES pacientes(id) ON DELETE CASCADE,
  data_hora TIMESTAMPTZ NOT NULL,
  duracao INTEGER DEFAULT 50, -- em minutos
  tipo VARCHAR(20) DEFAULT 'presencial' CHECK (tipo IN ('presencial', 'online')),
  status VARCHAR(20) DEFAULT 'agendada' CHECK (status IN ('agendada', 'realizada', 'cancelada', 'falta')),
  link_online TEXT,
  valor DECIMAL(10, 2),
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================
-- TABELA: PRONTUÁRIOS
-- ================================
CREATE TABLE prontuarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  paciente_id UUID REFERENCES pacientes(id) ON DELETE CASCADE,
  psicologo_id UUID REFERENCES psicologos(id) ON DELETE CASCADE,
  queixa_principal TEXT,
  historico_paciente TEXT,
  hipotese_diagnostica TEXT,
  objetivos_terapeuticos TEXT,
  plano_terapeutico TEXT,
  observacoes_gerais TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================
-- TABELA: EVOLUÇÕES
-- ================================
CREATE TABLE evolucoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sessao_id UUID REFERENCES sessoes(id) ON DELETE CASCADE,
  prontuario_id UUID REFERENCES prontuarios(id) ON DELETE CASCADE,
  paciente_id UUID REFERENCES pacientes(id) ON DELETE CASCADE,
  psicologo_id UUID REFERENCES psicologos(id) ON DELETE CASCADE,
  data_sessao TIMESTAMPTZ NOT NULL,
  conteudo_sessao TEXT NOT NULL,
  tecnicas_aplicadas TEXT,
  observacoes_clinicas TEXT,
  planejamento_proxima TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================
-- TABELA: PAGAMENTOS
-- ================================
CREATE TABLE pagamentos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sessao_id UUID REFERENCES sessoes(id) ON DELETE CASCADE,
  paciente_id UUID REFERENCES pacientes(id) ON DELETE CASCADE,
  psicologo_id UUID REFERENCES psicologos(id) ON DELETE CASCADE,
  valor DECIMAL(10, 2) NOT NULL,
  forma_pagamento VARCHAR(50) CHECK (forma_pagamento IN ('dinheiro', 'pix', 'cartao_credito', 'cartao_debito', 'transferencia')),
  status VARCHAR(20) DEFAULT 'pendente' CHECK (status IN ('pendente', 'pago', 'cancelado')),
  data_pagamento DATE,
  comprovante_url TEXT,
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================
-- TABELA: DOCUMENTOS
-- ================================
CREATE TABLE documentos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  paciente_id UUID REFERENCES pacientes(id) ON DELETE CASCADE,
  psicologo_id UUID REFERENCES psicologos(id) ON DELETE CASCADE,
  tipo VARCHAR(100) CHECK (tipo IN ('contrato', 'termo_consentimento', 'relatorio', 'atestado', 'outro')),
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT,
  arquivo_url TEXT NOT NULL,
  arquivo_nome VARCHAR(255),
  arquivo_tamanho INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================
-- ÍNDICES PARA PERFORMANCE
-- ================================
CREATE INDEX idx_pacientes_psicologo ON pacientes(psicologo_id);
CREATE INDEX idx_sessoes_psicologo ON sessoes(psicologo_id);
CREATE INDEX idx_sessoes_paciente ON sessoes(paciente_id);
CREATE INDEX idx_sessoes_data ON sessoes(data_hora);
CREATE INDEX idx_prontuarios_paciente ON prontuarios(paciente_id);
CREATE INDEX idx_evolucoes_prontuario ON evolucoes(prontuario_id);
CREATE INDEX idx_pagamentos_status ON pagamentos(status);
CREATE INDEX idx_documentos_paciente ON documentos(paciente_id);

-- ================================
-- ROW LEVEL SECURITY (RLS)
-- ================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE psicologos ENABLE ROW LEVEL SECURITY;
ALTER TABLE pacientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE prontuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE evolucoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE documentos ENABLE ROW LEVEL SECURITY;

-- Políticas para PSICÓLOGOS
CREATE POLICY "Psicólogos podem ver seus próprios dados"
  ON psicologos FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Permitir criação de novo psicólogo no registro"
  ON psicologos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Psicólogos podem atualizar seus próprios dados"
  ON psicologos FOR UPDATE
  USING (auth.uid() = user_id);

-- Políticas para PACIENTES
CREATE POLICY "Psicólogos podem ver seus pacientes"
  ON pacientes FOR SELECT
  USING (psicologo_id IN (
    SELECT id FROM psicologos WHERE user_id = auth.uid()
  ));

CREATE POLICY "Psicólogos podem inserir pacientes"
  ON pacientes FOR INSERT
  WITH CHECK (psicologo_id IN (
    SELECT id FROM psicologos WHERE user_id = auth.uid()
  ));

CREATE POLICY "Psicólogos podem atualizar seus pacientes"
  ON pacientes FOR UPDATE
  USING (psicologo_id IN (
    SELECT id FROM psicologos WHERE user_id = auth.uid()
  ));

-- Políticas para SESSÕES
CREATE POLICY "Psicólogos podem ver suas sessões"
  ON sessoes FOR SELECT
  USING (psicologo_id IN (
    SELECT id FROM psicologos WHERE user_id = auth.uid()
  ));

CREATE POLICY "Psicólogos podem criar sessões"
  ON sessoes FOR INSERT
  WITH CHECK (psicologo_id IN (
    SELECT id FROM psicologos WHERE user_id = auth.uid()
  ));

CREATE POLICY "Psicólogos podem atualizar suas sessões"
  ON sessoes FOR UPDATE
  USING (psicologo_id IN (
    SELECT id FROM psicologos WHERE user_id = auth.uid()
  ));

-- Políticas para PRONTUÁRIOS
CREATE POLICY "Psicólogos podem ver prontuários de seus pacientes"
  ON prontuarios FOR SELECT
  USING (psicologo_id IN (
    SELECT id FROM psicologos WHERE user_id = auth.uid()
  ));

CREATE POLICY "Psicólogos podem criar prontuários"
  ON prontuarios FOR INSERT
  WITH CHECK (psicologo_id IN (
    SELECT id FROM psicologos WHERE user_id = auth.uid()
  ));

CREATE POLICY "Psicólogos podem atualizar prontuários de seus pacientes"
  ON prontuarios FOR UPDATE
  USING (psicologo_id IN (
    SELECT id FROM psicologos WHERE user_id = auth.uid()
  ));

-- Políticas para EVOLUÇÕES
CREATE POLICY "Psicólogos podem ver evoluções de seus pacientes"
  ON evolucoes FOR SELECT
  USING (psicologo_id IN (
    SELECT id FROM psicologos WHERE user_id = auth.uid()
  ));

CREATE POLICY "Psicólogos podem criar evoluções"
  ON evolucoes FOR INSERT
  WITH CHECK (psicologo_id IN (
    SELECT id FROM psicologos WHERE user_id = auth.uid()
  ));

-- Políticas para PAGAMENTOS
CREATE POLICY "Psicólogos podem ver pagamentos de suas sessões"
  ON pagamentos FOR SELECT
  USING (psicologo_id IN (
    SELECT id FROM psicologos WHERE user_id = auth.uid()
  ));

CREATE POLICY "Psicólogos podem criar pagamentos"
  ON pagamentos FOR INSERT
  WITH CHECK (psicologo_id IN (
    SELECT id FROM psicologos WHERE user_id = auth.uid()
  ));

CREATE POLICY "Psicólogos podem atualizar pagamentos"
  ON pagamentos FOR UPDATE
  USING (psicologo_id IN (
    SELECT id FROM psicologos WHERE user_id = auth.uid()
  ));

-- Políticas para DOCUMENTOS
CREATE POLICY "Psicólogos podem ver documentos de seus pacientes"
  ON documentos FOR SELECT
  USING (psicologo_id IN (
    SELECT id FROM psicologos WHERE user_id = auth.uid()
  ));

CREATE POLICY "Psicólogos podem criar documentos"
  ON documentos FOR INSERT
  WITH CHECK (psicologo_id IN (
    SELECT id FROM psicologos WHERE user_id = auth.uid()
  ));

-- ================================
-- TRIGGERS PARA UPDATED_AT
-- ================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_psicologos_updated_at BEFORE UPDATE ON psicologos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pacientes_updated_at BEFORE UPDATE ON pacientes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sessoes_updated_at BEFORE UPDATE ON sessoes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prontuarios_updated_at BEFORE UPDATE ON prontuarios
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_evolucoes_updated_at BEFORE UPDATE ON evolucoes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pagamentos_updated_at BEFORE UPDATE ON pagamentos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documentos_updated_at BEFORE UPDATE ON documentos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ================================
-- VIEWS ÚTEIS
-- ================================

-- View: Sessões com informações completas
CREATE OR REPLACE VIEW vw_sessoes_completas AS
SELECT 
  s.id,
  s.data_hora,
  s.duracao,
  s.tipo,
  s.status,
  s.valor,
  p.nome_completo AS paciente_nome,
  p.telefone AS paciente_telefone,
  ps.nome AS psicologo_nome,
  pg.status AS pagamento_status
FROM sessoes s
JOIN pacientes p ON s.paciente_id = p.id
JOIN psicologos ps ON s.psicologo_id = ps.id
LEFT JOIN pagamentos pg ON s.id = pg.sessao_id;

-- View: Resumo financeiro mensal
CREATE OR REPLACE VIEW vw_resumo_financeiro AS
SELECT 
  psicologo_id,
  DATE_TRUNC('month', data_pagamento) AS mes,
  COUNT(*) AS total_pagamentos,
  SUM(valor) AS valor_total,
  SUM(CASE WHEN status = 'pago' THEN valor ELSE 0 END) AS valor_recebido,
  SUM(CASE WHEN status = 'pendente' THEN valor ELSE 0 END) AS valor_pendente
FROM pagamentos
GROUP BY psicologo_id, DATE_TRUNC('month', data_pagamento);

COMMENT ON TABLE psicologos IS 'Cadastro de profissionais psicólogos';
COMMENT ON TABLE pacientes IS 'Cadastro de pacientes (dados protegidos por LGPD)';
COMMENT ON TABLE sessoes IS 'Agendamento e controle de sessões';
COMMENT ON TABLE prontuarios IS 'Prontuários psicológicos sigilosos';
COMMENT ON TABLE evolucoes IS 'Evoluções clínicas por sessão';
COMMENT ON TABLE pagamentos IS 'Controle financeiro de pagamentos';
COMMENT ON TABLE documentos IS 'Gestão de documentos anexados';
