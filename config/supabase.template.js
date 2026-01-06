// ================================
// CONFIGURAÇÃO DO SUPABASE
// ================================
// 
// INSTRUÇÕES DE INSTALAÇÃO:
// 1. Copie este arquivo e renomeie para: supabase.js
// 2. Substitua as credenciais abaixo pelas suas credenciais reais do Supabase
// 3. Nunca commite o arquivo supabase.js no Git (ele está protegido pelo .gitignore)
//
// Para obter suas credenciais:
// 1. Acesse: https://app.supabase.com
// 2. Selecione seu projeto
// 3. Vá em Settings > API
// 4. Copie a Project URL e a anon/public key

const SUPABASE_URL = 'https://seu-projeto.supabase.co';
const SUPABASE_ANON_KEY = 'sua-chave-anonima-aqui';

// Inicializar cliente Supabase
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('✓ Cliente Supabase inicializado');
