// ================================
// MÓDULO DE PACIENTES
// ================================

let currentPsicologo = null;
let allPacientes = [];
let editingPaciente = null;

document.addEventListener('DOMContentLoaded', async () => {
  // Verificar autenticação
  await checkAuth();
  
  // Carregar pacientes
  await loadPacientes();
  
  // Setup event listeners
  setupEventListeners();
});

// Verificar autenticação
async function checkAuth() {
  try {
    const { data: { session } } = await window.supabaseClient.auth.getSession();
    
    if (!session) {
      window.location.href = '../index.html';
      return;
    }
    
    // Buscar dados do psicólogo
    currentPsicologo = storage.get('currentPsicologo');
    
    if (!currentPsicologo) {
      const { data: psicologo } = await window.supabaseClient
        .from('psicologos')
        .select('*')
        .eq('user_id', session.user.id)
        .single();
      
      currentPsicologo = psicologo;
      storage.set('currentPsicologo', psicologo);
    }
    
    // Atualizar UI
    document.getElementById('userName').textContent = currentPsicologo.nome.split(' ')[0];
    document.getElementById('userAvatar').textContent = getInitials(currentPsicologo.nome);
    
  } catch (error) {
    console.error('Erro na autenticação:', error);
    window.location.href = '../index.html';
  }
}

// Carregar pacientes
async function loadPacientes() {
  try {
    const { data: pacientes, error } = await window.supabaseClient
      .from('pacientes')
      .select('*')
      .eq('psicologo_id', currentPsicologo.id)
      .order('nome_completo', { ascending: true });
    
    if (error) throw error;
    
    allPacientes = pacientes || [];
    renderPacientes(allPacientes);
    
  } catch (error) {
    console.error('Erro ao carregar pacientes:', error);
    showToast('Erro ao carregar pacientes', 'error');
  }
}

// Renderizar tabela de pacientes
function renderPacientes(pacientes) {
  const tbody = document.getElementById('pacientesTableBody');
  
  if (!pacientes || pacientes.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5">
          <div class="empty-state">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
            </svg>
            <h3>Nenhum paciente cadastrado</h3>
            <p>Clique em "Novo Paciente" para começar</p>
          </div>
        </td>
      </tr>
    `;
    return;
  }
  
  tbody.innerHTML = pacientes.map(paciente => {
    const idade = calculateAge(paciente.data_nascimento);
    const statusClass = paciente.status;
    
    return `
      <tr>
        <td>
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <div class="user-avatar" style="background: ${generateAvatarColor(paciente.nome_completo)}; width: 36px; height: 36px; font-size: 0.875rem;">
              ${getInitials(paciente.nome_completo)}
            </div>
            <div>
              <div style="font-weight: 500; color: var(--text-primary);">${paciente.nome_completo}</div>
              ${paciente.email ? `<div style="font-size: 0.813rem; color: var(--text-light);">${paciente.email}</div>` : ''}
            </div>
          </div>
        </td>
        <td>${idade} anos</td>
        <td>${formatPhone(paciente.telefone)}</td>
        <td>
          <span class="patient-status">
            <span class="status-dot ${statusClass}"></span>
            <span class="badge badge-${statusClass === 'ativo' ? 'success' : statusClass === 'inativo' ? 'gray' : 'info'}">
              ${paciente.status}
            </span>
          </span>
        </td>
        <td>
          <div class="table-actions">
            <button class="btn-icon-sm btn-primary" onclick="viewPaciente('${paciente.id}')" title="Ver detalhes">
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
              </svg>
            </button>
            <button class="btn-icon-sm btn-secondary" onclick="editPaciente('${paciente.id}')" title="Editar">
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
              </svg>
            </button>
            <button class="btn-icon-sm btn-danger" onclick="deletePaciente('${paciente.id}', '${paciente.nome_completo}')" title="Excluir">
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

// Setup event listeners
function setupEventListeners() {
  // Novo paciente
  document.getElementById('btnNovoPaciente').addEventListener('click', openNewPacienteModal);
  
  // Busca
  const searchInput = document.getElementById('searchInput');
  searchInput.addEventListener('input', debounce(handleSearch, 300));
  
  // Filtro de status
  document.getElementById('statusFilter').addEventListener('change', handleSearch);
  
  // Modal
  document.getElementById('closeModal').addEventListener('click', closeModal);
  document.getElementById('cancelBtn').addEventListener('click', closeModal);
  
  // Form submit
  document.getElementById('pacienteForm').addEventListener('submit', handleSubmit);
  
  // Data de nascimento - mostrar responsável se menor
  document.getElementById('data_nascimento').addEventListener('change', handleBirthDateChange);
  
  // Nome - atualizar avatar preview
  document.getElementById('nome_completo').addEventListener('input', updateAvatarPreview);
  
  // Aplicar máscaras
  applyMask(document.getElementById('cpf'), 'cpf');
  applyMask(document.getElementById('telefone'), 'phone');
  applyMask(document.getElementById('telefone_responsavel'), 'phone');
  applyMask(document.getElementById('telefone_emergencia'), 'phone');
  
  // Logout
  document.getElementById('logoutBtn').addEventListener('click', async () => {
    if (confirmAction('Deseja sair do sistema?')) {
      await window.supabaseClient.auth.signOut();
      window.location.href = '../index.html';
    }
  });
  
  // Menu mobile
  document.getElementById('mobileMenuToggle').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('active');
    document.getElementById('sidebarOverlay').classList.toggle('active');
  });
  
  document.getElementById('sidebarOverlay').addEventListener('click', () => {
    document.getElementById('sidebar').classList.remove('active');
    document.getElementById('sidebarOverlay').classList.remove('active');
  });
}

