// ================================
// MÓDULO AGENDA
// ================================

let currentUser = null;
let currentPsicologo = null;
let currentWeekStart = new Date();
let pacientes = [];
let sessoes = [];
let editingSessaoId = null;

document.addEventListener('DOMContentLoaded', async () => {
  await checkAuthentication();
  await loadPacientes();
  await loadCurrentWeek();
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

function getInitials(name) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
}

async function loadPacientes() {
  const { data } = await window.supabaseClient
    .from('pacientes')
    .select('*')
    .eq('psicologo_id', currentPsicologo.id)
    .eq('status', 'ativo')
    .order('nome_completo');
  
  pacientes = data || [];
  
  const select = document.getElementById('sessaoPaciente');
  select.innerHTML = '<option value="">Selecione um paciente</option>';
  pacientes.forEach(p => {
    select.innerHTML += `<option value="${p.id}">${p.nome_completo}</option>`;
  });
}

async function loadCurrentWeek() {
  const weekStart = new Date(currentWeekStart);
  weekStart.setHours(0, 0, 0, 0);
  const day = weekStart.getDay();
  const diff = weekStart.getDate() - day + (day === 0 ? -6 : 1);
  weekStart.setDate(diff);
  
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);
  
  document.getElementById('periodoAtual').textContent = 
    `${formatDate(weekStart)} - ${formatDate(weekEnd)}`;
  
  await loadSessoes(weekStart, weekEnd);
  renderAgenda(weekStart);
}

async function loadSessoes(start, end) {
  const { data } = await window.supabaseClient
    .from('sessoes')
    .select(`
      *,
      paciente:pacientes(nome_completo)
    `)
    .eq('psicologo_id', currentPsicologo.id)
    .gte('data_hora', start.toISOString())
    .lte('data_hora', end.toISOString())
    .order('data_hora');
  
  sessoes = data || [];
}

function renderAgenda(weekStart) {
  const grid = document.getElementById('agendaGrid');
  const days = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
  const hours = Array.from({length: 14}, (_, i) => i + 7); // 7h às 20h
  
  let html = '<div class="agenda-header"></div>';
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + i);
    const isToday = date.toDateString() === new Date().toDateString();
    html += `<div class="agenda-header ${isToday ? 'today' : ''}">
      ${days[i]}<br>${date.getDate()}/${date.getMonth() + 1}
    </div>`;
  }
  
  hours.forEach(hour => {
    html += `<div class="agenda-time">${String(hour).padStart(2, '0')}:00</div>`;
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      const isToday = date.toDateString() === new Date().toDateString();
      
      const cellSessoes = sessoes.filter(s => {
        const sessaoDate = new Date(s.data_hora);
        return sessaoDate.getDate() === date.getDate() &&
               sessaoDate.getMonth() === date.getMonth() &&
               sessaoDate.getHours() === hour;
      });
      
      html += `<div class="agenda-cell ${isToday ? 'today' : ''}" 
                   data-date="${date.toISOString()}" 
                   data-hour="${hour}">`;
      
      cellSessoes.forEach(s => {
        const hora = new Date(s.data_hora);
        html += `<div class="sessao-card ${s.status}" onclick="editSessao('${s.id}')">
          <div class="sessao-card-paciente">${s.paciente.nome_completo}</div>
          <div class="sessao-card-hora">${hora.toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'})}</div>
        </div>`;
      });
      
      html += '</div>';
    }
  });
  
  grid.innerHTML = html;
}

