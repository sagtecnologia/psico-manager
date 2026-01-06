// MÓDULO FINANCEIRO
let currentUser, currentPsicologo, pagamentos = [], allPagamentos = [], sessoes = [];
let editingPagamentoId = null;

document.addEventListener('DOMContentLoaded', async () => {
  await checkAuthentication();
  await loadSessoes();
  await loadPagamentos();
  setupEventListeners();
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

async function loadSessoes() {
  const { data } = await window.supabaseClient.from('sessoes').select('*, paciente:pacientes(nome_completo)').eq('psicologo_id', currentPsicologo.id).eq('status', 'realizada').order('data_hora', { ascending: false });
  sessoes = data || [];
  const select = document.getElementById('pagamentoSessao');
  select.innerHTML = '<option value="">Selecione uma sessão</option>';
  sessoes.forEach(s => {
    const data = new Date(s.data_hora);
    select.innerHTML += `<option value="${s.id}">${s.paciente.nome_completo} - ${formatDate(s.data_hora)} ${data.toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'})}</option>`;
  });
}

async function loadPagamentos() {
  const { data } = await window.supabaseClient.from('pagamentos').select('*, sessao:sessoes(data_hora, paciente:pacientes(nome_completo))').eq('psicologo_id', currentPsicologo.id).order('data_pagamento', { ascending: false });
  pagamentos = data || [];
  allPagamentos = data || []; // Armazenar dados originais
  renderPagamentos();
  calcularResumo();
}

function renderPagamentos() {
  const tbody = document.getElementById('pagamentosBody');
  if (pagamentos.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="text-center">Nenhum pagamento registrado</td></tr>';
    return;
  }
  tbody.innerHTML = pagamentos.map(p => {
    // Verifica se é lançamento manual (sem sessão) ou pagamento de sessão
    const isLancamentoManual = !p.sessao_id || !p.sessao;
    const pacienteNome = isLancamentoManual 
      ? (p.tipo_transacao === 'receita' ? 'Receita Manual' : 'Despesa Manual') 
      : (p.sessao?.paciente?.nome_completo || 'N/A');
    const dataServico = isLancamentoManual 
      ? '-' 
      : formatDate(p.sessao?.data_hora);
    
    return `
    <tr>
      <td>${formatDate(p.data_pagamento)}</td>
      <td>${pacienteNome}</td>
      <td>${dataServico}</td>
      <td>${p.forma_pagamento.replace('_', ' ')}</td>
      <td style="color: ${p.tipo_transacao === 'despesa' ? '#ef4444' : '#10b981'};">
        ${p.tipo_transacao === 'despesa' ? '-' : '+'} R$ ${(p.valor || 0).toFixed(2)}
      </td>
      <td><span class="status-badge ${p.status}">${p.status}</span></td>
      <td><button class="btn btn-sm btn-secondary" onclick="editPagamento('${p.id}')">Editar</button></td>
    </tr>
  `;
  }).join('');
}

function calcularResumo() {
  const hoje = new Date();
  const mesAtual = pagamentos.filter(p => {
    const data = new Date(p.data_pagamento);
    return data.getMonth() === hoje.getMonth() && data.getFullYear() === hoje.getFullYear();
  });
  
  // Separar receitas e despesas pagas (somando manuais e de atendimentos)
  const receitas = mesAtual.filter(p => p.tipo_transacao === 'receita' && p.status === 'pago');
  const despesas = mesAtual.filter(p => p.tipo_transacao === 'despesa' && p.status === 'pago');
  
  const totalReceitas = receitas.reduce((sum, p) => sum + (p.valor || 0), 0);
  const totalDespesas = despesas.reduce((sum, p) => sum + (p.valor || 0), 0);
  const lucro = totalReceitas - totalDespesas;
  
  document.getElementById('totalReceitas').textContent = `R$ ${totalReceitas.toFixed(2)}`;
  document.getElementById('totalDespesas').textContent = `R$ ${totalDespesas.toFixed(2)}`;
  document.getElementById('totalLucro').textContent = `R$ ${lucro.toFixed(2)}`;
  document.getElementById('totalLucro').style.color = lucro >= 0 ? '#10b981' : '#ef4444';
}

function setupEventListeners() {
  document.getElementById('btnNovoPagamento').addEventListener('click', () => {
    editingPagamentoId = null;
    document.getElementById('modalPagamento').querySelector('h2').textContent = 'Novo Pagamento';
    document.getElementById('formPagamento').reset();
    document.getElementById('pagamentoData').valueAsDate = new Date();
    document.getElementById('modalPagamento').style.display = 'flex';
  });
  document.getElementById('closePagamentoModal').addEventListener('click', () => {
    document.getElementById('modalPagamento').style.display = 'none';
  });
  document.getElementById('btnCancelarPagamento').addEventListener('click', () => {
    document.getElementById('modalPagamento').style.display = 'none';
  });
  document.getElementById('formPagamento').addEventListener('submit', handleSavePagamento);
  
  // Filtros
  document.getElementById('filterPeriodo').addEventListener('change', handlePeriodoChange);
  document.getElementById('filterStatus').addEventListener('change', filterPagamentos);
  document.getElementById('filterPaciente').addEventListener('change', filterPagamentos);
  document.getElementById('filterOrdenacao').addEventListener('change', filterPagamentos);
  document.getElementById('btnLimparFiltros').addEventListener('click', limparFiltros);
  document.getElementById('btnAplicarDatas')?.addEventListener('click', filterPagamentos);
  
  document.getElementById('logoutBtn').addEventListener('click', async () => {
    await window.supabaseClient.auth.signOut();
    window.location.href = '../index.html';
  });
  document.getElementById('btnExportar').addEventListener('click', exportarCSV);
}

function handlePeriodoChange() {
  const periodo = document.getElementById('filterPeriodo').value;
  const customDateRange = document.getElementById('customDateRange');
  
  if (periodo === 'custom') {
    customDateRange.style.display = 'flex';
  } else {
    customDateRange.style.display = 'none';
    filterPagamentos();
  }
}

function limparFiltros() {
  document.getElementById('filterPeriodo').value = 'mes_atual';
  document.getElementById('filterStatus').value = '';
  document.getElementById('filterPaciente').value = '';
  document.getElementById('filterOrdenacao').value = 'recente';
  document.getElementById('customDateRange').style.display = 'none';
  filterPagamentos();
}

function filterPagamentos() {
  const periodoValue = document.getElementById('filterPeriodo').value;
  const status = document.getElementById('filterStatus').value;
  const pacienteId = document.getElementById('filterPaciente').value;
  const ordenacao = document.getElementById('filterOrdenacao').value;
  
  let filtered = [...allPagamentos];
  
  // Filtro de período
  const hoje = new Date();
  let dataInicio, dataFim;
  
  switch(periodoValue) {
    case 'mes_atual':
      dataInicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
      dataFim = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
      break;
    case 'mes_anterior':
      dataInicio = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1);
      dataFim = new Date(hoje.getFullYear(), hoje.getMonth(), 0);
      break;
    case '30':
      dataInicio = new Date();
      dataInicio.setDate(dataInicio.getDate() - 30);
      dataFim = hoje;
      break;
    case '90':
      dataInicio = new Date();
      dataInicio.setDate(dataInicio.getDate() - 90);
      dataFim = hoje;
      break;
    case 'ano':
      dataInicio = new Date(hoje.getFullYear(), 0, 1);
      dataFim = new Date(hoje.getFullYear(), 11, 31);
      break;
    case 'custom':
      const dataInicioInput = document.getElementById('dataInicio').value;
      const dataFimInput = document.getElementById('dataFim').value;
      if (dataInicioInput) dataInicio = new Date(dataInicioInput);
      if (dataFimInput) dataFim = new Date(dataFimInput);
      break;
  }
  
  if (dataInicio) {
    filtered = filtered.filter(p => new Date(p.data_pagamento) >= dataInicio);
  }
  if (dataFim) {
    filtered = filtered.filter(p => new Date(p.data_pagamento) <= dataFim);
  }
  
  // Filtro de status
  if (status) {
    filtered = filtered.filter(p => p.status === status);
  }
  
  // Filtro de paciente
  if (pacienteId) {
    filtered = filtered.filter(p => p.sessao?.paciente_id === pacienteId);
  }
  
  // Ordenação
  switch(ordenacao) {
    case 'recente':
      filtered.sort((a, b) => new Date(b.data_pagamento) - new Date(a.data_pagamento));
      break;
    case 'antigo':
      filtered.sort((a, b) => new Date(a.data_pagamento) - new Date(b.data_pagamento));
      break;
    case 'valor_maior':
      filtered.sort((a, b) => b.valor - a.valor);
      break;
    case 'valor_menor':
      filtered.sort((a, b) => a.valor - b.valor);
      break;
  }
  
  pagamentos = filtered;
  renderPagamentos();
  calcularResumo();
}

async function handleSavePagamento(e) {
  e.preventDefault();
  const btn = document.getElementById('btnSalvarPagamento');
  btn.disabled = true;
  try {
    const data = {
      psicologo_id: currentPsicologo.id,
      sessao_id: document.getElementById('pagamentoSessao').value,
      valor: parseFloat(document.getElementById('pagamentoValor').value),
      forma_pagamento: document.getElementById('pagamentoFormaPagamento').value,
      data_pagamento: document.getElementById('pagamentoData').value,
      status: document.getElementById('pagamentoStatus').value,
      observacoes: document.getElementById('pagamentoObservacoes').value || null
    };
    
    if (editingPagamentoId) {
      // Atualizar pagamento existente
      await window.supabaseClient
        .from('pagamentos')
        .update(data)
        .eq('id', editingPagamentoId);
      showToast('Pagamento atualizado com sucesso!', 'success');
    } else {
      // Criar novo pagamento
      await window.supabaseClient.from('pagamentos').insert([data]);
      showToast('Pagamento registrado com sucesso!', 'success');
    }
    
    document.getElementById('modalPagamento').style.display = 'none';
    await loadPagamentos();
  } catch (error) {
    console.error('Erro:', error);
    showToast('Erro ao salvar pagamento', 'error');
  } finally {
    btn.disabled = false;
  }
}

async function editPagamento(id) {
  editingPagamentoId = id;
  const pagamento = pagamentos.find(p => p.id === id);
  if (!pagamento) return;
  
  document.getElementById('modalPagamento').querySelector('h2').textContent = 'Editar Pagamento';
  document.getElementById('pagamentoSessao').value = pagamento.sessao_id;
  document.getElementById('pagamentoValor').value = pagamento.valor;
  document.getElementById('pagamentoFormaPagamento').value = pagamento.forma_pagamento;
  document.getElementById('pagamentoData').value = pagamento.data_pagamento;
  document.getElementById('pagamentoStatus').value = pagamento.status;
  document.getElementById('pagamentoObservacoes').value = pagamento.observacoes || '';
  
  document.getElementById('modalPagamento').style.display = 'flex';
}

// Tornar função disponível globalmente
window.editPagamento = editPagamento;

function exportarCSV() {
  const csv = ['Data,Paciente,Sessão,Forma Pagamento,Valor,Status'];
  pagamentos.forEach(p => {
    csv.push(`${p.data_pagamento},${p.sessao.paciente.nome_completo},${p.sessao.data_hora},${p.forma_pagamento},${p.valor},${p.status}`);
  });
  const blob = new Blob([csv.join('\n')], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `financeiro-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  showToast('CSV exportado com sucesso!', 'success');
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
  else if (type === 'warning') toast.style.background = 'var(--warning-color)';
  else toast.style.background = 'var(--primary-color)';
  
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}
