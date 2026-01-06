-- ================================
-- SCRIPT: Limpar todos os dados mantendo apenas usuários
-- ================================
-- Este script remove todos os pacientes, sessões, prontuários,
-- evoluções, documentos e pagamentos do sistema,
-- mantendo apenas os psicólogos e usuários cadastrados.

-- ATENÇÃO: Esta operação é IRREVERSÍVEL!
-- Execute apenas se tiver certeza que deseja limpar todos os dados.

-- Desabilitar temporariamente as verificações de foreign key (se necessário)
-- SET session_replication_role = 'replica';

-- 1. Limpar pagamentos (financeiro)
DELETE FROM pagamentos;
SELECT 'Pagamentos excluídos: ' || COUNT(*) FROM pagamentos;

-- 2. Limpar evoluções clínicas
DELETE FROM evolucoes;
SELECT 'Evoluções excluídas: ' || COUNT(*) FROM evolucoes;

-- 3. Limpar documentos
DELETE FROM documentos;
SELECT 'Documentos excluídos: ' || COUNT(*) FROM documentos;

-- 4. Limpar prontuários
DELETE FROM prontuarios;
SELECT 'Prontuários excluídos: ' || COUNT(*) FROM prontuarios;

-- 5. Limpar sessões/agendamentos
DELETE FROM sessoes;
SELECT 'Sessões excluídas: ' || COUNT(*) FROM sessoes;

-- 6. Limpar pacientes
DELETE FROM pacientes;
SELECT 'Pacientes excluídos: ' || COUNT(*) FROM pacientes;

-- Reabilitar verificações de foreign key
-- SET session_replication_role = 'origin';

-- Verificar tabelas restantes
SELECT 'Psicólogos mantidos: ' || COUNT(*) FROM psicologos;
SELECT 'Usuários mantidos: ' || COUNT(*) FROM auth.users;

-- Resetar sequências (opcional - para IDs começarem do 1 novamente)
-- ALTER SEQUENCE pacientes_id_seq RESTART WITH 1;
-- ALTER SEQUENCE sessoes_id_seq RESTART WITH 1;
-- ALTER SEQUENCE prontuarios_id_seq RESTART WITH 1;
-- ALTER SEQUENCE evolucoes_id_seq RESTART WITH 1;
-- ALTER SEQUENCE documentos_id_seq RESTART WITH 1;
-- ALTER SEQUENCE pagamentos_id_seq RESTART WITH 1;

-- Mensagem final
SELECT '✓ Limpeza concluída! Apenas psicólogos/usuários foram mantidos.' AS resultado;
