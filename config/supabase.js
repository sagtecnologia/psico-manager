// ================================
// CONFIGURAÇÃO DO SUPABASE
// ================================

const SUPABASE_URL = 'https://ekpswrbjaflquxmacsmq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVrcHN3cmJqYWZscXV4bWFjc21xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY4MTI4NTIsImV4cCI6MjA1MjM4ODg1Mn0.4FJVcwYEb-C1jkUwEtVzx7XrgHAoJH84ypj5n4RvqVA';

// Inicializar cliente Supabase
window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('✓ Cliente Supabase inicializado');
