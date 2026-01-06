// ================================
// CONFIGURAÇÃO DO SUPABASE
// ================================
// 
// ESTE ARQUIVO DEVE SER RENOMEADO PARA: supabase.js
// 
// INSTRUÇÕES PARA DESENVOLVIMENTO LOCAL:
// 1. Copie este arquivo: cp config/supabase.template.js config/supabase.js
// 2. Substitua as credenciais abaixo pelas suas do Supabase
// 3. O arquivo supabase.js NÃO será commitado (está no .gitignore)
//
// INSTRUÇÕES PARA PRODUÇÃO (Netlify/Vercel):
// Configure as variáveis de ambiente no painel da plataforma:
// - SUPABASE_URL = sua URL do Supabase
// - SUPABASE_ANON_KEY = sua chave anon do Supabase
//
// Para obter suas credenciais:
// 1. Acesse: https://app.supabase.com
// 2. Selecione seu projeto
// 3. Vá em Settings > API
// 4. Copie a Project URL e a anon/public key

// ⚠️ SUBSTITUA OS VALORES ABAIXO:
const SUPABASE_URL = 'https://seu-projeto.supabase.co';
const SUPABASE_ANON_KEY = 'sua-chave-anonima-aqui';

// Inicializar cliente Supabase
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('✓ Cliente Supabase inicializado');
