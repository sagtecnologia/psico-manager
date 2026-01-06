-- ================================
-- FIX COMPLETO: Row Level Security para registro de psicólogos
-- Execute este script no SQL Editor do Supabase
-- ================================

-- 1. Remover política antiga se existir
DROP POLICY IF EXISTS "Permitir criação de novo psicólogo no registro" ON psicologos;
DROP POLICY IF EXISTS "Psicólogos podem ver seus próprios dados" ON psicologos;
DROP POLICY IF EXISTS "Psicólogos podem atualizar seus próprios dados" ON psicologos;

-- 2. Criar função para registrar novo psicólogo
CREATE OR REPLACE FUNCTION registrar_psicologo(
  p_user_id UUID,
  p_nome VARCHAR,
  p_crp VARCHAR,
  p_email VARCHAR
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_psicologo_id UUID;
BEGIN
  -- Verificar se o user_id corresponde ao usuário autenticado
  IF auth.uid() != p_user_id THEN
    RAISE EXCEPTION 'Não autorizado';
  END IF;
  
  -- Inserir psicólogo
  INSERT INTO psicologos (user_id, nome, crp, email, status)
  VALUES (p_user_id, p_nome, p_crp, p_email, 'ativo')
  RETURNING id INTO v_psicologo_id;
  
  RETURN v_psicologo_id;
END;
$$;

-- 3. Recriar políticas RLS para psicólogos
CREATE POLICY "Psicólogos podem ver seus próprios dados"
  ON psicologos FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Psicólogos podem atualizar seus próprios dados"
  ON psicologos FOR UPDATE
  USING (auth.uid() = user_id);

-- 4. Política permissiva para INSERT (alternativa à função)
CREATE POLICY "Permitir auto-registro de psicólogos"
  ON psicologos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 5. Garantir que a tabela tem RLS habilitado
ALTER TABLE psicologos ENABLE ROW LEVEL SECURITY;

-- Mensagem de sucesso
DO $$ 
BEGIN 
  RAISE NOTICE 'Políticas RLS configuradas com sucesso!';
END $$;
