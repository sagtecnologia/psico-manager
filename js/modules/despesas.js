// ================================
// MÓDULO: DESPESAS
// ================================

let currentPsicologo = null;
let despesas = [];
let editingDespesaId = null;
let pendingDespesaData = null;

// Inicialização
document.addEventListener('DOMContentLoaded', async () => {
  await checkAuth();
  await loadDespesas();
  initializeEventListeners();
});

// Verificar autenticação
async function checkAuth() {
  const { data: { user } } = await window.supabaseClient.auth.getUser();
  
  if (!user) {
    window.location.href = '../index.html';
    return;
  }

  const { data: psicologo } = await window.supabaseClient
    .from('psicologos')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (!psicologo) {
    alert('Psicólogo não encontrado');
    window.location.href = '../index.html';
    return;
  }

  currentPsicologo = psicologo;
}

// Event Listeners
function initializeEventListeners() {
  // Botões principais
  document.getElementById('btnNovaDespesa').addEventListener('click', () => openModal());
  document.getElementById('closeModal').addEventListener('click', closeModal);
  document.getElementById('btnCancelar').addEventListener('click', closeModal);
  
  // Formulário
  document.getElementById('formDespesa').addEventListener('submit', handleSubmit);
  
  // Filtros
  document.getElementById('btnAplicarFiltros').addEventListener('click', applyFilters);
  document.getElementById('btnLimparFiltros').addEventListener('click', clearFilters);
  
  // Modal Status
  document.getElementById('btnMarcarPago').addEventListener('click', () => saveDespesaWithStatus('pago'));
  document.getElementById('btnMarcarPendente').addEventListener('click', () => saveDespesaWithStatus('pendente'));
  
  // Logout
  document.getElementById('logoutButton').addEventListener('click', async (e) => {
    e.preventDefault();
    await window.supabaseClient.auth.signOut();
    window.location.href = '../index.html';
  });

  // Fechar modal ao clicar fora
  document.getElementById('modalDespesa').addEventListener('click', (e) => {
    if (e.target.id === 'modalDespesa') closeModal();
  });
  
  document.getElementById('modalStatus').addEventListener('click', (e) => {
    if (e.target.id === 'modalStatus') closeModalStatus();
  });

  // Sidebar toggle
  const sidebarToggle = document.getElementById('sidebarToggle');
  const sidebar = document.getElementById('sidebar');
  
  if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener('click', () => {
      sidebar.classList.toggle('collapsed');
    });
  }
}

// Carregar despesas
async function loadDespesas() {
  try {
    const container = document.getElementById('despesasContainer');
    container.innerHTML = '<div class="loading">Carregando despesas...</div>';

    const { data, error } = await window.supabaseClient
      .from('pagamentos')
      .select('*')
      .eq('psicologo_id', currentPsicologo.id)
      .eq('tipo_transacao', 'despesa')
      .order('data', { ascending: false });

    if (error) throw error;

    despesas = data || [];
    renderDespesas(despesas);
  } catch (error) {
    console.error('Erro ao carregar despesas:', error);
    showToast('Erro ao carregar despesas', 'error');
  }
}

