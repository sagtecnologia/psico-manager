// ================================
// CONFIGURAÇÃO DO SUPABASE
// ================================
// 
// ⚠️ ATENÇÃO: SUBSTITUA AS CREDENCIAIS ABAIXO PELAS SUAS CREDENCIAIS REAIS!
// 
// 🔑 Como obter suas credenciais:
// 1. Acesse: https://app.supabase.com
// 2. Selecione seu projeto
// 3. Vá em: Settings > API
// 4. Copie:
//    - Project URL → SUPABASE_URL
//    - anon public → SUPABASE_ANON_KEY (a chave longa que começa com "eyJ...")
//
// ⚠️ IMPORTANTE: Certifique-se de copiar a chave COMPLETA (ela é muito longa!)

const SUPABASE_URL = 'https://seu-projeto.supabase.co';
const SUPABASE_ANON_KEY = 'sua-chave-anonima-completa-aqui-ela-e-muito-longa-comeca-com-eyJ';

// Inicializar cliente Supabase
window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('✓ Cliente Supabase inicializado');
