// ================================
// MÓDULO DASHBOARD
// ================================

let currentUser = null;
let currentPsicologo = null;

document.addEventListener('DOMContentLoaded', async () => {
  // Verificar autenticação
  await checkAuthentication();
  
  // Carregar dados do dashboard
  await loadDashboardData();
  
  // Setup dos event listeners
  setupEventListeners();
  
  // Atualizar dados a cada 5 minutos
  setInterval(loadDashboardData, 5 * 60 * 1000);
});

// Verificar se usuário está autenticado
async function checkAuthentication() {
  try {
    const { data: { session }, error } = await window.supabaseClient.auth.getSession();
    
    if (error || !session) {
      window.location.href = 'index.html';
      return;
    }
    
    currentUser = session.user;
    
    // Buscar dados do psicólogo
    const { data: psicologo, error: psicologoError } = await window.supabaseClient
      .from('psicologos')
      .select('*')
      .eq('user_id', currentUser.id)
      .single();
    
    if (psicologoError) {
      console.error('Erro ao buscar psicólogo:', psicologoError);
      return;
    }
    
    currentPsicologo = psicologo;
    storage.set('currentPsicologo', psicologo);
    
    // Atualizar UI com dados do usuário
    updateUserInfo();
    
  } catch (error) {
    console.error('Erro na autenticação:', error);
    window.location.href = 'index.html';
  }
}

// Atualizar informações do usuário na sidebar
function updateUserInfo() {
  if (!currentPsicologo) return;
  
  const userName = document.getElementById('userName');
  const userAvatar = document.getElementById('userAvatar');
  
  if (userName) {
    userName.textContent = currentPsicologo.nome.split(' ')[0];
  }
  
  if (userAvatar) {
    userAvatar.textContent = getInitials(currentPsicologo.nome);
    userAvatar.style.background = `linear-gradient(135deg, ${generateAvatarColor(currentPsicologo.nome)}, var(--accent))`;
  }
}

// Carregar dados do dashboard
async function loadDashboardData() {
  try {
    if (!currentPsicologo) return;
    
    // Carregar em paralelo
    await Promise.all([
      loadStatistics(),
      loadUpcomingSessions(),
      loadRecentActivities(),
      loadAlerts()
    ]);
    
  } catch (error) {
    console.error('Erro ao carregar dados do dashboard:', error);
    showToast('Erro ao carregar dados', 'error');
  }
}

// Carregar estatísticas
async function loadStatistics() {
  try {
    // Total de pacientes ativos
    const { count: totalPacientes } = await window.supabaseClient
      .from('pacientes')
      .select('*', { count: 'exact', head: true })
      .eq('psicologo_id', currentPsicologo.id)
      .eq('status', 'ativo');
    
    document.getElementById('totalPacientes').textContent = totalPacientes || 0;
    
    // Sessões hoje
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const amanha = new Date(hoje);
    amanha.setDate(amanha.getDate() + 1);
    
    const { count: sessoesHoje } = await window.supabaseClient
      .from('sessoes')
      .select('*', { count: 'exact', head: true })
      .eq('psicologo_id', currentPsicologo.id)
      .gte('data_hora', hoje.toISOString())
      .lt('data_hora', amanha.toISOString());
    
    document.getElementById('sessoesHoje').textContent = sessoesHoje || 0;
    
    // Próxima sessão
    const { data: proximaSessao } = await window.supabaseClient
      .from('sessoes')
      .select('data_hora')
      .eq('psicologo_id', currentPsicologo.id)
      .eq('status', 'agendada')
      .gte('data_hora', new Date().toISOString())
      .order('data_hora', { ascending: true })
      .limit(1)
      .single();
    
    if (proximaSessao) {
      const hora = new Date(proximaSessao.data_hora);
      document.getElementById('proximaSessao').textContent = 
        hora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    } else {
      document.getElementById('proximaSessao').textContent = '--:--';
    }
    
    // Faturamento mensal
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
    fimMes.setHours(23, 59, 59, 999);
    
    const { data: pagamentos } = await window.supabaseClient
      .from('pagamentos')
      .select('valor')
      .eq('psicologo_id', currentPsicologo.id)
      .eq('status', 'pago')
      .gte('data_pagamento', inicioMes.toISOString().split('T')[0])
      .lte('data_pagamento', fimMes.toISOString().split('T')[0]);
    
    // Sessões realizadas no mês
    const { count: sessoesRealizadas } = await window.supabaseClient
      .from('sessoes')
      .select('*', { count: 'exact', head: true })
      .eq('psicologo_id', currentPsicologo.id)
      .eq('status', 'realizada')
      .gte('data_hora', inicioMes.toISOString())
      .lte('data_hora', fimMes.toISOString());
    
    document.getElementById('sessoesRealizadas').textContent = sessoesRealizadas || 0;
    
    // Sessões canceladas no mês
    const { count: sessoesCanceladas } = await window.supabaseClient
      .from('sessoes')
      .select('*', { count: 'exact', head: true })
      .eq('psicologo_id', currentPsicologo.id)
      .eq('status', 'cancelada')
      .gte('data_hora', inicioMes.toISOString())
      .lte('data_hora', fimMes.toISOString());
    
    document.getElementById('sessoesCanceladas').textContent = sessoesCanceladas || 0;
    
    const total = pagamentos?.reduce((sum, p) => sum + parseFloat(p.valor), 0) || 0;
    document.getElementById('faturamentoMes').textContent = formatCurrency(total);
    
  } catch (error) {
    console.error('Erro ao carregar estatísticas:', error);
  }
}