function setupEventListeners() {
  document.getElementById('btnNovaSessao').addEventListener('click', () => {
    editingSessaoId = null;
    document.getElementById('modalSessaoTitle').textContent = 'Nova Sessão';
    document.getElementById('formSessao').reset();
    document.getElementById('sessaoData').valueAsDate = new Date();
    document.getElementById('modalSessao').style.display = 'flex';
  });
  
  document.getElementById('closeSessaoModal').addEventListener('click', () => {
    document.getElementById('modalSessao').style.display = 'none';
  });
  
  document.getElementById('btnCancelarSessao').addEventListener('click', () => {
    document.getElementById('modalSessao').style.display = 'none';
  });
  
  document.getElementById('formSessao').addEventListener('submit', handleSaveSessao);
  
  document.getElementById('btnSemanaAnterior').addEventListener('click', () => {
    currentWeekStart.setDate(currentWeekStart.getDate() - 7);
    loadCurrentWeek();
  });
  
  document.getElementById('btnProximaSemana').addEventListener('click', () => {
    currentWeekStart.setDate(currentWeekStart.getDate() + 7);
    loadCurrentWeek();
  });
  
  document.getElementById('btnHoje').addEventListener('click', () => {
    currentWeekStart = new Date();
    loadCurrentWeek();
  });

  // Botão para ver sessões realizadas
  document.getElementById('btnVerRealizadas').addEventListener('click', () => {
    showSessoesRealizadas();
  });

  document.getElementById('btnFecharRealizadas').addEventListener('click', () => {
    document.getElementById('sessoesRealizadas').style.display = 'none';
    document.getElementById('agendaGrid').parentElement.style.display = 'block';
  });

  // Botão para ver sessões canceladas
  document.getElementById('btnVerCanceladas').addEventListener('click', () => {
    showSessoesCanceladas();
  });

  document.getElementById('btnFecharCanceladas').addEventListener('click', () => {
    document.getElementById('sessoesCanceladas').style.display = 'none';
    document.getElementById('agendaGrid').parentElement.style.display = 'block';
  });
  
  document.getElementById('logoutBtn').addEventListener('click', async () => {
    await window.supabaseClient.auth.signOut();
    window.location.href = '../index.html';
  });
}

async function handleSaveSessao(e) {
  e.preventDefault();
  
  const btn = document.getElementById('btnSalvarSessao');
  const btnText = btn.querySelector('.btn-text');
  const btnLoading = btn.querySelector('.btn-loading');
  
  btn.disabled = true;
  btnText.style.display = 'none';
  btnLoading.style.display = 'inline-flex';
  
  try {
    // Corrigir timezone - usar horário local sem conversão UTC
    const dataInput = document.getElementById('sessaoData').value;
    const horaInput = document.getElementById('sessaoHora').value;
    const dataHoraLocal = new Date(dataInput + 'T' + horaInput);
    
    const data = {
      psicologo_id: currentPsicologo.id,
      paciente_id: document.getElementById('sessaoPaciente').value,
      data_hora: dataHoraLocal.toISOString(),
      duracao: parseInt(document.getElementById('sessaoDuracao').value),
      tipo: document.getElementById('sessaoTipo').value,
      status: document.getElementById('sessaoStatus').value,
      valor: parseFloat(document.getElementById('sessaoValor').value) || null,
      link_online: document.getElementById('sessaoLinkOnline').value || null,
      observacoes: document.getElementById('sessaoObservacoes').value || null
    };
    
    if (editingSessaoId) {
      // Verificar se mudou status para 'realizada' e criar pagamento
      const sessaoAntiga = sessoes.find(s => s.id === editingSessaoId);
      
      // VALIDAÇÃO: Impedir cancelamento de sessões realizadas ou com pagamento pago
      if (data.status === 'cancelada' && sessaoAntiga.status === 'realizada') {
        showToast('Não é possível cancelar uma sessão já realizada!', 'error');
        btn.disabled = false;
        btnText.style.display = 'inline';
        btnLoading.style.display = 'none';
        return;
      }
      
      // Verificar se existe pagamento pago
      if (data.status === 'cancelada') {
        const { data: pagamentos } = await window.supabaseClient
          .from('pagamentos')
          .select('*')
          .eq('sessao_id', editingSessaoId)
          .eq('status', 'pago');
        
        if (pagamentos && pagamentos.length > 0) {
          showToast('Não é possível cancelar uma sessão com pagamento já recebido!', 'error');
          btn.disabled = false;
          btnText.style.display = 'inline';
          btnLoading.style.display = 'none';
          return;
        }
      }
      
      const mudouParaRealizada = sessaoAntiga && sessaoAntiga.status !== 'realizada' && data.status === 'realizada';
      
      await window.supabaseClient
        .from('sessoes')
        .update(data)
        .eq('id', editingSessaoId);
      
      // Criar pagamento automaticamente quando finalizar atendimento
      if (mudouParaRealizada && data.valor) {
        const dataPagamento = new Date(data.data_hora).toISOString().split('T')[0];
        const { error: pagamentoError } = await window.supabaseClient
          .from('pagamentos')
          .insert([{
            psicologo_id: currentPsicologo.id,
            sessao_id: editingSessaoId,
            valor: data.valor,
            data_pagamento: dataPagamento,
            forma_pagamento: 'dinheiro',
            status: 'pendente',
            observacoes: 'Pagamento criado automaticamente na finalização da sessão'
          }]);
        
        if (pagamentoError) {
          console.error('Erro ao criar pagamento:', pagamentoError);
          showToast('Sessão finalizada, mas erro ao criar pagamento', 'warning');
        } else {
          showToast('Sessão finalizada e pagamento criado!', 'success');
        }
      } else {
        showToast('Sessão atualizada com sucesso!', 'success');
      }
    } else {
      await window.supabaseClient
        .from('sessoes')
        .insert([data]);
      showToast('Sessão criada com sucesso!', 'success');
    }
    
    document.getElementById('modalSessao').style.display = 'none';
    await loadCurrentWeek();
    
  } catch (error) {
    console.error('Erro ao salvar sessão:', error);
    showToast('Erro ao salvar sessão', 'error');
  } finally {
    btn.disabled = false;
    btnText.style.display = 'inline';
    btnLoading.style.display = 'none';
  }
}

