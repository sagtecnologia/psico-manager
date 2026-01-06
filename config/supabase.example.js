// ⚠️ INSTRUÇÕES:
// 1. Copie este arquivo para 'supabase.js'
// 2. Substitua os valores abaixo pelas credenciais do seu projeto Supabase
// 3. NUNCA commite o arquivo supabase.js com suas credenciais reais!

const SUPABASE_CONFIG = {
  url: 'https://seu-projeto.supabase.co',
  anonKey: 'sua-anon-key-aqui'
};

// Inicializa o cliente Supabase
const supabase = window.supabase.createClient(
  SUPABASE_CONFIG.url,
  SUPABASE_CONFIG.anonKey
);

// Exporta para uso global
window.supabaseClient = supabase;