// Carregar próximas sessões
async function loadUpcomingSessions() {
  try {
    const { data: sessoes, error } = await window.supabaseClient
      .from('sessoes')
      .select(`
        *,
        pacientes (nome_completo)
      `)
      .eq('psicologo_id', currentPsicologo.id)
      .in('status', ['agendada', 'em_andamento'])
      .gte('data_hora', new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString())
      .order('data_hora', { ascending: true })
      .limit(5);
    
    if (error) throw error;
    
    const container = document.getElementById('proximasSessoes');
    
    if (!sessoes || sessoes.length === 0) {
      container.innerHTML = `
        <p style="text-align: center; color: var(--text-secondary); padding: 2rem;">
          Nenhuma sessão agendada
        </p>
      `;
      return;
    }
    
    container.innerHTML = sessoes.map(sessao => {
      const dataHora = new Date(sessao.data_hora);
      const agora = new Date();
      const diferencaMinutos = (dataHora - agora) / (1000 * 60);
      const podeIniciar = diferencaMinutos <= 15 && diferencaMinutos >= -60; // 15 min antes até 60 min depois
      const statusClass = sessao.status === 'agendada' ? 'scheduled' : 'confirmed';
      
      let actionButton = '';
      if (sessao.status === 'agendada' && podeIniciar) {
        actionButton = `
          <button class="btn btn-sm btn-success" onclick="iniciarSessao('${sessao.id}')" title="Iniciar atendimento">
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd"/>
            </svg>
            Iniciar
          </button>
        `;
      } else if (sessao.status === 'em_andamento') {
        actionButton = `
          <button class="btn btn-sm btn-primary" onclick="finalizarSessao('${sessao.id}', '${sessao.paciente_id}', ${sessao.valor || 0})" title="Finalizar atendimento">
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
            </svg>
            Finalizar
          </button>
        `;
      }
      
      return `
        <div class="appointment-item ${statusClass} ${sessao.status === 'em_andamento' ? 'em-andamento' : ''}">
          <div class="appointment-time">${dataHora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</div>
          <div style="flex: 1;">
            <div class="appointment-patient">${sessao.pacientes.nome_completo}</div>
            <div class="appointment-type">${sessao.tipo === 'presencial' ? '📍 Presencial' : '💻 Online'}</div>
          </div>
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            ${actionButton}
            <span class="badge badge-${sessao.status === 'em_andamento' ? 'warning' : statusClass === 'scheduled' ? 'info' : 'success'}">
              ${sessao.status === 'em_andamento' ? 'Em Andamento' : sessao.status}
            </span>
          </div>
        </div>
      `;
    }).join('');
    
  } catch (error) {
    console.error('Erro ao carregar sessões:', error);
  }
}

