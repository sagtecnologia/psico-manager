// MÓDULO PERFIL
let currentUser, currentPsicologo;

document.addEventListener('DOMContentLoaded', async () => {
  await checkAuthentication();
  await loadPerfilData();
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

async function loadPerfilData() {
  // Carregar dados básicos
  document.getElementById('perfilNome').textContent = currentPsicologo.nome;
  document.getElementById('perfilEmail').textContent = currentUser.email;
  document.getElementById('perfilCRP').textContent = `CRP: ${currentPsicologo.crp || 'Não informado'}`;
  document.getElementById('perfilAvatarLarge').textContent = getInitials(currentPsicologo.nome);
  
  // Preencher formulário Dados Pessoais
  document.getElementById('nome').value = currentPsicologo.nome || '';
  document.getElementById('cpf').value = currentPsicologo.cpf || '';
  document.getElementById('telefone').value = currentPsicologo.telefone || '';
  document.getElementById('dataNascimento').value = currentPsicologo.data_nascimento || '';
  document.getElementById('endereco').value = currentPsicologo.endereco || '';
  document.getElementById('cidade').value = currentPsicologo.cidade || '';
  document.getElementById('estado').value = currentPsicologo.estado || '';
  document.getElementById('cep').value = currentPsicologo.cep || '';
  
  // Preencher formulário Profissional
  document.getElementById('crp').value = currentPsicologo.crp || '';
  document.getElementById('especialidade').value = currentPsicologo.especialidade || '';
  document.getElementById('abordagem').value = currentPsicologo.abordagem || '';
  document.getElementById('bio').value = currentPsicologo.bio || '';
  document.getElementById('valorConsulta').value = currentPsicologo.valor_consulta || '';
  document.getElementById('duracaoSessao').value = currentPsicologo.duracao_sessao || '50';
}

async function handleSaveDadosPessoais(e) {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  const btnText = btn.querySelector('.btn-text');
  const btnSpinner = btn.querySelector('.btn-spinner');
  
  btnText.style.display = 'none';
  btnSpinner.style.display = 'inline-block';
  btn.disabled = true;
  
  try {
    const updates = {
      nome: document.getElementById('nome').value.trim(),
      cpf: document.getElementById('cpf').value.trim(),
      telefone: document.getElementById('telefone').value.trim(),
      data_nascimento: document.getElementById('dataNascimento').value || null,
      endereco: document.getElementById('endereco').value.trim() || null,
      cidade: document.getElementById('cidade').value.trim() || null,
      estado: document.getElementById('estado').value || null,
      cep: document.getElementById('cep').value.trim() || null,
      updated_at: new Date().toISOString()
    };
    
    const { error } = await window.supabaseClient
      .from('psicologos')
      .update(updates)
      .eq('id', currentPsicologo.id);
    
    if (error) throw error;
    
    currentPsicologo = { ...currentPsicologo, ...updates };
    updateUserInfo();
    document.getElementById('perfilNome').textContent = currentPsicologo.nome;
    
    showToast('Dados pessoais atualizados com sucesso!', 'success');
  } catch (error) {
    console.error('Erro ao atualizar:', error);
    showToast('Erro ao atualizar dados pessoais', 'error');
  } finally {
    btnText.style.display = 'inline';
    btnSpinner.style.display = 'none';
    btn.disabled = false;
  }
}

async function handleSaveProfissional(e) {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  const btnText = btn.querySelector('.btn-text');
  const btnSpinner = btn.querySelector('.btn-spinner');
  
  btnText.style.display = 'none';
  btnSpinner.style.display = 'inline-block';
  btn.disabled = true;
  
  try {
    const updates = {
      crp: document.getElementById('crp').value.trim(),
      especialidade: document.getElementById('especialidade').value.trim() || null,
      abordagem: document.getElementById('abordagem').value.trim() || null,
      bio: document.getElementById('bio').value.trim() || null,
      valor_consulta: parseFloat(document.getElementById('valorConsulta').value) || null,
      duracao_sessao: parseInt(document.getElementById('duracaoSessao').value) || 50,
      updated_at: new Date().toISOString()
    };
    
    const { error } = await window.supabaseClient
      .from('psicologos')
      .update(updates)
      .eq('id', currentPsicologo.id);
    
    if (error) throw error;
    
    currentPsicologo = { ...currentPsicologo, ...updates };
    document.getElementById('perfilCRP').textContent = `CRP: ${currentPsicologo.crp}`;
    
    showToast('Informações profissionais atualizadas com sucesso!', 'success');
  } catch (error) {
    console.error('Erro ao atualizar:', error);
    showToast('Erro ao atualizar informações profissionais', 'error');
  } finally {
    btnText.style.display = 'inline';
    btnSpinner.style.display = 'none';
    btn.disabled = false;
  }
}

async function handleChangePassword(e) {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  const btnText = btn.querySelector('.btn-text');
  const btnSpinner = btn.querySelector('.btn-spinner');
  
  const novaSenha = document.getElementById('novaSenha').value;
  const confirmarSenha = document.getElementById('confirmarSenha').value;
  
  if (novaSenha !== confirmarSenha) {
    showToast('As senhas não coincidem', 'error');
    return;
  }
  
  if (novaSenha.length < 6) {
    showToast('A senha deve ter no mínimo 6 caracteres', 'error');
    return;
  }
  
  btnText.style.display = 'none';
  btnSpinner.style.display = 'inline-block';
  btn.disabled = true;
  
  try {
    const { error } = await window.supabaseClient.auth.updateUser({
      password: novaSenha
    });
    
    if (error) throw error;
    
    showToast('Senha alterada com sucesso!', 'success');
    e.target.reset();
  } catch (error) {
    console.error('Erro ao alterar senha:', error);
    showToast('Erro ao alterar senha: ' + error.message, 'error');
  } finally {
    btnText.style.display = 'inline';
    btnSpinner.style.display = 'none';
    btn.disabled = false;
  }
}

function setupEventListeners() {
  // Tabs
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      
      btn.classList.add('active');
      document.getElementById(`tab-${tab}`).classList.add('active');
    });
  });
  
  // Forms
  document.getElementById('formDadosPessoais').addEventListener('submit', handleSaveDadosPessoais);
  document.getElementById('formProfissional').addEventListener('submit', handleSaveProfissional);
  document.getElementById('formSenha').addEventListener('submit', handleChangePassword);
  
  // Avatar change
  document.getElementById('btnChangeAvatar').addEventListener('click', () => {
    showToast('Funcionalidade de upload de foto será implementada em breve', 'info');
  });
  
  // Revoke sessions
  document.getElementById('btnRevokeAllSessions').addEventListener('click', async () => {
    if (confirm('Deseja realmente desconectar de todos os dispositivos? Você precisará fazer login novamente.')) {
      await window.supabaseClient.auth.signOut();
      window.location.href = '../index.html';
    }
  });
  
  // Logout
  document.getElementById('logoutBtn').addEventListener('click', async () => {
    await window.supabaseClient.auth.signOut();
    window.location.href = '../index.html';
  });
}
