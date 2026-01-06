// ================================
// CONFIGURAÇÃO DO SUPABASE
// ================================

const SUPABASE_URL = 'https://ekpswrbjaflquxmacsmq.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_4ASaBVQDA95x9zJF302enA_MeAshTRf';

// Inicializar cliente Supabase
window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('✓ Cliente Supabase inicializado');
