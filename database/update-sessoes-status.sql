-- ================================
-- ATUALIZAÇÃO: Adicionar status "em_andamento" e campos de controle
-- ================================

-- Adicionar novo status à tabela sessoes
ALTER TABLE sessoes DROP CONSTRAINT IF EXISTS sessoes_status_check;
ALTER TABLE sessoes ADD CONSTRAINT sessoes_status_check 
  CHECK (status IN ('agendada', 'em_andamento', 'realizada', 'cancelada', 'falta'));

-- Adicionar campos de controle de tempo
ALTER TABLE sessoes ADD COLUMN IF NOT EXISTS iniciada_em TIMESTAMPTZ;
ALTER TABLE sessoes ADD COLUMN IF NOT EXISTS finalizada_em TIMESTAMPTZ;

-- Comentários
COMMENT ON COLUMN sessoes.iniciada_em IS 'Timestamp de quando a sessão foi iniciada';
COMMENT ON COLUMN sessoes.finalizada_em IS 'Timestamp de quando a sessão foi finalizada';
COMMENT ON CONSTRAINT sessoes_status_check ON sessoes IS 'Status da sessão: agendada, em_andamento, realizada, cancelada ou falta';
