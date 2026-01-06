-- ================================
-- ADICIONAR SUPORTE A DESPESAS
-- ================================
-- Adiciona campos para diferenciar receitas (sessões) de despesas na tabela pagamentos

-- 1. Adicionar coluna tipo_transacao
ALTER TABLE pagamentos 
ADD COLUMN IF NOT EXISTS tipo_transacao VARCHAR(20) DEFAULT 'receita' CHECK (tipo_transacao IN ('receita', 'despesa'));

-- 2. Adicionar coluna categoria para despesas
ALTER TABLE pagamentos 
ADD COLUMN IF NOT EXISTS categoria VARCHAR(50);

-- 3. Adicionar coluna descricao para despesas
ALTER TABLE pagamentos 
ADD COLUMN IF NOT EXISTS descricao TEXT;

-- 4. Tornar sessao_id opcional (despesas não têm sessão)
ALTER TABLE pagamentos 
ALTER COLUMN sessao_id DROP NOT NULL;

-- 5. Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_pagamentos_tipo ON pagamentos(tipo_transacao);
CREATE INDEX IF NOT EXISTS idx_pagamentos_categoria ON pagamentos(categoria);

-- 6. Atualizar registros existentes como receita
UPDATE pagamentos 
SET tipo_transacao = 'receita' 
WHERE tipo_transacao IS NULL;

-- 7. Adicionar comentários
COMMENT ON COLUMN pagamentos.tipo_transacao IS 'Tipo da transação: receita (sessões) ou despesa';
COMMENT ON COLUMN pagamentos.categoria IS 'Categoria da despesa: aluguel, material, equipamento, etc';
COMMENT ON COLUMN pagamentos.descricao IS 'Descrição detalhada da despesa';

-- Verificar estrutura atualizada
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'pagamentos'
ORDER BY ordinal_position;

-- Mensagem de sucesso
SELECT '✓ Tabela pagamentos atualizada com suporte a despesas!' AS resultado;
