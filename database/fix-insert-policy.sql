-- ================================
-- FIX: Adicionar política de INSERT para psicólogos
-- Execute este script no SQL Editor do Supabase
-- ================================

-- Criar política para permitir inserção de novos psicólogos durante o registro
CREATE POLICY "Permitir criação de novo psicólogo no registro"
  ON psicologos FOR INSERT
  WITH CHECK (auth.uid() = user_id);
