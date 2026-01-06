// ================================
// MÓDULO PRONTUÁRIOS
// ================================

let currentUser = null;
let currentPsicologo = null;
let pacientes = [];
let prontuarios = [];
let allProntuarios = []; // Armazenar dados originais
let editingProntuarioId = null;

document.addEventListener('DOMContentLoaded', async () => {
  await checkAuthentication();
  await loadPacientes();
  await loadProntuarios();
  setupEventListeners();
});

async function checkAuthentication() {
  try {
    const { data: { session }, error } = await window.supabaseClient.auth.getSession();
    if (error || !session) {
      window.location.href = '../index.html';
      return;
    }
    currentUser = session.user;
    
    const { data: psicologo } = await window.supabaseClient
      .from('psicologos')
      .select('*')
      .eq('user_id', currentUser.id)
      .single();
    
    currentPsicologo = psicologo;
    updateUserInfo();
  } catch (error) {
    console.error('Erro na autenticação:', error);
    window.location.href = '../index.html';
  }
}

function updateUserInfo() {
  const userName = document.getElementById('userName');
  const userAvatar = document.getElementById('userAvatar');
  if (userName) userName.textContent = currentPsicologo.nome.split(' ')[0];
  if (userAvatar) userAvatar.textContent = getInitials(currentPsicologo.nome);
}

async function loadPacientes() {
  const { data } = await window.supabaseClient
    .from('pacientes')
    .select('*')
    .eq('psicologo_id', currentPsicologo.id)
    .order('nome_completo');
  
  pacientes = data || [];
  
  const select = document.getElementById('prontuarioPaciente');
  select.innerHTML = '<option value="">Selecione um paciente</option>';
  pacientes.forEach(p => {
    select.innerHTML += `<option value="${p.id}">${p.nome_completo}</option>`;
  });
}

async function loadProntuarios() {
  const { data } = await window.supabaseClient
    .from('prontuarios')
    .select(`
      *,
      paciente:pacientes(id, nome_completo, status, telefone)
    `)
    .eq('psicologo_id', currentPsicologo.id)
    .order('created_at', { ascending: false });
  
  prontuarios = data || [];
  allProntuarios = data || []; // Armazenar cópia dos dados originais
  renderProntuarios();
}