// Abrir modal novo paciente
function openNewPacienteModal() {
  editingPaciente = null;
  document.getElementById('modalTitle').textContent = 'Novo Paciente';
  document.getElementById('pacienteForm').reset();
  document.getElementById('paciente_id').value = '';
  document.getElementById('status').value = 'ativo';
  document.getElementById('responsavelSection').style.display = 'none';
  document.getElementById('patientAvatarPreview').textContent = '?';
  document.getElementById('pacienteModal').style.display = 'flex';
}

// Fechar modal
function closeModal() {
  document.getElementById('pacienteModal').style.display = 'none';
  document.getElementById('pacienteForm').reset();
  editingPaciente = null;
}

// Editar paciente
async function editPaciente(id) {
  try {
    const { data: paciente, error } = await window.supabaseClient
      .from('pacientes')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    editingPaciente = paciente;
    
    // Preencher formulário
    document.getElementById('modalTitle').textContent = 'Editar Paciente';
    document.getElementById('paciente_id').value = paciente.id;
    document.getElementById('nome_completo').value = paciente.nome_completo || '';
    document.getElementById('data_nascimento').value = paciente.data_nascimento || '';
    document.getElementById('cpf').value = formatCPF(paciente.cpf) || '';
    document.getElementById('telefone').value = formatPhone(paciente.telefone) || '';
    document.getElementById('email').value = paciente.email || '';
    document.getElementById('endereco').value = paciente.endereco || '';
    document.getElementById('cidade').value = paciente.cidade || '';
    document.getElementById('estado').value = paciente.estado || '';
    document.getElementById('responsavel_legal').value = paciente.responsavel_legal || '';
    document.getElementById('telefone_responsavel').value = formatPhone(paciente.telefone_responsavel) || '';
    document.getElementById('contato_emergencia').value = paciente.contato_emergencia || '';
    document.getElementById('telefone_emergencia').value = formatPhone(paciente.telefone_emergencia) || '';
    document.getElementById('status').value = paciente.status || 'ativo';
    document.getElementById('observacoes').value = paciente.observacoes || '';
    document.getElementById('consentimento_lgpd').checked = paciente.consentimento_lgpd || false;
    
    // Atualizar avatar preview
    updateAvatarPreview();
    
    // Verificar se é menor
    handleBirthDateChange();
    
    // Abrir modal
    document.getElementById('pacienteModal').style.display = 'flex';
    
  } catch (error) {
    console.error('Erro ao carregar paciente:', error);
    showToast('Erro ao carregar paciente', 'error');
  }
}

// Ver detalhes do paciente
function viewPaciente(id) {
  // Futuramente pode abrir uma página de detalhes
  editPaciente(id);
}

// Deletar paciente
async function deletePaciente(id, nome) {
  if (!confirmAction(`Tem certeza que deseja excluir o paciente "${nome}"?\n\nEsta ação não pode ser desfeita e todos os dados relacionados (sessões, prontuários, etc.) também serão excluídos.`)) {
    return;
  }
  
  try {
    const { error } = await window.supabaseClient
      .from('pacientes')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    showToast('Paciente excluído com sucesso', 'success');
    await loadPacientes();
    
  } catch (error) {
    console.error('Erro ao excluir paciente:', error);
    showToast('Erro ao excluir paciente', 'error');
  }
}