async function editSessao(id) {
  editingSessaoId = id;
  const sessao = sessoes.find(s => s.id === id);
  if (!sessao) return;
  
  document.getElementById('modalSessaoTitle').textContent = 'Editar Sessão';
  const dataHora = new Date(sessao.data_hora);
  
  // Formatar data e hora corretamente
  const ano = dataHora.getFullYear();
  const mes = String(dataHora.getMonth() + 1).padStart(2, '0');
  const dia = String(dataHora.getDate()).padStart(2, '0');
  const hora = String(dataHora.getHours()).padStart(2, '0');
  const minuto = String(dataHora.getMinutes()).padStart(2, '0');
  
  document.getElementById('sessaoPaciente').value = sessao.paciente_id;
  document.getElementById('sessaoData').value = `${ano}-${mes}-${dia}`;
  document.getElementById('sessaoHora').value = `${hora}:${minuto}`;
  document.getElementById('sessaoDuracao').value = sessao.duracao;
  document.getElementById('sessaoTipo').value = sessao.tipo;
  document.getElementById('sessaoStatus').value = sessao.status;
  document.getElementById('sessaoValor').value = sessao.valor || '';
  document.getElementById('sessaoLinkOnline').value = sessao.link_online || '';
  document.getElementById('sessaoObservacoes').value = sessao.observacoes || '';
  
  document.getElementById('modalSessao').style.display = 'flex';
}

async function showSessoesRealizadas() {
  try {
    // Carregar todas as sessões realizadas do psicólogo
    const { data, error } = await window.supabaseClient
      .from('sessoes')
      .select(`
        *,
        paciente:pacientes(nome_completo)
      `)
      .eq('psicologo_id', currentPsicologo.id)
      .eq('status', 'realizada')
      .order('data_hora', { ascending: false })
      .limit(100);

    if (error) throw error;

    const listaRealizadas = document.getElementById('listaRealizadas');
    
    if (!data || data.length === 0) {
      listaRealizadas.innerHTML = `
        <div style="text-align: center; padding: 2rem; color: var(--text-secondary);">
          <p>Nenhuma sessão realizada encontrada.</p>
        </div>
      `;
    } else {
      listaRealizadas.innerHTML = data.map(sessao => {
        const dataHora = new Date(sessao.data_hora);
        const pacienteNome = sessao.paciente?.nome_completo || 'Paciente não identificado';
        const iniciadaEm = sessao.iniciada_em ? new Date(sessao.iniciada_em) : null;
        const finalizadaEm = sessao.finalizada_em ? new Date(sessao.finalizada_em) : null;
        
        return `
          <div class="sessao-realizada-item" style="
            background: var(--bg-secondary);
            border-left: 3px solid var(--success-color);
            padding: 1rem;
            margin-bottom: 0.75rem;
            border-radius: 8px;
          ">
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
              <div style="flex: 1;">
                <div style="font-weight: 600; color: var(--text-primary); margin-bottom: 0.25rem;">
                  ${pacienteNome}
                </div>
                <div style="color: var(--text-secondary); font-size: 0.875rem;">
                  <strong>Agendada:</strong> ${formatDate(dataHora)} às ${formatTime(dataHora)}
                </div>
                ${iniciadaEm ? `
                  <div style="color: var(--text-secondary); font-size: 0.875rem;">
                    <strong>Iniciada:</strong> ${formatTime(iniciadaEm)}
                  </div>
                ` : ''}
                ${finalizadaEm ? `
                  <div style="color: var(--text-secondary); font-size: 0.875rem;">
                    <strong>Finalizada:</strong> ${formatTime(finalizadaEm)}
                  </div>
                ` : ''}
                ${sessao.observacoes ? `
                  <div style="color: var(--text-secondary); font-size: 0.875rem; margin-top: 0.5rem;">
                    <strong>Observações:</strong> ${sessao.observacoes}
                  </div>
                ` : ''}
              </div>
              <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                <span class="badge" style="background: var(--success-color); color: white; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.75rem; white-space: nowrap;">
                  ✓ Realizada
                </span>
                ${sessao.valor ? `
                  <span style="color: var(--text-secondary); font-size: 0.875rem; text-align: right;">
                    R$ ${parseFloat(sessao.valor).toFixed(2)}
                  </span>
                ` : ''}
              </div>
            </div>
          </div>
        `;
      }).join('');
    }

    // Esconder agenda e mostrar realizadas
    document.getElementById('agendaGrid').parentElement.style.display = 'none';
    document.getElementById('sessoesRealizadas').style.display = 'block';
    
  } catch (error) {
    console.error('Erro ao carregar sessões realizadas:', error);
    showToast('Erro ao carregar sessões realizadas', 'error');
  }
}