function renderProntuarios() {
  const grid = document.getElementById('prontuariosGrid');
  
  if (prontuarios.length === 0) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="64" height="64">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
        </svg>
        <h3>Nenhum prontuário cadastrado</h3>
        <p>Clique em "Novo Prontuário" para começar</p>
      </div>
    `;
    return;
  }
  
  grid.innerHTML = prontuarios.map(p => `
    <div class="prontuario-card" onclick="editProntuario('${p.id}')">
      <div class="prontuario-header">
        <div class="prontuario-avatar">${getInitials(p.paciente.nome_completo)}</div>
        <div class="prontuario-info">
          <div class="prontuario-paciente">${p.paciente.nome_completo}</div>
          <div class="prontuario-data">Criado em ${formatDate(p.created_at)}</div>
        </div>
      </div>
      <div class="prontuario-content">
        ${p.queixa_principal || 'Sem queixa registrada'}
      </div>
      <div class="prontuario-footer">
        <span>${p.paciente.status === 'ativo' ? '🟢 Ativo' : '⚪ Alta'}</span>
        <span>Atualizado: ${formatDate(p.updated_at)}</span>
      </div>
    </div>
  `).join('');
}

function setupEventListeners() {
  document.getElementById('btnNovoProntuario').addEventListener('click', () => {
    editingProntuarioId = null;
    document.getElementById('modalProntuarioTitle').textContent = 'Novo Prontuário';
    document.getElementById('formProntuario').reset();
    document.getElementById('modalProntuario').style.display = 'flex';
  });
  
  document.getElementById('closeProntuarioModal').addEventListener('click', () => {
    document.getElementById('modalProntuario').style.display = 'none';
  });
  
  document.getElementById('btnCancelarProntuario').addEventListener('click', () => {
    document.getElementById('modalProntuario').style.display = 'none';
  });
  
  document.getElementById('formProntuario').addEventListener('submit', handleSaveProntuario);
  
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(`tab-${btn.dataset.tab}`).classList.add('active');
    });
  });
  
  document.getElementById('searchPaciente').addEventListener('input', filterProntuarios);
  document.getElementById('filterStatus').addEventListener('change', filterProntuarios);
  document.getElementById('filterOrdenacao').addEventListener('change', filterProntuarios);
  document.getElementById('btnLimparFiltros').addEventListener('click', limparFiltros);
  
  document.getElementById('logoutBtn').addEventListener('click', async () => {
    await window.supabaseClient.auth.signOut();
    window.location.href = '../index.html';
  });
}

function limparFiltros() {
  document.getElementById('searchPaciente').value = '';
  document.getElementById('filterStatus').value = '';
  document.getElementById('filterOrdenacao').value = 'recente';
  filterProntuarios();
}

function filterProntuarios() {
  const search = document.getElementById('searchPaciente').value.toLowerCase();
  const status = document.getElementById('filterStatus').value;
  const ordenacao = document.getElementById('filterOrdenacao').value;
  
  let filtered = [...allProntuarios]; // Keep original data
  
  if (search) {
    filtered = filtered.filter(p => 
      p.paciente.nome_completo.toLowerCase().includes(search)
    );
  }
  
  if (status) {
    filtered = filtered.filter(p => p.paciente.status === status);
  }
  
  // Ordenação
  switch(ordenacao) {
    case 'recente':
      filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      break;
    case 'antigo':
      filtered.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      break;
    case 'paciente':
      filtered.sort((a, b) => a.paciente.nome_completo.localeCompare(b.paciente.nome_completo));
      break;
    case 'paciente_desc':
      filtered.sort((a, b) => b.paciente.nome_completo.localeCompare(a.paciente.nome_completo));
      break;
  }
  
  prontuarios = filtered;
  renderProntuarios();
}

async function handleSaveProntuario(e) {
  e.preventDefault();
  
  const btn = document.getElementById('btnSalvarProntuario');
  const btnText = btn.querySelector('.btn-text');
  const btnLoading = btn.querySelector('.btn-loading');
  
  btn.disabled = true;
  btnText.style.display = 'none';
  btnLoading.style.display = 'inline-flex';
  
  try {
    const data = {
      psicologo_id: currentPsicologo.id,
      paciente_id: document.getElementById('prontuarioPaciente').value,
      queixa_principal: document.getElementById('queixaPrincipal').value,
      historico_paciente: document.getElementById('historicoPaciente').value || null,
      hipotese_diagnostica: document.getElementById('hipoteseDiagnostica').value || null,
      objetivos_terapeuticos: document.getElementById('objetivosTerapeuticos').value || null,
      plano_terapeutico: document.getElementById('planoTerapeutico').value || null,
      observacoes_gerais: document.getElementById('observacoesGerais').value || null
    };
    
    if (editingProntuarioId) {
      await window.supabaseClient
        .from('prontuarios')
        .update(data)
        .eq('id', editingProntuarioId);
      showToast('Prontuário atualizado com sucesso!', 'success');
    } else {
      await window.supabaseClient
        .from('prontuarios')
        .insert([data]);
      showToast('Prontuário criado com sucesso!', 'success');
    }
    
    document.getElementById('modalProntuario').style.display = 'none';
    await loadProntuarios();
    
  } catch (error) {
    console.error('Erro ao salvar prontuário:', error);
    showToast('Erro ao salvar prontuário', 'error');
  } finally {
    btn.disabled = false;
    btnText.style.display = 'inline';
    btnLoading.style.display = 'none';
  }
}

async function editProntuario(id) {
  editingProntuarioId = id;
  const prontuario = prontuarios.find(p => p.id === id);
  if (!prontuario) return;
  
  document.getElementById('modalProntuarioTitle').textContent = `Prontuário - ${prontuario.paciente.nome_completo}`;
  document.getElementById('prontuarioPaciente').value = prontuario.paciente_id;
  document.getElementById('prontuarioPaciente').disabled = true;
  document.getElementById('queixaPrincipal').value = prontuario.queixa_principal || '';
  document.getElementById('historicoPaciente').value = prontuario.historico_paciente || '';
  document.getElementById('hipoteseDiagnostica').value = prontuario.hipotese_diagnostica || '';
  document.getElementById('objetivosTerapeuticos').value = prontuario.objetivos_terapeuticos || '';
  document.getElementById('planoTerapeutico').value = prontuario.plano_terapeutico || '';
  document.getElementById('observacoesGerais').value = prontuario.observacoes_gerais || '';
  
  await loadEvolucoes(id);
  
  document.getElementById('modalProntuario').style.display = 'flex';
}

async function loadEvolucoes(prontuarioId) {
  const { data } = await window.supabaseClient
    .from('evolucoes')
    .select('*')
    .eq('prontuario_id', prontuarioId)
    .order('created_at', { ascending: false });
  
  const container = document.getElementById('evolucoesContainer');
  
  if (!data || data.length === 0) {
    container.innerHTML = '<p class="text-secondary">Nenhuma evolução registrada ainda.</p>';
    return;
  }
  
  container.innerHTML = data.map(e => `
    <div class="evolucao-item" style="padding: 1rem; background: var(--bg-secondary); border-radius: var(--border-radius); margin-bottom: 1rem;">
      <div style="font-weight: 600; margin-bottom: 0.5rem;">${formatDate(e.created_at)}</div>
      <div style="color: var(--text-secondary); font-size: 0.875rem;">${e.conteudo || 'Sem conteúdo'}</div>
    </div>
  `).join('');
}

function getInitials(name) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    padding: 1rem 1.5rem;
    border-radius: 8px;
    color: white;
    font-weight: 500;
    z-index: 10000;
    animation: slideIn 0.3s ease;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  `;
  
  if (type === 'success') toast.style.background = 'var(--success-color)';
  else if (type === 'error') toast.style.background = 'var(--danger-color)';
  else toast.style.background = 'var(--primary-color)';
  
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}