// Handle submit
async function handleSubmit(e) {
  e.preventDefault();
  
  const saveBtn = document.getElementById('saveBtn');
  showLoading(saveBtn, 'Salvando...');
  
  try {
    // Validar CPF se preenchido
    const cpf = document.getElementById('cpf').value;
    if (cpf && !validateCPF(cpf)) {
      showToast('CPF inválido', 'error');
      hideLoading(saveBtn, 'Salvar Paciente');
      return;
    }
    
    // Preparar dados
    const pacienteData = {
      psicologo_id: currentPsicologo.id,
      nome_completo: document.getElementById('nome_completo').value.trim(),
      data_nascimento: document.getElementById('data_nascimento').value,
      cpf: document.getElementById('cpf').value.replace(/\D/g, '') || null,
      telefone: document.getElementById('telefone').value.replace(/\D/g, ''),
      email: document.getElementById('email').value.trim() || null,
      endereco: document.getElementById('endereco').value.trim() || null,
      cidade: document.getElementById('cidade').value.trim() || null,
      estado: document.getElementById('estado').value || null,
      responsavel_legal: document.getElementById('responsavel_legal').value.trim() || null,
      telefone_responsavel: document.getElementById('telefone_responsavel').value.replace(/\D/g, '') || null,
      contato_emergencia: document.getElementById('contato_emergencia').value.trim() || null,
      telefone_emergencia: document.getElementById('telefone_emergencia').value.replace(/\D/g, '') || null,
      status: document.getElementById('status').value,
      observacoes: document.getElementById('observacoes').value.trim() || null,
      consentimento_lgpd: document.getElementById('consentimento_lgpd').checked,
      data_consentimento: document.getElementById('consentimento_lgpd').checked ? new Date().toISOString() : null
    };
    
    const pacienteId = document.getElementById('paciente_id').value;
    
    if (pacienteId) {
      // Atualizar
      const { error } = await window.supabaseClient
        .from('pacientes')
        .update(pacienteData)
        .eq('id', pacienteId);
      
      if (error) throw error;
      
      showToast('Paciente atualizado com sucesso', 'success');
    } else {
      // Criar
      const { error } = await window.supabaseClient
        .from('pacientes')
        .insert([pacienteData]);
      
      if (error) throw error;
      
      showToast('Paciente cadastrado com sucesso', 'success');
    }
    
    closeModal();
    await loadPacientes();
    
  } catch (error) {
    console.error('Erro ao salvar paciente:', error);
    showToast(error.message || 'Erro ao salvar paciente', 'error');
  } finally {
    hideLoading(saveBtn, 'Salvar Paciente');
  }
}

// Handle birth date change
function handleBirthDateChange() {
  const birthDate = document.getElementById('data_nascimento').value;
  const responsavelSection = document.getElementById('responsavelSection');
  
  if (birthDate && isMinor(birthDate)) {
    responsavelSection.style.display = 'block';
  } else {
    responsavelSection.style.display = 'none';
  }
}

// Update avatar preview
function updateAvatarPreview() {
  const nome = document.getElementById('nome_completo').value.trim();
  const avatar = document.getElementById('patientAvatarPreview');
  
  if (nome) {
    avatar.textContent = getInitials(nome);
    avatar.style.background = `linear-gradient(135deg, ${generateAvatarColor(nome)}, var(--accent))`;
  } else {
    avatar.textContent = '?';
    avatar.style.background = 'linear-gradient(135deg, var(--primary), var(--accent))';
  }
}

// Handle search
function handleSearch() {
  const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
  const statusFilter = document.getElementById('statusFilter').value;
  
  let filtered = allPacientes;
  
  // Filtrar por status
  if (statusFilter) {
    filtered = filtered.filter(p => p.status === statusFilter);
  }
  
  // Filtrar por busca
  if (searchTerm) {
    filtered = filtered.filter(p => {
      return (
        p.nome_completo.toLowerCase().includes(searchTerm) ||
        (p.cpf && p.cpf.includes(searchTerm.replace(/\D/g, ''))) ||
        (p.telefone && p.telefone.includes(searchTerm.replace(/\D/g, ''))) ||
        (p.email && p.email.toLowerCase().includes(searchTerm))
      );
    });
  }
  
  renderPacientes(filtered);
}