async function showSessoesCanceladas() {
  try {
    // Carregar todas as sessões canceladas do psicólogo
    const { data, error } = await window.supabaseClient
      .from('sessoes')
      .select(`
        *,
        paciente:pacientes(nome_completo)
      `)
      .eq('psicologo_id', currentPsicologo.id)
      .eq('status', 'cancelada')
      .order('data_hora', { ascending: false })
      .limit(50);

    if (error) throw error;

    const listaCanceladas = document.getElementById('listaCanceladas');
    
    if (!data || data.length === 0) {
      listaCanceladas.innerHTML = `
        <div style="text-align: center; padding: 2rem; color: var(--text-secondary);">
          <p>Nenhuma sessão cancelada encontrada.</p>
        </div>
      `;
    } else {
      listaCanceladas.innerHTML = data.map(sessao => {
        const dataHora = new Date(sessao.data_hora);
        const pacienteNome = sessao.paciente?.nome_completo || 'Paciente não identificado';
        
        return `
          <div class="sessao-cancelada-item" style="
            background: var(--bg-secondary);
            border-left: 3px solid var(--danger-color);
            padding: 1rem;
            margin-bottom: 0.75rem;
            border-radius: 8px;
          ">
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
              <div>
                <div style="font-weight: 600; color: var(--text-primary); margin-bottom: 0.25rem;">
                  ${pacienteNome}
                </div>
                <div style="color: var(--text-secondary); font-size: 0.875rem;">
                  ${formatDate(dataHora)} às ${formatTime(dataHora)}
                </div>
                ${sessao.observacoes ? `
                  <div style="color: var(--text-secondary); font-size: 0.875rem; margin-top: 0.5rem;">
                    <strong>Observações:</strong> ${sessao.observacoes}
                  </div>
                ` : ''}
              </div>
              <button 
                onclick="reativarSessao('${sessao.id}')" 
                class="btn btn-sm"
                style="background: var(--success-color); color: white;"
              >
                Reativar
              </button>
            </div>
          </div>
        `;
      }).join('');
    }

    // Esconder agenda e mostrar canceladas
    document.getElementById('agendaGrid').parentElement.style.display = 'none';
    document.getElementById('sessoesCanceladas').style.display = 'block';
    
  } catch (error) {
    console.error('Erro ao carregar sessões canceladas:', error);
    showToast('Erro ao carregar sessões canceladas', 'error');
  }
}

async function reativarSessao(id) {
  if (!confirm('Deseja realmente reativar esta sessão?')) return;

  try {
    const { error } = await window.supabaseClient
      .from('sessoes')
      .update({ status: 'agendada' })
      .eq('id', id);

    if (error) throw error;

    showToast('Sessão reativada com sucesso!', 'success');
    
    // Recarregar a lista de canceladas
    showSessoesCanceladas();
    
    // Recarregar a semana atual também
    loadCurrentWeek();
    
  } catch (error) {
    console.error('Erro ao reativar sessão:', error);
    showToast('Erro ao reativar sessão', 'error');
  }
}

// Tornar funções disponíveis globalmente para uso inline
window.reativarSessao = reativarSessao;
window.editSessao = editSessao;

// Funções auxiliares
function formatDate(date) {
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function formatTime(date) {
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
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
