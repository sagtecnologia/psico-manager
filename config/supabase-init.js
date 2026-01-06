// ================================
// INICIALIZAÇÃO DO SUPABASE
// ================================
// Este arquivo funciona tanto em desenvolvimento quanto em produção
// 
// DESENVOLVIMENTO LOCAL:
// - Crie o arquivo config/supabase.js com suas credenciais
// - Este arquivo terá prioridade
//
// PRODUÇÃO (Netlify/Vercel/etc):
// - Configure as variáveis de ambiente:
//   * SUPABASE_URL
//   * SUPABASE_ANON_KEY

(function() {
  'use strict';
  
  // Verificar se já foi inicializado pelo arquivo local
  if (typeof supabase !== 'undefined' && supabase) {
    console.log('✓ Supabase inicializado via arquivo local');
    return;
  }
  
  // Tentar usar variáveis de ambiente (produção)
  let supabaseUrl = '';
  let supabaseKey = '';
  
  // Verificar se há meta tags com as credenciais
  const urlMeta = document.querySelector('meta[name="supabase-url"]');
  const keyMeta = document.querySelector('meta[name="supabase-key"]');
  
  if (urlMeta && keyMeta) {
    supabaseUrl = urlMeta.content;
    supabaseKey = keyMeta.content;
    console.log('✓ Credenciais do Supabase encontradas em meta tags');
  }
  
  // Verificar se as credenciais são válidas
  if (!supabaseUrl || !supabaseKey || 
      supabaseUrl.includes('seu-projeto') || 
      supabaseKey.includes('sua-chave')) {
    console.error('❌ Erro: Credenciais do Supabase não configuradas!');
    console.error('📋 Instruções:');
    console.error('   DESENVOLVIMENTO LOCAL:');
    console.error('   1. Copie config/supabase.template.js para config/supabase.js');
    console.error('   2. Adicione suas credenciais do Supabase');
    console.error('');
    console.error('   PRODUÇÃO (Netlify/Vercel):');
    console.error('   1. Adicione suas credenciais nas meta tags do HTML');
    console.error('   2. Ou configure as variáveis de ambiente na plataforma');
    
    // Mostrar alerta para o usuário
    window.addEventListener('DOMContentLoaded', function() {
      const message = 'Erro de Configuração!\n\n' +
                     'As credenciais do Supabase não foram configuradas.\n\n' +
                     'Por favor, consulte o arquivo DEPLOY.md para instruções.';
      alert(message);
    });
    
    return;
  }
  
  // Inicializar o Supabase
  if (typeof window.supabase !== 'undefined' && window.supabase.createClient) {
    window.supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
    console.log('✓ Cliente Supabase inicializado via meta tags');
  } else {
    console.error('❌ Erro: Biblioteca Supabase não carregada!');
    console.error('Certifique-se de que o CDN do Supabase está sendo carregado.');
  }
})();
