// ================================
// SISTEMA DE AUTENTICAÇÃO - LOGIN
// ================================

document.addEventListener('DOMContentLoaded', () => {
  // Verificar se já está logado
  checkAuth();
  
  // Elementos do DOM
  const loginForm = document.getElementById('loginForm');
  const registerButton = document.getElementById('registerButton');
  const forgotPasswordLink = document.getElementById('forgotPasswordLink');
  const forgotPasswordModal = document.getElementById('forgotPasswordModal');
  const registerModal = document.getElementById('registerModal');
  const closeModal = document.getElementById('closeModal');
  const closeRegisterModal = document.getElementById('closeRegisterModal');
  const forgotPasswordForm = document.getElementById('forgotPasswordForm');
  const registerForm = document.getElementById('registerForm');
  
  // Login
  loginForm.addEventListener('submit', handleLogin);
  
  // Abrir modais
  registerButton.addEventListener('click', () => {
    registerModal.style.display = 'flex';
  });
  
  forgotPasswordLink.addEventListener('click', (e) => {
    e.preventDefault();
    forgotPasswordModal.style.display = 'flex';
  });
  
  // Fechar modais
  closeModal.addEventListener('click', () => {
    forgotPasswordModal.style.display = 'none';
  });
  
  closeRegisterModal.addEventListener('click', () => {
    registerModal.style.display = 'none';
  });
  
  // Fechar modal ao clicar fora
  window.addEventListener('click', (e) => {
    if (e.target === forgotPasswordModal) {
      forgotPasswordModal.style.display = 'none';
    }
    if (e.target === registerModal) {
      registerModal.style.display = 'none';
    }
  });
  
  // Recuperação de senha
  forgotPasswordForm.addEventListener('submit', handleForgotPassword);
  
  // Registro
  registerForm.addEventListener('submit', handleRegister);
  
  // Aplicar máscaras
  const crpInput = document.getElementById('regCRP');
  if (crpInput) {
    applyMask(crpInput, 'crp');
  }
});

// Verificar se usuário já está autenticado
async function checkAuth() {
  try {
    const { data: { session } } = await window.supabaseClient.auth.getSession();
    
    if (session) {
      // Usuário já está logado, redirecionar para o dashboard
      window.location.href = 'dashboard.html';
    }
  } catch (error) {
    console.error('Erro ao verificar autenticação:', error);
  }
}

// Handler de Login
async function handleLogin(e) {
  e.preventDefault();
  
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const rememberMe = document.getElementById('rememberMe').checked;
  const loginButton = document.getElementById('loginButton');
  
  // Validações básicas
  if (!validateEmail(email)) {
    showMessage('Por favor, insira um e-mail válido', 'error');
    return;
  }
  
  if (password.length < 6) {
    showMessage('A senha deve ter no mínimo 6 caracteres', 'error');
    return;
  }
  
  // Mostrar loading
  showLoading(loginButton, 'Entrando...');
  
  try {
    // Tentar fazer login
    const { data, error } = await window.supabaseClient.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    
    // Salvar preferência de "lembrar"
    if (rememberMe) {
      storage.set('rememberMe', true);
    }
    
    // Buscar dados do psicólogo
    const { data: psicologo, error: psicologoError } = await window.supabaseClient
      .from('psicologos')
      .select('*')
      .eq('user_id', data.user.id)
      .single();
    
    if (psicologoError) {
      console.error('Erro ao buscar dados do psicólogo:', psicologoError);
    }
    
    // Salvar dados no localStorage
    if (psicologo) {
      storage.set('currentPsicologo', psicologo);
    }
    
    showMessage('Login realizado com sucesso!', 'success');
    
    // Redirecionar para o dashboard
    setTimeout(() => {
      window.location.href = 'dashboard.html';
    }, 1000);
    
  } catch (error) {
    console.error('Erro no login:', error);
    hideLoading(loginButton, 'Entrar');
    
    let errorMessage = 'Erro ao fazer login. Tente novamente.';
    
    if (error.message.includes('Invalid login credentials')) {
      errorMessage = 'E-mail ou senha incorretos';
    } else if (error.message.includes('Email not confirmed')) {
      errorMessage = 'Por favor, confirme seu e-mail antes de fazer login';
    }
    
    showMessage(errorMessage, 'error');
  }
}

