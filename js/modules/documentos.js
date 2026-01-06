// ================================
// MÓDULO DOCUMENTOS
// ================================

let currentUser = null;
let currentPsicologo = null;
let pacientes = [];
let documentos = [];
let allDocumentos = []; // Armazenar dados originais

document.addEventListener('DOMContentLoaded', async () => {
  await checkAuthentication();
  await loadPacientes();
  await loadDocumentos();
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
    .eq('status', 'ativo')
    .order('nome_completo');
  
  pacientes = data || [];
  
  const select = document.getElementById('documentoPaciente');
  const filterSelect = document.getElementById('filterPaciente');
  
  select.innerHTML = '<option value="">Selecione um paciente</option>';
  pacientes.forEach(p => {
    select.innerHTML += `<option value="${p.id}">${p.nome_completo}</option>`;
    filterSelect.innerHTML += `<option value="${p.id}">${p.nome_completo}</option>`;
  });
}

async function loadDocumentos() {
  const { data } = await window.supabaseClient
    .from('documentos')
    .select(`
      *,
      paciente:pacientes(nome_completo)
    `)
    .eq('psicologo_id', currentPsicologo.id)
    .order('created_at', { ascending: false });
  
  documentos = data || [];
  allDocumentos = data || []; // Armazenar dados originais
  renderDocumentos();
}

function renderDocumentos() {
  const grid = document.getElementById('documentosGrid');
  
  if (documentos.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="64" height="64">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
        </svg>
        <h3>Nenhum documento cadastrado</h3>
        <p>Clique em "Novo Documento" para fazer upload</p>
      </div>
    `;
    return;
  }
  
  grid.innerHTML = documentos.map(d => {
    const extension = d.tipo_arquivo || 'other';
    const iconClass = extension.includes('pdf') ? 'pdf' : 
                     extension.includes('doc') ? 'doc' : 
                     extension.includes('jpg') || extension.includes('png') ? 'image' : 'other';
    const icon = iconClass === 'pdf' ? '📄' : 
                iconClass === 'doc' ? '📝' : 
                iconClass === 'image' ? '🖼️' : '📎';
    
    const tipoLabel = {
      'contrato': 'Contrato',
      'termo_consentimento': 'Termo de Consentimento',
      'relatorio': 'Relatório',
      'laudo': 'Laudo',
      'avaliacao': 'Avaliação',
      'outros': 'Outros'
    }[d.tipo] || 'Documento';
    
    return `
      <div class="documento-card">
        <div class="documento-icon ${iconClass}">${icon}</div>
        <div class="documento-info">
          <div class="documento-titulo">${d.titulo}</div>
          <div class="documento-tipo">${tipoLabel}</div>
          <div class="documento-paciente">👤 ${d.paciente.nome_completo}</div>
          <div class="documento-data">📅 ${formatDate(d.created_at)}</div>
        </div>
        <div class="documento-footer">
          <button class="btn btn-sm btn-primary" onclick="visualizarDocumento('${d.id}')">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
            </svg>
            Ver
          </button>
          <button class="btn btn-sm btn-danger" onclick="deleteDocumento('${d.id}')">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
            Excluir
          </button>
        </div>
      </div>
    `;
  }).join('');
}

function setupEventListeners() {
  document.getElementById('btnNovoDocumento').addEventListener('click', () => {
    document.getElementById('formDocumento').reset();
    document.getElementById('fileSelected').style.display = 'none';
    document.getElementById('modalDocumento').style.display = 'flex';
  });
  
  document.getElementById('closeDocumentoModal').addEventListener('click', () => {
    document.getElementById('modalDocumento').style.display = 'none';
  });
  
  document.getElementById('btnCancelarDocumento').addEventListener('click', () => {
    document.getElementById('modalDocumento').style.display = 'none';
  });
  
  const fileUploadArea = document.getElementById('fileUploadArea');
  const fileInput = document.getElementById('documentoArquivo');
  
  fileUploadArea.addEventListener('click', () => fileInput.click());
  
  fileInput.addEventListener('change', handleFileSelect);
  
  document.getElementById('btnRemoveFile').addEventListener('click', (e) => {
    e.stopPropagation();
    fileInput.value = '';
    document.getElementById('fileSelected').style.display = 'none';
  });
  
  document.getElementById('formDocumento').addEventListener('submit', handleSaveDocumento);
  
  document.getElementById('searchDocumento').addEventListener('input', filterDocumentos);
  document.getElementById('filterPaciente').addEventListener('change', filterDocumentos);
  document.getElementById('filterTipo').addEventListener('change', filterDocumentos);
  document.getElementById('filterPeriodo').addEventListener('change', filterDocumentos);
  document.getElementById('filterOrdenacao').addEventListener('change', filterDocumentos);
  document.getElementById('btnLimparFiltros').addEventListener('click', limparFiltros);
  
  document.getElementById('logoutBtn').addEventListener('click', async () => {
    await window.supabaseClient.auth.signOut();
    window.location.href = '../index.html';
  });
}

function limparFiltros() {
  document.getElementById('searchDocumento').value = '';
  document.getElementById('filterPaciente').value = '';
  document.getElementById('filterTipo').value = '';
  document.getElementById('filterPeriodo').value = '';
  document.getElementById('filterOrdenacao').value = 'recente';
  filterDocumentos();
}

function handleFileSelect(e) {
  const file = e.target.files[0];
  if (file) {
    if (file.size > 10 * 1024 * 1024) {
      showToast('Arquivo muito grande. Máximo: 10MB', 'error');
      e.target.value = '';
      return;
    }
    document.getElementById('fileName').textContent = file.name;
    document.getElementById('fileSelected').style.display = 'flex';
  }
}

function filterDocumentos() {
  const search = document.getElementById('searchDocumento').value.toLowerCase();
  const pacienteId = document.getElementById('filterPaciente').value;
  const tipo = document.getElementById('filterTipo').value;
  const periodo = document.getElementById('filterPeriodo').value;
  const ordenacao = document.getElementById('filterOrdenacao').value;
  
  let filtered = [...allDocumentos];
  
  if (search) {
    filtered = filtered.filter(d => 
      d.titulo.toLowerCase().includes(search) ||
      d.descricao?.toLowerCase().includes(search) ||
      d.paciente.nome_completo.toLowerCase().includes(search)
    );
  }
  
  if (pacienteId) {
    filtered = filtered.filter(d => d.paciente_id === pacienteId);
  }
  
  if (tipo) {
    filtered = filtered.filter(d => d.tipo === tipo);
  }
  
  // Filtro de período
  if (periodo) {
    const dias = parseInt(periodo);
    const dataLimite = new Date();
    dataLimite.setDate(dataLimite.getDate() - dias);
    filtered = filtered.filter(d => new Date(d.created_at) >= dataLimite);
  }
  
  // Ordenação
  switch(ordenacao) {
    case 'recente':
      filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      break;
    case 'antigo':
      filtered.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      break;
    case 'nome':
      filtered.sort((a, b) => a.titulo.localeCompare(b.titulo));
      break;
    case 'tipo':
      filtered.sort((a, b) => a.tipo.localeCompare(b.tipo));
      break;
  }
  
  documentos = filtered;
  renderDocumentos();
}

async function handleSaveDocumento(e) {
  e.preventDefault();
  
  const btn = document.getElementById('btnSalvarDocumento');
  const btnText = btn.querySelector('.btn-text');
  const btnLoading = btn.querySelector('.btn-loading');
  
  btn.disabled = true;
  btnText.style.display = 'none';
  btnLoading.style.display = 'inline-flex';
  
  try {
    const fileInput = document.getElementById('documentoArquivo');
    const file = fileInput.files[0];
    
    if (!file) {
      showToast('Por favor, selecione um arquivo', 'error');
      return;
    }
    
    // Simular URL do arquivo (em produção, fazer upload real para Supabase Storage)
    const fakeUrl = `${currentPsicologo.id}/${Date.now()}_${file.name}`;
    
    const data = {
      psicologo_id: currentPsicologo.id,
      paciente_id: document.getElementById('documentoPaciente').value,
      tipo: document.getElementById('documentoTipo').value,
      titulo: document.getElementById('documentoTitulo').value,
      descricao: document.getElementById('documentoDescricao').value || null,
      arquivo_url: fakeUrl,
      tipo_arquivo: file.type,
      tamanho: file.size
    };
    
    await window.supabaseClient
      .from('documentos')
      .insert([data]);
    
    showToast('Documento enviado com sucesso!', 'success');
    document.getElementById('modalDocumento').style.display = 'none';
    await loadDocumentos();
    
  } catch (error) {
    console.error('Erro ao salvar documento:', error);
    showToast('Erro ao enviar documento', 'error');
  } finally {
    btn.disabled = false;
    btnText.style.display = 'inline';
    btnLoading.style.display = 'none';
  }
}

function visualizarDocumento(id) {
  const doc = documentos.find(d => d.id === id);
  if (doc) {
    showToast(`Visualizar: ${doc.titulo}`, 'info');
    // Em produção, abrir o arquivo do Supabase Storage
  }
}

async function deleteDocumento(id) {
  if (!confirm('Tem certeza que deseja excluir este documento?')) return;
  
  try {
    await window.supabaseClient
      .from('documentos')
      .delete()
      .eq('id', id);
    
    showToast('Documento excluído com sucesso!', 'success');
    await loadDocumentos();
  } catch (error) {
    console.error('Erro ao excluir documento:', error);
    showToast('Erro ao excluir documento', 'error');
  }
}
