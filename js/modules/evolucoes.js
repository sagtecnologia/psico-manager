// ================================
// MÓDULO EVOLUÇÕES
// ================================

let currentUser = null;
let currentPsicologo = null;
let sessoes = [];
let evolucoes = [];
let allEvolucoes = []; // Armazenar dados originais
let editingEvolucaoId = null;

document.addEventListener('DOMContentLoaded', async () => {
  await checkAuthentication();
  await loadSessoes();
  await loadEvolucoes();
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

async function loadSessoes() {
  const { data } = await window.supabaseClient
    .from('sessoes')
    .select(`
      *,
      paciente:pacientes(nome_completo),
      prontuario:prontuarios(id)
    `)
    .eq('psicologo_id', currentPsicologo.id)
    .eq('status', 'realizada')
    .order('data_hora', { ascending: false });
  
  sessoes = data || [];
  
  const select = document.getElementById('evolucaoSessao');
  select.innerHTML = '<option value="">Selecione uma sessão</option>';
  sessoes.forEach(s => {
    const data = new Date(s.data_hora);
    select.innerHTML += `<option value="${s.id}" data-prontuario="${s.prontuario?.id || ''}">${s.paciente.nome_completo} - ${formatDate(s.data_hora)} ${data.toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'})}</option>`;
  });
  
  // Preencher filtro de pacientes
  const pacientes = [...new Set(sessoes.map(s => s.paciente.nome_completo))];
  const filterPaciente = document.getElementById('filterPaciente');
  pacientes.forEach(p => {
    filterPaciente.innerHTML += `<option value="${p}">${p}</option>`;
  });
}

async function loadEvolucoes() {
  const { data } = await window.supabaseClient
    .from('evolucoes')
    .select(`
      *,
      sessao:sessoes(
        data_hora,
        paciente:pacientes(nome_completo)
      ),
      prontuario:prontuarios(id)
    `)
    .order('created_at', { ascending: false });
  
  // Filtrar apenas evoluções do psicólogo atual
  const sessoesIds = sessoes.map(s => s.id);
  evolucoes = (data || []).filter(e => sessoesIds.includes(e.sessao_id));
  allEvolucoes = [...evolucoes]; // Armazenar dados originais
  
  renderEvolucoes();
}

function renderEvolucoes() {
  const timeline = document.getElementById('evolucoesTimeline');
  
  if (evolucoes.length === 0) {
    timeline.innerHTML = `
      <div class="empty-timeline">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="64" height="64">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
        </svg>
        <h3>Nenhuma evolução registrada</h3>
        <p>Clique em "Nova Evolução" para começar</p>
      </div>
    `;
    return;
  }
  
  timeline.innerHTML = evolucoes.map(e => `
    <div class="evolucao-item" onclick="editEvolucao('${e.id}')">
      <div class="evolucao-header">
        <div class="evolucao-info">
          <div class="evolucao-paciente">${e.sessao.paciente.nome_completo}</div>
          <div class="evolucao-data">
            📅 Sessão: ${formatDate(e.sessao.data_hora)}
            <span class="evolucao-badge">
              ✏️ Registrado em ${formatDate(e.created_at)}
            </span>
          </div>
        </div>
      </div>
      
      <div class="evolucao-content">
        ${e.conteudo ? e.conteudo.substring(0, 200) + (e.conteudo.length > 200 ? '...' : '') : 'Sem conteúdo'}
      </div>
      
      ${e.tecnicas_aplicadas ? `
        <div class="evolucao-section">
          <div class="evolucao-section-title">💡 Técnicas Aplicadas</div>
          <div class="evolucao-section-content">${e.tecnicas_aplicadas}</div>
        </div>
      ` : ''}
      
      ${e.progresso_observado ? `
        <div class="evolucao-section">
          <div class="evolucao-section-title">📈 Progresso</div>
          <div class="evolucao-section-content">${e.progresso_observado}</div>
        </div>
      ` : ''}
      
      <div class="evolucao-footer">
        <span>Última atualização: ${formatDate(e.updated_at)}</span>
        <div class="evolucao-actions">
          <button class="btn-icon" onclick="event.stopPropagation(); editEvolucao('${e.id}')" title="Editar">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

function setupEventListeners() {
  document.getElementById('btnNovaEvolucao').addEventListener('click', () => {
    editingEvolucaoId = null;
    document.getElementById('modalEvolucaoTitle').textContent = 'Nova Evolução';
    document.getElementById('formEvolucao').reset();
    document.getElementById('evolucaoData').valueAsDate = new Date();
    document.getElementById('modalEvolucao').style.display = 'flex';
  });
  
  document.getElementById('closeEvolucaoModal').addEventListener('click', () => {
    document.getElementById('modalEvolucao').style.display = 'none';
  });
  
  document.getElementById('btnCancelarEvolucao').addEventListener('click', () => {
    document.getElementById('modalEvolucao').style.display = 'none';
  });
  
  document.getElementById('formEvolucao').addEventListener('submit', handleSaveEvolucao);
  
  document.getElementById('searchPaciente').addEventListener('input', filterEvolucoes);
  document.getElementById('filterPaciente').addEventListener('change', filterEvolucoes);
  document.getElementById('filterPeriodo').addEventListener('change', handlePeriodoChange);
  document.getElementById('filterOrdenacao').addEventListener('change', filterEvolucoes);
  document.getElementById('btnLimparFiltros').addEventListener('click', limparFiltros);
  document.getElementById('btnAplicarDatas')?.addEventListener('click', filterEvolucoes);
  
  document.getElementById('logoutBtn').addEventListener('click', async () => {
    await window.supabaseClient.auth.signOut();
    window.location.href = '../index.html';
  });
}

function handlePeriodoChange() {
  const periodo = document.getElementById('filterPeriodo').value;
  const customDateRange = document.getElementById('customDateRange');
  
  if (periodo === 'custom') {
    customDateRange.style.display = 'flex';
  } else {
    customDateRange.style.display = 'none';
    filterEvolucoes();
  }
}

function limparFiltros() {
  document.getElementById('searchPaciente').value = '';
  document.getElementById('filterPaciente').value = '';
  document.getElementById('filterPeriodo').value = '30';
  document.getElementById('filterOrdenacao').value = 'recente';
  document.getElementById('customDateRange').style.display = 'none';
  filterEvolucoes();
}

function filterEvolucoes() {
  const search = document.getElementById('searchPaciente').value.toLowerCase();
  const pacienteFiltro = document.getElementById('filterPaciente').value;
  const periodoValue = document.getElementById('filterPeriodo').value;
  const ordenacao = document.getElementById('filterOrdenacao').value;
  
  let filtered = [...allEvolucoes];
  
  if (search) {
    filtered = filtered.filter(e => 
      e.sessao.paciente.nome_completo.toLowerCase().includes(search)
    );
  }
  
  if (pacienteFiltro) {
    filtered = filtered.filter(e => e.sessao.paciente_id === pacienteFiltro);
  }
  
  // Filtro de período
  if (periodoValue && periodoValue !== 'custom') {
    const dias = parseInt(periodoValue);
    const dataLimite = new Date();
    dataLimite.setDate(dataLimite.getDate() - dias);
    filtered = filtered.filter(e => new Date(e.data_evolucao) >= dataLimite);
  } else if (periodoValue === 'custom') {
    const dataInicio = document.getElementById('dataInicio').value;
    const dataFim = document.getElementById('dataFim').value;
    if (dataInicio) {
      filtered = filtered.filter(e => new Date(e.data_evolucao) >= new Date(dataInicio));
    }
    if (dataFim) {
      filtered = filtered.filter(e => new Date(e.data_evolucao) <= new Date(dataFim));
    }
  }
  
  // Ordenação
  if (ordenacao === 'recente') {
    filtered.sort((a, b) => new Date(b.data_evolucao) - new Date(a.data_evolucao));
  } else if (ordenacao === 'antigo') {
    filtered.sort((a, b) => new Date(a.data_evolucao) - new Date(b.data_evolucao));
  }
  
  evolucoes = filtered;
  renderEvolucoes();
}

async function handleSaveEvolucao(e) {
  e.preventDefault();
  
  const btn = document.getElementById('btnSalvarEvolucao');
  const btnText = btn.querySelector('.btn-text');
  const btnLoading = btn.querySelector('.btn-loading');
  
  btn.disabled = true;
  btnText.style.display = 'none';
  btnLoading.style.display = 'inline-flex';
  
  try {
    const sessaoSelect = document.getElementById('evolucaoSessao');
    const selectedOption = sessaoSelect.options[sessaoSelect.selectedIndex];
    const prontuarioId = selectedOption.getAttribute('data-prontuario');
    
    const data = {
      sessao_id: sessaoSelect.value,
      prontuario_id: prontuarioId || null,
      conteudo: document.getElementById('evolucaoConteudo').value,
      tecnicas_aplicadas: document.getElementById('evolucaoTecnicas').value || null,
      progresso_observado: document.getElementById('evolucaoProgresso').value || null,
      planejamento_proxima: document.getElementById('evolucaoProximaSessao').value || null,
      observacoes: document.getElementById('evolucaoObservacoes').value || null,
      data_evolucao: document.getElementById('evolucaoData').value
    };
    
    if (editingEvolucaoId) {
      await window.supabaseClient
        .from('evolucoes')
        .update(data)
        .eq('id', editingEvolucaoId);
      showToast('Evolução atualizada com sucesso!', 'success');
    } else {
      await window.supabaseClient
        .from('evolucoes')
        .insert([data]);
      showToast('Evolução registrada com sucesso!', 'success');
    }
    
    document.getElementById('modalEvolucao').style.display = 'none';
    await loadEvolucoes();
    
  } catch (error) {
    console.error('Erro ao salvar evolução:', error);
    showToast('Erro ao salvar evolução', 'error');
  } finally {
    btn.disabled = false;
    btnText.style.display = 'inline';
    btnLoading.style.display = 'none';
  }
}

async function editEvolucao(id) {
  editingEvolucaoId = id;
  const evolucao = evolucoes.find(e => e.id === id);
  if (!evolucao) return;
  
  document.getElementById('modalEvolucaoTitle').textContent = `Editar Evolução - ${evolucao.sessao.paciente.nome_completo}`;
  document.getElementById('evolucaoSessao').value = evolucao.sessao_id;
  document.getElementById('evolucaoSessao').disabled = true;
  document.getElementById('evolucaoData').value = evolucao.data_evolucao || new Date().toISOString().split('T')[0];
  document.getElementById('evolucaoConteudo').value = evolucao.conteudo || '';
  document.getElementById('evolucaoTecnicas').value = evolucao.tecnicas_aplicadas || '';
  document.getElementById('evolucaoProgresso').value = evolucao.progresso_observado || '';
  document.getElementById('evolucaoProximaSessao').value = evolucao.planejamento_proxima || '';
  document.getElementById('evolucaoObservacoes').value = evolucao.observacoes || '';
  
  document.getElementById('modalEvolucao').style.display = 'flex';
}
