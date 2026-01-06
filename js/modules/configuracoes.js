// MÓDULO CONFIGURAÇÕES
let currentUser, currentPsicologo;
let configuracoes = {};

document.addEventListener('DOMContentLoaded', async () => {
  await checkAuthentication();
  await loadConfiguracoes();
  setupEventListeners();
  calcularEstatisticas();
});

async function checkAuthentication() {
  const { data: { session } } = await window.supabaseClient.auth.getSession();
  if (!session) { window.location.href = '../index.html'; return; }
  currentUser = session.user;
  const { data } = await window.supabaseClient.from('psicologos').select('*').eq('user_id', currentUser.id).single();
  currentPsicologo = data;
  updateUserInfo();
}

function updateUserInfo() {
  document.getElementById('userName').textContent = currentPsicologo.nome.split(' ')[0];
  document.getElementById('userAvatar').textContent = getInitials(currentPsicologo.nome);
}

async function loadConfiguracoes() {
  // Carregar configurações salvas do localStorage
  const savedConfig = localStorage.getItem('psico_manager_config');
  if (savedConfig) {
    configuracoes = JSON.parse(savedConfig);
    aplicarConfiguracoes();
  } else {
    // Configurações padrão
    configuracoes = {
      horarioInicio: '08:00',
      horarioFim: '18:00',
      intervaloSessoes: 10,
      lembreteEmail: false,
      lembreteWhatsapp: false,
      notifNovoPaciente: true,
      notifSessaoProxima: true,
      notifPagamento: true,
      notifRelatorio: false,
      tema: 'light',
      corPrincipal: '#6366f1',
      tamanhoFonte: 'medium'
    };
  }
}

function aplicarConfiguracoes() {
  // Agenda
  document.getElementById('horarioInicio').value = configuracoes.horarioInicio || '08:00';
  document.getElementById('horarioFim').value = configuracoes.horarioFim || '18:00';
  document.getElementById('intervaloSessoes').value = configuracoes.intervaloSessoes || 10;
  document.getElementById('lembreteEmail').checked = configuracoes.lembreteEmail || false;
  document.getElementById('lembreteWhatsapp').checked = configuracoes.lembreteWhatsapp || false;
  
  // Notificações
  document.getElementById('notifNovoPaciente').checked = configuracoes.notifNovoPaciente !== false;
  document.getElementById('notifSessaoProxima').checked = configuracoes.notifSessaoProxima !== false;
  document.getElementById('notifPagamento').checked = configuracoes.notifPagamento !== false;
  document.getElementById('notifRelatorio').checked = configuracoes.notifRelatorio || false;
  
  // Aparência
  document.getElementById('tema').value = configuracoes.tema || 'light';
  const corRadio = document.querySelector(`input[name="corPrincipal"][value="${configuracoes.corPrincipal || '#6366f1'}"]`);
  if (corRadio) corRadio.checked = true;
  document.getElementById('tamanhoFonte').value = configuracoes.tamanhoFonte || 'medium';
  
  // Aplicar tema
  aplicarTema();
}

function aplicarTema() {
  const tema = configuracoes.tema || 'light';
  const cor = configuracoes.corPrincipal || '#6366f1';
  const fonte = configuracoes.tamanhoFonte || 'medium';
  
  // Aplicar tema (pode ser expandido para modo escuro)
  if (tema === 'dark') {
    document.body.classList.add('dark-theme');
  } else {
    document.body.classList.remove('dark-theme');
  }
  
  // Aplicar cor principal
  document.documentElement.style.setProperty('--primary', cor);
  
  // Aplicar tamanho de fonte
  const fontSizes = {
    small: '14px',
    medium: '16px',
    large: '18px'
  };
  document.documentElement.style.setProperty('--base-font-size', fontSizes[fonte]);
}

async function salvarConfiguracoes(config) {
  configuracoes = { ...configuracoes, ...config };
  localStorage.setItem('psico_manager_config', JSON.stringify(configuracoes));
  aplicarTema();
  showToast('Configurações salvas com sucesso!', 'success');
}

async function handleSaveAgenda(e) {
  e.preventDefault();
  const config = {
    horarioInicio: document.getElementById('horarioInicio').value,
    horarioFim: document.getElementById('horarioFim').value,
    intervaloSessoes: parseInt(document.getElementById('intervaloSessoes').value),
    lembreteEmail: document.getElementById('lembreteEmail').checked,
    lembreteWhatsapp: document.getElementById('lembreteWhatsapp').checked
  };
  await salvarConfiguracoes(config);
}

async function handleSaveNotificacoes(e) {
  e.preventDefault();
  const config = {
    notifNovoPaciente: document.getElementById('notifNovoPaciente').checked,
    notifSessaoProxima: document.getElementById('notifSessaoProxima').checked,
    notifPagamento: document.getElementById('notifPagamento').checked,
    notifRelatorio: document.getElementById('notifRelatorio').checked
  };
  await salvarConfiguracoes(config);
}

async function handleSaveAparencia(e) {
  e.preventDefault();
  const corSelecionada = document.querySelector('input[name="corPrincipal"]:checked');
  const config = {
    tema: document.getElementById('tema').value,
    corPrincipal: corSelecionada ? corSelecionada.value : '#6366f1',
    tamanhoFonte: document.getElementById('tamanhoFonte').value
  };
  await salvarConfiguracoes(config);
}