// Renderizar despesas
function renderDespesas(data) {
  const container = document.getElementById('despesasContainer');

  if (!data || data.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/>
          <path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/>
          <path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/>
        </svg>
        <h3>Nenhuma despesa cadastrada</h3>
        <p>Comece cadastrando sua primeira despesa</p>
        <button class="btn btn-primary" onclick="document.getElementById('btnNovaDespesa').click()">
          Nova Despesa
        </button>
      </div>
    `;
    return;
  }

  container.innerHTML = data.map(despesa => `
    <div class="despesa-card ${despesa.status}">
      <div class="despesa-header">
        <div class="despesa-info">
          <div class="despesa-categoria categoria-icon-${despesa.categoria}">
            ${getCategoriaLabel(despesa.categoria)}
          </div>
          <div class="despesa-descricao">${despesa.descricao}</div>
          <div class="despesa-valor">R$ ${parseFloat(despesa.valor).toFixed(2)}</div>
        </div>
        <div class="despesa-actions">
          <button onclick="editDespesa(${despesa.id})" title="Editar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
          <button onclick="deleteDespesa(${despesa.id})" title="Excluir">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
          </button>
        </div>
      </div>
      <div class="despesa-footer">
        <div class="despesa-meta">
          <div class="despesa-meta-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            ${formatDate(despesa.data)}
          </div>
          <div class="despesa-meta-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
              <line x1="1" y1="10" x2="23" y2="10"/>
            </svg>
            ${getFormaPagamentoLabel(despesa.forma_pagamento)}
          </div>
        </div>
        <div class="despesa-status ${despesa.status}">
          ${despesa.status === 'pago' ? `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            Pago
          ` : `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            Pendente
          `}
        </div>
      </div>
    </div>
  `).join('');
}

// Abrir modal
function openModal(despesa = null) {
  editingDespesaId = despesa ? despesa.id : null;
  const modal = document.getElementById('modalDespesa');
  const titulo = document.getElementById('modalTitulo');
  const form = document.getElementById('formDespesa');

  titulo.textContent = despesa ? 'Editar Despesa' : 'Nova Despesa';
  form.reset();

  if (despesa) {
    document.getElementById('categoria').value = despesa.categoria;
    document.getElementById('valor').value = despesa.valor;
    document.getElementById('data').value = despesa.data;
    document.getElementById('formaPagamento').value = despesa.forma_pagamento;
    document.getElementById('descricao').value = despesa.descricao;
  } else {
    // Preencher data atual
    document.getElementById('data').value = new Date().toISOString().split('T')[0];
  }

  modal.style.display = 'flex';
}

// Fechar modal
function closeModal() {
  document.getElementById('modalDespesa').style.display = 'none';
  document.getElementById('formDespesa').reset();
  editingDespesaId = null;
}

// Fechar modal de status
function closeModalStatus() {
  document.getElementById('modalStatus').style.display = 'none';
  pendingDespesaData = null;
}

// Handle submit
async function handleSubmit(e) {
  e.preventDefault();

  const despesaData = {
    categoria: document.getElementById('categoria').value,
    valor: parseFloat(document.getElementById('valor').value),
    data: document.getElementById('data').value,
    forma_pagamento: document.getElementById('formaPagamento').value,
    descricao: document.getElementById('descricao').value,
    tipo_transacao: 'despesa',
    psicologo_id: currentPsicologo.id
  };

  // Se estiver editando, salva direto
  if (editingDespesaId) {
    await saveDespesa(despesaData);
  } else {
    // Se for nova, pergunta o status
    pendingDespesaData = despesaData;
    closeModal();
    document.getElementById('modalStatus').style.display = 'flex';
  }
}

// Salvar despesa com status escolhido
async function saveDespesaWithStatus(status) {
  if (!pendingDespesaData) return;

  pendingDespesaData.status = status;
  await saveDespesa(pendingDespesaData);
  closeModalStatus();
}

// Salvar despesa
async function saveDespesa(despesaData) {
  try {
    showLoading(document.getElementById('btnSalvar'));

    if (editingDespesaId) {
      // Atualizar
      const { error } = await window.supabaseClient
        .from('pagamentos')
        .update(despesaData)
        .eq('id', editingDespesaId);

      if (error) throw error;
      showToast('Despesa atualizada com sucesso!', 'success');
    } else {
      // Criar
      const { error } = await window.supabaseClient
        .from('pagamentos')
        .insert([despesaData]);

      if (error) throw error;
      showToast('Despesa cadastrada com sucesso!', 'success');
    }

    await loadDespesas();
    closeModal();
  } catch (error) {
    console.error('Erro ao salvar despesa:', error);
    showToast('Erro ao salvar despesa', 'error');
  } finally {
    hideLoading(document.getElementById('btnSalvar'));
  }
}

// Editar despesa
window.editDespesa = async function(id) {
  const despesa = despesas.find(d => d.id === id);
  if (despesa) {
    openModal(despesa);
  }
};

// Deletar despesa
window.deleteDespesa = async function(id) {
  if (!confirm('Tem certeza que deseja excluir esta despesa?')) return;

  try {
    const { error } = await window.supabaseClient
      .from('pagamentos')
      .delete()
      .eq('id', id);

    if (error) throw error;

    showToast('Despesa excluída com sucesso!', 'success');
    await loadDespesas();
  } catch (error) {
    console.error('Erro ao excluir despesa:', error);
    showToast('Erro ao excluir despesa', 'error');
  }
};

// Aplicar filtros
function applyFilters() {
  const categoria = document.getElementById('filtroCategoria').value;
  const status = document.getElementById('filtroStatus').value;
  const dataInicio = document.getElementById('filtroDataInicio').value;
  const dataFim = document.getElementById('filtroDataFim').value;

  let filtered = [...despesas];

  if (categoria) {
    filtered = filtered.filter(d => d.categoria === categoria);
  }

  if (status) {
    filtered = filtered.filter(d => d.status === status);
  }

  if (dataInicio) {
    filtered = filtered.filter(d => d.data >= dataInicio);
  }

  if (dataFim) {
    filtered = filtered.filter(d => d.data <= dataFim);
  }

  renderDespesas(filtered);
}

// Limpar filtros
function clearFilters() {
  document.getElementById('filtroCategoria').value = '';
  document.getElementById('filtroStatus').value = '';
  document.getElementById('filtroDataInicio').value = '';
  document.getElementById('filtroDataFim').value = '';
  renderDespesas(despesas);
}

// Helpers
function getCategoriaLabel(categoria) {
  const labels = {
    aluguel: 'Aluguel',
    material: 'Material',
    equipamento: 'Equipamento',
    marketing: 'Marketing',
    software: 'Software',
    transporte: 'Transporte',
    alimentacao: 'Alimentação',
    outros: 'Outros'
  };
  return labels[categoria] || categoria;
}

function getFormaPagamentoLabel(forma) {
  const labels = {
    dinheiro: 'Dinheiro',
    pix: 'PIX',
    debito: 'Débito',
    credito: 'Crédito',
    boleto: 'Boleto'
  };
  return labels[forma] || forma;
}

function formatDate(dateString) {
  const date = new Date(dateString + 'T00:00:00');
  return date.toLocaleDateString('pt-BR');
}

function showLoading(button) {
  button.classList.add('loading');
  button.disabled = true;
}

function hideLoading(button) {
  button.classList.remove('loading');
  button.disabled = false;
}

function showToast(message, type = 'info') {
  // Implementação simples com alert
  // Pode ser substituída por uma biblioteca de toast
  if (type === 'error') {
    alert('❌ ' + message);
  } else if (type === 'success') {
    alert('✓ ' + message);
  } else {
    alert(message);
  }
}