// Handler de Recuperação de Senha
async function handleForgotPassword(e) {
  e.preventDefault();
  
  const email = document.getElementById('resetEmail').value.trim();
  
  if (!validateEmail(email)) {
    showToast('Por favor, insira um e-mail válido', 'error');
    return;
  }
  
  try {
    const { error } = await window.supabaseClient.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password.html`
    });
    
    if (error) throw error;
    
    showToast('Link de recuperação enviado para seu e-mail!', 'success');
    document.getElementById('forgotPasswordModal').style.display = 'none';
    document.getElementById('forgotPasswordForm').reset();
    
  } catch (error) {
    console.error('Erro ao recuperar senha:', error);
    showToast('Erro ao enviar link de recuperação', 'error');
  }
}

// Handler de Registro
async function handleRegister(e) {
  e.preventDefault();
  
  const name = document.getElementById('regName').value.trim();
  const crp = document.getElementById('regCRP').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const password = document.getElementById('regPassword').value;
  const passwordConfirm = document.getElementById('regPasswordConfirm').value;
  const acceptTerms = document.getElementById('acceptTerms').checked;
  const submitBtn = document.getElementById('registerSubmitBtn');
  const btnText = submitBtn.querySelector('.btn-text');
  const btnLoading = submitBtn.querySelector('.btn-loading');
  
  // Validações
  if (!name || !crp || !email || !password) {
    showToast('Por favor, preencha todos os campos obrigatórios', 'error');
    return;
  }
  
  if (!validateEmail(email)) {
    showToast('Por favor, insira um e-mail válido', 'error');
    return;
  }
  
  if (password.length < 8) {
    showToast('A senha deve ter no mínimo 8 caracteres', 'error');
    return;
  }
  
  if (password !== passwordConfirm) {
    showToast('As senhas não coincidem', 'error');
    return;
  }
  
  if (!acceptTerms) {
    showToast('Você deve aceitar os termos de uso', 'error');
    return;
  }
  
  // Mostrar loading
  submitBtn.disabled = true;
  btnText.style.display = 'none';
  btnLoading.style.display = 'inline-flex';
  
  try {
    // Criar usuário no Supabase Auth
    const { data: authData, error: authError } = await window.supabaseClient.auth.signUp({
      email,
      password,
      options: {
        data: {
          nome: name
        },
        emailRedirectTo: window.location.origin
      }
    });
    
    if (authError) throw authError;
    
    if (!authData || !authData.user) {
      throw new Error('Falha ao criar usuário');
    }
    
    // Aguardar um momento para garantir que a sessão está estabelecida
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Criar registro na tabela psicologos usando RPC function
    const { data: psicologoData, error: psicologoError } = await window.supabaseClient
      .rpc('registrar_psicologo', {
        p_user_id: authData.user.id,
        p_nome: name,
        p_crp: crp.replace(/\D/g, ''),
        p_email: email
      });
    
    if (psicologoError) {
      console.error('Erro ao criar psicólogo:', psicologoError);
      // Se a função RPC não existir, tenta INSERT direto
      const { error: insertError } = await window.supabaseClient
        .from('psicologos')
        .insert([{
          user_id: authData.user.id,
          nome: name,
          crp: crp.replace(/\D/g, ''),
          email: email,
          status: 'ativo'
        }]);
      
      if (insertError) throw insertError;
    }
    
    showToast('Conta criada com sucesso! Verifique seu e-mail para confirmar.', 'success');
    document.getElementById('registerModal').style.display = 'none';
    document.getElementById('registerForm').reset();
    
  } catch (error) {
    // Esconder loading em caso de erro
    submitBtn.disabled = false;
    btnText.style.display = 'inline';
    btnLoading.style.display = 'none';
    console.error('Erro no registro:', error);
    
    let errorMessage = 'Erro ao criar conta. Tente novamente.';
    
    if (error.message.includes('already registered')) {
      errorMessage = 'Este e-mail já está cadastrado';
    } else if (error.message.includes('duplicate key value violates unique constraint')) {
      errorMessage = 'Este CRP já está cadastrado';
    }
    
    showToast(errorMessage, 'error');
  } finally {
    // Garantir que o loading seja removido
    submitBtn.disabled = false;
    btnText.style.display = 'inline';
    btnLoading.style.display = 'none';
  }
}

// Mostrar mensagem de feedback
function showMessage(message, type) {
  const messageDiv = document.getElementById('authMessage');
  messageDiv.textContent = message;
  messageDiv.className = `auth-message ${type}`;
  messageDiv.style.display = 'block';
  
  setTimeout(() => {
    messageDiv.style.display = 'none';
  }, 5000);
}

// Controle de inatividade (logout automático após 30 minutos)
let inactivityTimer;

function resetInactivityTimer() {
  clearTimeout(inactivityTimer);
  inactivityTimer = setTimeout(async () => {
    await window.supabaseClient.auth.signOut();
    window.location.href = 'index.html';
    showToast('Sessão encerrada por inatividade', 'info');
  }, 30 * 60 * 1000); // 30 minutos
}

// Eventos de atividade do usuário
['mousedown', 'keydown', 'scroll', 'touchstart'].forEach(event => {
  document.addEventListener(event, resetInactivityTimer, true);
});

// Iniciar timer de inatividade
resetInactivityTimer();