async function handleBackup() {
  showToast('Iniciando backup...', 'info');
  
  try {
    // Buscar todos os dados do psicólogo
    const { data: pacientes } = await window.supabaseClient.from('pacientes').select('*').eq('psicologo_id', currentPsicologo.id);
    const { data: sessoes } = await window.supabaseClient.from('sessoes').select('*').eq('psicologo_id', currentPsicologo.id);
    const { data: prontuarios } = await window.supabaseClient.from('prontuarios').select('*').eq('psicologo_id', currentPsicologo.id);
    const { data: evolucoes } = await window.supabaseClient.from('evolucoes').select('*').eq('psicologo_id', currentPsicologo.id);
    const { data: pagamentos } = await window.supabaseClient.from('pagamentos').select('*').eq('psicologo_id', currentPsicologo.id);
    const { data: documentos } = await window.supabaseClient.from('documentos').select('*').eq('psicologo_id', currentPsicologo.id);
    
    const backup = {
      data: new Date().toISOString(),
      psicologo: currentPsicologo,
      pacientes,
      sessoes,
      prontuarios,
      evolucoes,
      pagamentos,
      documentos
    };
    
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_psico_manager_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    showToast('Backup realizado com sucesso!', 'success');
  } catch (error) {
    console.error('Erro ao fazer backup:', error);
    showToast('Erro ao fazer backup', 'error');
  }
}

async function handleExportarDados() {
  showToast('Exportando dados...', 'info');
  await handleBackup(); // Reutiliza a função de backup
}

async function handleExcluirConta() {
  const confirmacao = prompt('Esta ação é IRREVERSÍVEL! Digite "EXCLUIR MINHA CONTA" para confirmar:');
  
  if (confirmacao === 'EXCLUIR MINHA CONTA') {
    const confirmacao2 = confirm('Tem certeza absoluta? Todos os seus dados serão apagados permanentemente.');
    
    if (confirmacao2) {
      try {
        // Deletar todos os dados do psicólogo
        await window.supabaseClient.from('documentos').delete().eq('psicologo_id', currentPsicologo.id);
        await window.supabaseClient.from('evolucoes').delete().eq('psicologo_id', currentPsicologo.id);
        await window.supabaseClient.from('pagamentos').delete().eq('psicologo_id', currentPsicologo.id);
        await window.supabaseClient.from('prontuarios').delete().eq('psicologo_id', currentPsicologo.id);
        await window.supabaseClient.from('sessoes').delete().eq('psicologo_id', currentPsicologo.id);
        await window.supabaseClient.from('pacientes').delete().eq('psicologo_id', currentPsicologo.id);
        await window.supabaseClient.from('psicologos').delete().eq('id', currentPsicologo.id);
        
        // Deletar usuário do auth
        await window.supabaseClient.auth.admin.deleteUser(currentUser.id);
        
        // Limpar dados locais
        localStorage.clear();
        
        showToast('Conta excluída com sucesso', 'success');
        setTimeout(() => {
          window.location.href = '../index.html';
        }, 2000);
      } catch (error) {
        console.error('Erro ao excluir conta:', error);
        showToast('Erro ao excluir conta: ' + error.message, 'error');
      }
    }
  } else {
    showToast('Exclusão de conta cancelada', 'info');
  }
}

async function calcularEstatisticas() {
  // Última atualização
  document.getElementById('ultimaAtualizacao').textContent = 
    currentPsicologo.updated_at 
      ? new Date(currentPsicologo.updated_at).toLocaleDateString('pt-BR')
      : new Date(currentPsicologo.created_at).toLocaleDateString('pt-BR');
  
  // Calcular espaço utilizado (aproximação)
  try {
    const { data: pacientes } = await window.supabaseClient.from('pacientes').select('*').eq('psicologo_id', currentPsicologo.id);
    const { data: sessoes } = await window.supabaseClient.from('sessoes').select('*').eq('psicologo_id', currentPsicologo.id);
    const { data: documentos } = await window.supabaseClient.from('documentos').select('tamanho').eq('psicologo_id', currentPsicologo.id);
    
    const totalRegistros = (pacientes?.length || 0) + (sessoes?.length || 0);
    const tamanhoDocumentos = (documentos || []).reduce((sum, d) => sum + (d.tamanho || 0), 0);
    const espacoMB = ((totalRegistros * 2) + (tamanhoDocumentos / 1024)) / 1024; // Aproximação em MB
    
    document.getElementById('espacoUtilizado').textContent = `${espacoMB.toFixed(2)} MB`;
  } catch (error) {
    document.getElementById('espacoUtilizado').textContent = 'Erro ao calcular';
  }
}

function handleLimparCache() {
  if (confirm('Deseja limpar o cache? As configurações serão mantidas, mas você precisará recarregar a página.')) {
    // Manter apenas configurações importantes
    const configToKeep = localStorage.getItem('psico_manager_config');
    localStorage.clear();
    if (configToKeep) {
      localStorage.setItem('psico_manager_config', configToKeep);
    }
    showToast('Cache limpo com sucesso! Recarregando...', 'success');
    setTimeout(() => location.reload(), 1500);
  }
}

function setupEventListeners() {
  document.getElementById('formAgenda').addEventListener('submit', handleSaveAgenda);
  document.getElementById('formNotificacoes').addEventListener('submit', handleSaveNotificacoes);
  document.getElementById('formAparencia').addEventListener('submit', handleSaveAparencia);
  
  document.getElementById('btnBackup').addEventListener('click', handleBackup);
  document.getElementById('btnExportarDados').addEventListener('click', handleExportarDados);
  document.getElementById('btnExcluirConta').addEventListener('click', handleExcluirConta);
  document.getElementById('btnLimparCache').addEventListener('click', handleLimparCache);
  
  document.getElementById('logoutBtn').addEventListener('click', async () => {
    await window.supabaseClient.auth.signOut();
    window.location.href = '../index.html';
  });
}
