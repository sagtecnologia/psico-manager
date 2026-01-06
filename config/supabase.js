// ================================
// CONFIGURAÇÃO DO SUPABASE
// ================================
// 
// ⚠️ SUBSTITUA AS CREDENCIAIS ABAIXO PELAS SUAS!
// 
// Para obter suas credenciais:
// 1. Acesse: https://app.supabase.com
// 2. Selecione seu projeto
// 3. Vá em Settings > API
// 4. Copie a Project URL e a anon/public key

const SUPABASE_URL = 'https://ekpswrbjaflquxmacsmq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVrcHN3cmJqYWZscXV4bWFjc21xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY4MTI4NTIsImV4cCI6MjA1MjM4ODg1Mn0.4FJVcwYEb-C1jkUwEtVzx7XrgHAoJH84ypj5n4RvqVA';

// Inicializar cliente Supabase
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('✓ Cliente Supabase inicializado');