// Iniciar sessão
async function iniciarSessao(sessaoId) {
  if (!confirm('Deseja iniciar este atendimento agora?')) return;
  
  try {
    const { error } = await window.supabaseClient
      .from('sessoes')
      .update({ 
        status: 'em_andamento',
        iniciada_em: new Date().toISOString()
      })
      .eq('id', sessaoId);
    
    if (error) throw error;
    
    showToast('Atendimento iniciado!', 'success');
    await loadUpcomingSessions();
  } catch (error) {
    console.error('Erro ao iniciar sessão:', error);
    showToast('Erro ao iniciar atendimento', 'error');
  }
}

// Finalizar sessão
async function finalizarSessao(sessaoId, pacienteId, valor) {
  if (!confirm('Deseja finalizar este atendimento?')) return;
  
  try {
    const agora = new Date().toISOString();
    
    // Atualizar status da sessão
    const { error: updateError } = await window.supabaseClient
      .from('sessoes')
      .update({ 
        status: 'realizada',
        finalizada_em: agora
      })
      .eq('id', sessaoId);
    
    if (updateError) throw updateError;
    
    // Criar pagamento automaticamente se houver valor
    if (valor && valor > 0) {
      const dataPagamento = new Date().toISOString().split('T')[0];
      
      const { error: pagamentoError } = await window.supabaseClient
        .from('pagamentos')
        .insert([{
          psicologo_id: currentPsicologo.id,
          sessao_id: sessaoId,
          valor: valor,
          data_pagamento: dataPagamento,
          forma_pagamento: 'dinheiro',
          status: 'pendente',
          observacoes: 'Pagamento criado automaticamente na finalização da sessão'
        }]);
      
      if (pagamentoError) {
        console.error('Erro ao criar pagamento:', pagamentoError);
        showToast('Atendimento finalizado, mas erro ao criar pagamento', 'warning');
      } else {
        showToast('Atendimento finalizado e pagamento criado!', 'success');
      }
    } else {
      showToast('Atendimento finalizado!', 'success');
    }
    
    await loadDashboardData();
  } catch (error) {
    console.error('Erro ao finalizar sessão:', error);
    showToast('Erro ao finalizar atendimento', 'error');
  }
}

// Carregar atividades recentes
async function loadRecentActivities() {
  try {
    // Buscar sessões realizadas recentemente
    const { data: sessoes } = await window.supabaseClient
      .from('sessoes')
      .select(`
        *,
        pacientes (nome_completo)
      `)
      .eq('psicologo_id', currentPsicologo.id)
      .eq('status', 'realizada')
      .order('data_hora', { ascending: false })
      .limit(5);
    
    const container = document.getElementById('atividadesRecentes');
    
    if (!sessoes || sessoes.length === 0) {
      container.innerHTML = `
        <li class="activity-item">
          <div class="activity-icon" style="background-color: rgba(99, 102, 241, 0.1); color: var(--primary);">
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"/>
            </svg>
          </div>
          <div class="activity-content">
            <div class="activity-title">Nenhuma atividade recente</div>
            <div class="activity-time">Comece agendando uma sessão</div>
          </div>
        </li>
      `;
      return;
    }
    
    container.innerHTML = sessoes.map(sessao => `
      <li class="activity-item">
        <div class="activity-icon" style="background-color: rgba(16, 185, 129, 0.1); color: var(--success);">
          <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
          </svg>
        </div>
        <div class="activity-content">
          <div class="activity-title">Sessão com ${sessao.pacientes.nome_completo}</div>
          <div class="activity-time">${timeAgo(sessao.data_hora)}</div>
        </div>
      </li>
    `).join('');
    
  } catch (error) {
    console.error('Erro ao carregar atividades:', error);
  }
}

