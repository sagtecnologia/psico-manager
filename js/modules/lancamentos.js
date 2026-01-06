// ================================
// MÓDULO: LANÇAMENTOS MANUAIS
// ================================

let currentPsicologo = null;
let lancamentos = [];
let editingLancamentoId = null;
let pendingLancamentoData = null;

// Inicialização
document.addEventListener('DOMContentLoaded', async () => {
  await checkAuth();
  await loadLancamentos();
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
  document.getElementById('btnNovoLancamento').addEventListener('click', () => {
    clearPendingData();
    openModal();
  });
  document.getElementById('closeModal').addEventListener('click', () => {
    closeModal();
    clearPendingData();
  });
  document.getElementById('btnCancelar').addEventListener('click', () => {
    closeModal();
    clearPendingData();
  });
  
  // Formulário
  document.getElementById('formLancamento').addEventListener('submit', handleSubmit);
  
  // Filtros
  document.getElementById('btnAplicarFiltros').addEventListener('click', applyFilters);
  document.getElementById('btnLimparFiltros').addEventListener('click', clearFilters);
  
  // Modal Status
  document.getElementById('btnMarcarPago').addEventListener('click', () => saveLancamentoWithStatus('pago'));
  document.getElementById('btnMarcarPendente').addEventListener('click', () => saveLancamentoWithStatus('pendente'));
  
  // Logout
  document.getElementById('logoutButton').addEventListener('click', async (e) => {
    e.preventDefault();
    await window.supabaseClient.auth.signOut();
    window.location.href = '../index.html';
  });

  // Fechar modal ao clicar fora
  document.getElementById('modalLancamento').addEventListener('click', (e) => {
    if (e.target.id === 'modalLancamento') closeModal();
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

// Carregar lançamentos
async function loadLancamentos() {
  try {
    const container = document.getElementById('lancamentosContainer');
    container.innerHTML = '<div class="loading">Carregando lançamentos...</div>';

    const { data, error } = await window.supabaseClient
      .from('pagamentos')
      .select('*')
      .eq('psicologo_id', currentPsicologo.id)
      .is('sessao_id', null) // Apenas lançamentos manuais (sem sessão)
      .order('data_pagamento', { ascending: false });

    if (error) throw error;

    lancamentos = data || [];
    renderLancamentos(lancamentos);
  } catch (error) {
    console.error('Erro ao carregar lançamentos:', error);
    document.getElementById('lancamentosContainer').innerHTML = `
      <div class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: #ef4444;">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <h3>❌ Erro ao carregar lançamentos</h3>
        <p>Execute o script database/add-despesas.sql no Supabase primeiro</p>
        <p style="color: #6b7280; font-size: 0.875rem;">Erro: ${error.message}</p>
      </div>
    `;
  }
}

// Renderizar lançamentos
function renderLancamentos(data) {
  const container = document.getElementById('lancamentosContainer');

  if (!data || data.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/>
          <path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/>
          <path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/>
        </svg>
        <h3>Nenhum lançamento cadastrado</h3>
        <p>Comece cadastrando seu primeiro lançamento manual</p>
        <button class="btn btn-primary" onclick="document.getElementById('btnNovoLancamento').click()">
          Novo Lançamento
        </button>
      </div>
    `;
    return;
  }

  container.innerHTML = data.map(lancamento => {
    const isReceita = lancamento.tipo_transacao === 'receita';
    const tipoLabel = isReceita ? 'A Receber' : 'A Pagar';
    const tipoColor = isReceita ? '#10b981' : '#ef4444';
    
    return `
    <div class="lancamento-card ${lancamento.status}" style="border-left-color: ${tipoColor}">
      <div class="lancamento-header">
        <div class="lancamento-info">
          <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
            <span style="font-size: 0.875rem; font-weight: 600; color: ${tipoColor};">
              ${tipoLabel}
            </span>
            <div class="lancamento-categoria categoria-icon-${lancamento.categoria}">
              ${getCategoriaLabel(lancamento.categoria)}
            </div>
          </div>
          <div class="lancamento-descricao">${lancamento.descricao || 'Sem descrição'}</div>
          <div class="lancamento-valor" style="color: ${tipoColor};">
            ${isReceita ? '+' : '-'} R$ ${parseFloat(lancamento.valor).toFixed(2)}
          </div>
        </div>
        <div class="lancamento-actions">
          <button onclick="editLancamento(${lancamento.id})" title="Editar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
          <button onclick="deleteLancamento(${lancamento.id})" title="Excluir">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
          </button>
        </div>
      </div>
      <div class="lancamento-footer">
        <div class="lancamento-meta">
          <div class="lancamento-meta-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            ${formatDate(lancamento.data_pagamento)}
          </div>
          <div class="lancamento-meta-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
              <line x1="1" y1="10" x2="23" y2="10"/>
            </svg>
            ${getFormaPagamentoLabel(lancamento.forma_pagamento)}
          </div>
        </div>
        <div class="lancamento-status ${lancamento.status}">
          ${lancamento.status === 'pago' ? `
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
  `;
  }).join('');
}

// Abrir modal
function openModal(lancamento = null) {
  editingLancamentoId = lancamento ? lancamento.id : null;
  const modal = document.getElementById('modalLancamento');
  const titulo = document.getElementById('modalTitulo');
  const form = document.getElementById('formLancamento');
  
  form.reset();
  
  if (lancamento) {
    titulo.textContent = 'Editar Lançamento';
    document.getElementById('tipoTransacao').value = lancamento.tipo_transacao || '';
    document.getElementById('categoria').value = lancamento.categoria || '';
    document.getElementById('valor').value = lancamento.valor || '';
    document.getElementById('data').value = lancamento.data_pagamento || '';
    document.getElementById('formaPagamento').value = lancamento.forma_pagamento || '';
    document.getElementById('descricao').value = lancamento.descricao || '';
  } else {
    titulo.textContent = 'Novo Lançamento';
    // Data padrão: hoje
    document.getElementById('data').value = new Date().toISOString().split('T')[0];
  }
  
  modal.style.display = 'flex';
}

// Fechar modal
function closeModal() {
  document.getElementById('modalLancamento').style.display = 'none';
  editingLancamentoId = null;
  // Não limpar pendingLancamentoData aqui - será limpo após salvar
}

// Limpar dados pendentes
function clearPendingData() {
  pendingLancamentoData = null;
  editingLancamentoId = null;
}

// Fechar modal status
function closeModalStatus() {
  document.getElementById('modalStatus').style.display = 'none';
  clearPendingData();
}

// Handle submit
async function handleSubmit(e) {
  e.preventDefault();
  
  const tipoTransacao = document.getElementById('tipoTransacao').value;
  const categoria = document.getElementById('categoria').value;
  const valor = parseFloat(document.getElementById('valor').value);
  const data = document.getElementById('data').value;
  const formaPagamento = document.getElementById('formaPagamento').value;
  const descricao = document.getElementById('descricao').value;

  // Armazenar dados temporariamente
  pendingLancamentoData = {
    tipo_transacao: tipoTransacao,
    categoria,
    valor,
    data_pagamento: data,
    forma_pagamento: formaPagamento,
    descricao,
    psicologo_id: currentPsicologo.id,
    sessao_id: null // Lançamento manual não tem sessão
  };

  // Fechar modal do formulário
  closeModal();
  
  // Se está editando, salva direto. Se é novo, pergunta o status
  if (editingLancamentoId) {
    await saveLancamento(editingLancamentoId);
  } else {
    // Abrir modal de status
    document.getElementById('modalStatus').style.display = 'flex';
  }
}

// Salvar lançamento
async function saveLancamento(id = null) {
  try {
    const btnSalvar = document.getElementById('btnSalvar');
    btnSalvar.classList.add('loading');

    if (id) {
      // Atualizar
      const { error } = await window.supabaseClient
        .from('pagamentos')
        .update(pendingLancamentoData)
        .eq('id', id);

      if (error) throw error;
      showToast('Lançamento atualizado com sucesso', 'success');
      clearPendingData();
    }

    btnSalvar.classList.remove('loading');
    await loadLancamentos();
  } catch (error) {
    console.error('Erro ao salvar lançamento:', error);
    showToast('Erro ao salvar lançamento: ' + error.message, 'error');
    const btnSalvar = document.getElementById('btnSalvar');
    btnSalvar.classList.remove('loading');
  }
}

// Salvar lançamento com status
async function saveLancamentoWithStatus(status) {
  try {
    pendingLancamentoData.status = status;

    const { error } = await window.supabaseClient
      .from('pagamentos')
      .insert([pendingLancamentoData]);

    if (error) throw error;

    showToast('Lançamento cadastrado com sucesso', 'success');
    closeModalStatus();
    clearPendingData();
    await loadLancamentos();
  } catch (error) {
    console.error('Erro ao salvar lançamento:', error);
    showToast('Erro ao salvar lançamento: ' + error.message, 'error');
  }
}

// Editar lançamento
async function editLancamento(id) {
  const lancamento = lancamentos.find(d => d.id === id);
  if (lancamento) {
    openModal(lancamento);
  }
}

// Deletar lançamento
async function deleteLancamento(id) {
  if (!confirm('Tem certeza que deseja excluir este lançamento?')) return;

  try {
    const { error } = await window.supabaseClient
      .from('pagamentos')
      .delete()
      .eq('id', id);

    if (error) throw error;

    showToast('Lançamento excluído com sucesso', 'success');
    await loadLancamentos();
  } catch (error) {
    console.error('Erro ao excluir lançamento:', error);
    showToast('Erro ao excluir lançamento', 'error');
  }
}

// Aplicar filtros
function applyFilters() {
  const tipo = document.getElementById('filtroTipo').value;
  const categoria = document.getElementById('filtroCategoria').value;
  const status = document.getElementById('filtroStatus').value;
  const dataInicio = document.getElementById('filtroDataInicio').value;
  const dataFim = document.getElementById('filtroDataFim').value;

  let filtered = [...lancamentos];

  if (tipo) {
    filtered = filtered.filter(l => l.tipo_transacao === tipo);
  }

  if (categoria) {
    filtered = filtered.filter(l => l.categoria === categoria);
  }

  if (status) {
    filtered = filtered.filter(l => l.status === status);
  }

  if (dataInicio) {
    filtered = filtered.filter(l => l.data_pagamento >= dataInicio);
  }

  if (dataFim) {
    filtered = filtered.filter(l => l.data_pagamento <= dataFim);
  }

  renderLancamentos(filtered);
}

// Limpar filtros
function clearFilters() {
  document.getElementById('filtroTipo').value = '';
  document.getElementById('filtroCategoria').value = '';
  document.getElementById('filtroStatus').value = '';
  document.getElementById('filtroDataInicio').value = '';
  document.getElementById('filtroDataFim').value = '';
  renderLancamentos(lancamentos);
}

// Helper: Formatar data
function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString + 'T00:00:00');
  return date.toLocaleDateString('pt-BR');
}

// Helper: Label de categoria
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

// Helper: Label forma de pagamento
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

// Show toast (implementação simples)
function showToast(message, type = 'info') {
  alert(message);
}
