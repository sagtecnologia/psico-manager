// MÓDULO RELATÓRIOS
let currentUser, currentPsicologo;
let charts = {};

document.addEventListener('DOMContentLoaded', async () => {
  await checkAuthentication();
  await loadRelatorios();
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

async function loadRelatorios() {
  const periodo = getPeriodo();
  
  // Carregar pacientes
  const { data: pacientes } = await window.supabaseClient
    .from('pacientes')
    .select('*')
    .eq('psicologo_id', currentPsicologo.id);
  
  // Carregar sessões
  const { data: sessoes } = await window.supabaseClient
    .from('sessoes')
    .select('*, paciente:pacientes(nome_completo)')
    .eq('psicologo_id', currentPsicologo.id)
    .gte('data_hora', periodo.inicio)
    .lte('data_hora', periodo.fim);
  
  // Carregar pagamentos
  const { data: pagamentos } = await window.supabaseClient
    .from('pagamentos')
    .select('*')
    .eq('psicologo_id', currentPsicologo.id)
    .gte('data_pagamento', periodo.inicio.split('T')[0])
    .lte('data_pagamento', periodo.fim.split('T')[0]);
  
  calcularResumo(pacientes, sessoes, pagamentos);
  renderCharts(sessoes, pagamentos);
  renderTopPacientes(sessoes, pagamentos);
  renderDetailsTable(pacientes, sessoes, pagamentos);
}

function getPeriodo() {
  const filtro = document.getElementById('filterPeriodo').value;
  const hoje = new Date();
  let inicio = new Date();
  let fim = new Date();
  
  switch(filtro) {
    case 'mes':
      inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
      fim = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
      break;
    case 'mes_anterior':
      inicio = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1);
      fim = new Date(hoje.getFullYear(), hoje.getMonth(), 0);
      break;
    case 'trimestre':
      inicio = new Date();
      inicio.setMonth(hoje.getMonth() - 3);
      fim = new Date();
      break;
    case 'semestre':
      inicio = new Date();
      inicio.setMonth(hoje.getMonth() - 6);
      fim = new Date();
      break;
    case 'ano':
      inicio = new Date(hoje.getFullYear(), 0, 1);
      fim = new Date(hoje.getFullYear(), 11, 31);
      break;
    case 'ano_anterior':
      inicio = new Date(hoje.getFullYear() - 1, 0, 1);
      fim = new Date(hoje.getFullYear() - 1, 11, 31);
      break;
    case 'custom':
      const dataInicio = document.getElementById('dataInicio').value;
      const dataFim = document.getElementById('dataFim').value;
      if (dataInicio) inicio = new Date(dataInicio);
      if (dataFim) fim = new Date(dataFim);
      break;
    default:
      inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
      fim = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
  }
  
  inicio.setHours(0, 0, 0, 0);
  fim.setHours(23, 59, 59, 999);
  
  return {
    inicio: inicio.toISOString(),
    fim: fim.toISOString()
  };
}

function calcularResumo(pacientes, sessoes, pagamentos) {
  const totalPacientes = (pacientes || []).filter(p => p.status === 'ativo').length;
  const sessoesRealizadas = (sessoes || []).filter(s => s.status === 'realizada').length;
  const totalSessoes = sessoesRealizadas; // Contar apenas realizadas
  const totalFaltas = (sessoes || []).filter(s => s.status === 'falta').length;
  
  // Separar receitas e despesas
  const receitas = (pagamentos || []).filter(p => p.tipo_transacao === 'receita' && p.status === 'pago');
  const despesas = (pagamentos || []).filter(p => p.tipo_transacao === 'despesa' && p.status === 'pago');
  
  const totalReceitas = receitas.reduce((sum, p) => sum + (p.valor || 0), 0);
  const totalDespesas = despesas.reduce((sum, p) => sum + (p.valor || 0), 0);
  const faturamento = totalReceitas - totalDespesas; // Lucro líquido
  
  const taxaPresenca = totalSessoes > 0 ? ((sessoesRealizadas / (totalSessoes + totalFaltas)) * 100).toFixed(1) : 0;
  
  document.getElementById('totalPacientes').textContent = totalPacientes;
  document.getElementById('totalSessoes').textContent = totalSessoes;
  
  // Atualizar cards de receitas, despesas e lucro líquido
  document.getElementById('totalReceitas').textContent = `R$ ${totalReceitas.toFixed(2)}`;
  document.getElementById('totalDespesas').textContent = `R$ ${totalDespesas.toFixed(2)}`;
  
  const lucroElement = document.getElementById('totalFaturamento');
  lucroElement.textContent = `R$ ${faturamento.toFixed(2)}`;
  lucroElement.style.color = faturamento >= 0 ? '#4CAF50' : '#f44336';
  
  document.getElementById('taxaPresenca').textContent = `${taxaPresenca}%`;
  document.getElementById('totalFaltas').textContent = totalFaltas;
}

function renderCharts(sessoes, pagamentos) {
  // Gráfico de Sessões por Mês (últimos 6 meses)
  const meses = [];
  const sessoesPorMes = [];
  for (let i = 5; i >= 0; i--) {
    const data = new Date();
    data.setMonth(data.getMonth() - i);
    const mesNome = data.toLocaleDateString('pt-BR', { month: 'short' });
    meses.push(mesNome);
    const count = (sessoes || []).filter(s => {
      const sessaoData = new Date(s.data_hora);
      return s.status === 'realizada' && sessaoData.getMonth() === data.getMonth() && sessaoData.getFullYear() === data.getFullYear();
    }).length;
    sessoesPorMes.push(count);
  }
  
  const ctx1 = document.getElementById('chartSessoesMes');
  if (charts.sessoes) charts.sessoes.destroy();
  charts.sessoes = new Chart(ctx1, {
    type: 'line',
    data: {
      labels: meses,
      datasets: [{
        label: 'Sessões',
        data: sessoesPorMes,
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        tension: 0.4,
        fill: true
      }]
    },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
  });
  
  // Gráfico de Faturamento (Receitas vs Despesas)
  const faturamentoPorMes = [];
  const despesasPorMes = [];
  for (let i = 5; i >= 0; i--) {
    const data = new Date();
    data.setMonth(data.getMonth() - i);
    
    const receitas = (pagamentos || []).filter(p => {
      const pagData = new Date(p.data_pagamento);
      return pagData.getMonth() === data.getMonth() && 
             pagData.getFullYear() === data.getFullYear() && 
             p.status === 'pago' && 
             p.tipo_transacao === 'receita';
    }).reduce((sum, p) => sum + (p.valor || 0), 0);
    
    const despesas = (pagamentos || []).filter(p => {
      const pagData = new Date(p.data_pagamento);
      return pagData.getMonth() === data.getMonth() && 
             pagData.getFullYear() === data.getFullYear() && 
             p.status === 'pago' && 
             p.tipo_transacao === 'despesa';
    }).reduce((sum, p) => sum + (p.valor || 0), 0);
    
    faturamentoPorMes.push(receitas);
    despesasPorMes.push(despesas);
  }
  
  const ctx2 = document.getElementById('chartFaturamento');
  if (charts.faturamento) charts.faturamento.destroy();
  charts.faturamento = new Chart(ctx2, {
    type: 'bar',
    data: {
      labels: meses,
      datasets: [
        {
          label: 'Receitas',
          data: faturamentoPorMes,
          backgroundColor: '#10b981'
        },
        {
          label: 'Despesas',
          data: despesasPorMes,
          backgroundColor: '#ef4444'
        }
      ]
    },
    options: { 
      responsive: true, 
      maintainAspectRatio: false,
      plugins: { 
        legend: { display: true }
      }
    }
  });
  
  // Gráfico de Status
  const statusCount = {
    realizada: (sessoes || []).filter(s => s.status === 'realizada').length,
    agendada: (sessoes || []).filter(s => s.status === 'agendada').length,
    cancelada: (sessoes || []).filter(s => s.status === 'cancelada').length,
    falta: (sessoes || []).filter(s => s.status === 'falta').length
  };
  
  const ctx3 = document.getElementById('chartStatusSessoes');
  if (charts.status) charts.status.destroy();
  charts.status = new Chart(ctx3, {
    type: 'doughnut',
    data: {
      labels: ['Realizadas', 'Agendadas', 'Canceladas', 'Faltas'],
      datasets: [{
        data: [statusCount.realizada, statusCount.agendada, statusCount.cancelada, statusCount.falta],
        backgroundColor: ['#10b981', '#6366f1', '#ef4444', '#f59e0b']
      }]
    },
    options: { responsive: true, maintainAspectRatio: false }
  });
}

function renderTopPacientes(sessoes, pagamentos) {
  const pacienteStats = {};
  
  (sessoes || []).forEach(s => {
    if (!pacienteStats[s.paciente_id]) {
      pacienteStats[s.paciente_id] = {
        nome: s.paciente.nome_completo,
        sessoes: 0,
        valor: 0
      };
    }
    pacienteStats[s.paciente_id].sessoes++;
  });
  
  (pagamentos || []).forEach(p => {
    const sessao = (sessoes || []).find(s => s.id === p.sessao_id);
    if (sessao && pacienteStats[sessao.paciente_id]) {
      pacienteStats[sessao.paciente_id].valor += (p.valor || 0);
    }
  });
  
  const top = Object.values(pacienteStats).sort((a, b) => b.sessoes - a.sessoes).slice(0, 10);
  
  const container = document.getElementById('topPacientes');
  container.innerHTML = top.map((p, i) => `
    <div class="top-item">
      <div class="top-item-rank">${i + 1}</div>
      <div class="top-item-info">
        <div class="top-item-name">${p.nome}</div>
        <div class="top-item-detail">${p.sessoes} sessões</div>
      </div>
      <div class="top-item-value">R$ ${p.valor.toFixed(2)}</div>
    </div>
  `).join('');
}

function renderDetailsTable(pacientes, sessoes, pagamentos) {
  const tbody = document.getElementById('detailsTableBody');
  
  const rows = (pacientes || []).map(p => {
    const sessoesPaciente = (sessoes || []).filter(s => s.paciente_id === p.id);
    const totalSessoes = sessoesPaciente.length;
    const faltas = sessoesPaciente.filter(s => s.status === 'falta').length;
    const taxaPresenca = totalSessoes > 0 ? (((totalSessoes - faltas) / totalSessoes) * 100).toFixed(1) : 0;
    
    const pagamentosPaciente = (pagamentos || []).filter(pag => {
      const sessao = sessoesPaciente.find(s => s.id === pag.sessao_id);
      return sessao && pag.status === 'pago';
    });
    const totalPago = pagamentosPaciente.reduce((sum, pag) => sum + (pag.valor || 0), 0);
    
    return `
      <tr>
        <td>${p.nome_completo}</td>
        <td>${totalSessoes}</td>
        <td>${faltas}</td>
        <td>${taxaPresenca}%</td>
        <td>R$ ${totalPago.toFixed(2)}</td>
      </tr>
    `;
  }).join('');
  
  tbody.innerHTML = rows || '<tr><td colspan="5">Nenhum dado disponível</td></tr>';
}

function setupEventListeners() {
  document.getElementById('filterPeriodo').addEventListener('change', (e) => {
    if (e.target.value === 'custom') {
      document.getElementById('customDateRange').style.display = 'flex';
    } else {
      document.getElementById('customDateRange').style.display = 'none';
    }
  });
  
  document.getElementById('filterTipoGrafico').addEventListener('change', () => {
    aplicarFiltroGraficos();
  });
  
  document.getElementById('compararPeriodo').addEventListener('change', (e) => {
    if (e.target.checked) {
      showToast('Comparação de períodos será exibida nos relatórios', 'info');
    }
  });
  
  document.getElementById('btnAtualizarRelatorio').addEventListener('click', loadRelatorios);
  
  document.getElementById('btnLimparFiltros').addEventListener('click', () => {
    document.getElementById('filterPeriodo').value = 'mes';
    document.getElementById('filterTipoGrafico').value = 'todos';
    document.getElementById('compararPeriodo').checked = false;
    document.getElementById('customDateRange').style.display = 'none';
    loadRelatorios();
  });
  
  document.getElementById('btnExportarRelatorio').addEventListener('click', () => {
    showToast('Funcionalidade de exportação será implementada em breve', 'info');
  });
  
  document.getElementById('logoutBtn').addEventListener('click', async () => {
    await window.supabaseClient.auth.signOut();
    window.location.href = '../index.html';
  });
}

function aplicarFiltroGraficos() {
  const tipoGrafico = document.getElementById('filterTipoGrafico').value;
  
  // Ocultar todos os gráficos
  document.querySelectorAll('.chart-container').forEach(container => {
    container.style.display = 'none';
  });
  
  // Mostrar apenas os gráficos selecionados
  if (tipoGrafico === 'todos') {
    document.querySelectorAll('.chart-container').forEach(container => {
      container.style.display = 'block';
    });
  } else if (tipoGrafico === 'sessoes') {
    document.querySelector('#chartSessoesMes')?.parentElement.parentElement.style.setProperty('display', 'block');
    document.querySelector('#chartTaxaPresenca')?.parentElement.parentElement.style.setProperty('display', 'block');
  } else if (tipoGrafico === 'financeiro') {
    document.querySelector('#chartFaturamento')?.parentElement.parentElement.style.setProperty('display', 'block');
  } else if (tipoGrafico === 'pacientes') {
    document.querySelector('#chartPacientesNovos')?.parentElement.parentElement.style.setProperty('display', 'block');
  }
}