// Carregar alertas
async function loadAlerts() {
  try {
    const container = document.getElementById('alertasLembretes');
    const alerts = [];
    
    // Verificar pacientes com aniversário hoje
    const hoje = new Date();
    const diaHoje = hoje.getDate();
    const mesHoje = hoje.getMonth() + 1;
    
    const { data: aniversariantes } = await window.supabaseClient
      .from('pacientes')
      .select('nome_completo, data_nascimento')
      .eq('psicologo_id', currentPsicologo.id)
      .eq('status', 'ativo');
    
    if (aniversariantes) {
      aniversariantes.forEach(paciente => {
        const nascimento = new Date(paciente.data_nascimento);
        if (nascimento.getDate() === diaHoje && (nascimento.getMonth() + 1) === mesHoje) {
          alerts.push(`
            <div class="alert alert-info">
              🎉 <strong>Aniversário:</strong> ${paciente.nome_completo} faz aniversário hoje!
            </div>
          `);
        }
      });
    }
    
    // Verificar pagamentos pendentes
    const { count: pagamentosPendentes } = await window.supabaseClient
      .from('pagamentos')
      .select('*', { count: 'exact', head: true })
      .eq('psicologo_id', currentPsicologo.id)
      .eq('status', 'pendente');
    
    if (pagamentosPendentes && pagamentosPendentes > 0) {
      alerts.push(`
        <div class="alert alert-warning">
          ⚠️ <strong>Atenção:</strong> Você tem ${pagamentosPendentes} pagamento(s) pendente(s).
        </div>
      `);
    }
    
    // Verificar prontuários sem atualização há mais de 30 dias
    const trintaDiasAtras = new Date();
    trintaDiasAtras.setDate(trintaDiasAtras.getDate() - 30);
    
    const { count: prontuariosDesatualizados } = await window.supabaseClient
      .from('prontuarios')
      .select('*', { count: 'exact', head: true })
      .eq('psicologo_id', currentPsicologo.id)
      .lt('updated_at', trintaDiasAtras.toISOString());
    
    if (prontuariosDesatualizados && prontuariosDesatualizados > 0) {
      alerts.push(`
        <div class="alert alert-info">
          💡 <strong>Lembrete:</strong> ${prontuariosDesatualizados} prontuário(s) sem atualização há mais de 30 dias.
        </div>
      `);
    }
    
    // Se não houver alertas, mostrar dica padrão
    if (alerts.length === 0) {
      alerts.push(`
        <div class="alert alert-info">
          💡 <strong>Dica:</strong> Mantenha seus prontuários sempre atualizados para melhor acompanhamento dos pacientes.
        </div>
      `);
    }
    
    container.innerHTML = alerts.join('');
    
  } catch (error) {
    console.error('Erro ao carregar alertas:', error);
  }
}

// Tornar funções globais
window.iniciarSessao = iniciarSessao;
window.finalizarSessao = finalizarSessao;

// Setup dos event listeners
function setupEventListeners() {
  // Logout
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }
  
  // Menu mobile
  const mobileMenuToggle = document.getElementById('mobileMenuToggle');
  const sidebar = document.getElementById('sidebar');
  const sidebarOverlay = document.getElementById('sidebarOverlay');
  
  if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener('click', () => {
      sidebar.classList.toggle('active');
      sidebarOverlay.classList.toggle('active');
    });
  }
  
  if (sidebarOverlay) {
    sidebarOverlay.addEventListener('click', () => {
      sidebar.classList.remove('active');
      sidebarOverlay.classList.remove('active');
    });
  }
}

// Handler de logout
async function handleLogout() {
  if (!confirmAction('Tem certeza que deseja sair?')) {
    return;
  }
  
  try {
    await window.supabaseClient.auth.signOut();
    storage.clear();
    window.location.href = 'index.html';
  } catch (error) {
    console.error('Erro ao fazer logout:', error);
    showToast('Erro ao sair', 'error');
  }
}

// Controle de inatividade
let inactivityTimer;

function resetInactivityTimer() {
  clearTimeout(inactivityTimer);
  inactivityTimer = setTimeout(async () => {
    await window.supabaseClient.auth.signOut();
    storage.clear();
    window.location.href = 'index.html';
    showToast('Sessão encerrada por inatividade', 'info');
  }, 30 * 60 * 1000); // 30 minutos
}

['mousedown', 'keydown', 'scroll', 'touchstart'].forEach(event => {
  document.addEventListener(event, resetInactivityTimer, true);
});

resetInactivityTimer();
