// ================================
// UTILITÁRIOS E HELPERS
// ================================

// Formatar CPF
function formatCPF(cpf) {
  if (!cpf) return '';
  cpf = cpf.replace(/\D/g, '');
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

// Formatar telefone
function formatPhone(phone) {
  if (!phone) return '';
  phone = phone.replace(/\D/g, '');
  if (phone.length === 11) {
    return phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  } else if (phone.length === 10) {
    return phone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  return phone;
}

// Formatar CRP
function formatCRP(crp) {
  if (!crp) return '';
  crp = crp.replace(/\D/g, '');
  return crp.replace(/(\d{2})(\d{5})/, '$1/$2');
}

// Formatar data
function formatDate(date) {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('pt-BR');
}

// Formatar data e hora
function formatDateTime(date) {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleString('pt-BR');
}

// Formatar moeda BRL
function formatCurrency(value) {
  if (!value) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

// Calcular idade
function calculateAge(birthDate) {
  if (!birthDate) return 0;
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

// Validar CPF
function validateCPF(cpf) {
  cpf = cpf.replace(/\D/g, '');
  if (cpf.length !== 11) return false;
  
  // Verificar se todos os dígitos são iguais
  if (/^(\d)\1+$/.test(cpf)) return false;
  
  // Validar dígitos verificadores
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let digit = 11 - (sum % 11);
  if (digit > 9) digit = 0;
  if (digit !== parseInt(cpf.charAt(9))) return false;
  
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf.charAt(i)) * (11 - i);
  }
  digit = 11 - (sum % 11);
  if (digit > 9) digit = 0;
  if (digit !== parseInt(cpf.charAt(10))) return false;
  
  return true;
}

// Validar email
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// Mostrar toast/notificação
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  
  // Estilos inline para o toast
  Object.assign(toast.style, {
    position: 'fixed',
    top: '20px',
    right: '20px',
    padding: '1rem 1.5rem',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    zIndex: '9999',
    animation: 'slideInRight 0.3s ease',
    minWidth: '250px',
    maxWidth: '400px'
  });
  
  // Cores baseadas no tipo
  const colors = {
    success: { bg: '#d1fae5', color: '#065f46', border: '#10b981' },
    error: { bg: '#fee2e2', color: '#991b1b', border: '#ef4444' },
    warning: { bg: '#fef3c7', color: '#92400e', border: '#f59e0b' },
    info: { bg: '#dbeafe', color: '#1e40af', border: '#3b82f6' }
  };
  
  const style = colors[type] || colors.info;
  toast.style.backgroundColor = style.bg;
  toast.style.color = style.color;
  toast.style.borderLeft = `4px solid ${style.border}`;
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'slideOutRight 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Mostrar loading
function showLoading(element, text = 'Carregando...') {
  const spinner = element.querySelector('.spinner');
  const span = element.querySelector('span');
  
  if (spinner) spinner.style.display = 'block';
  if (span) span.textContent = text;
  element.disabled = true;
}

// Esconder loading
function hideLoading(element, text = 'Salvar') {
  const spinner = element.querySelector('.spinner');
  const span = element.querySelector('span');
  
  if (spinner) spinner.style.display = 'none';
  if (span) span.textContent = text;
  element.disabled = false;
}

// Confirmar ação
function confirmAction(message) {
  return confirm(message);
}

// Debounce para otimizar eventos
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Obter iniciais do nome
function getInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

// Verificar se é menor de idade
function isMinor(birthDate) {
  return calculateAge(birthDate) < 18;
}

// Formatar tempo relativo (ex: "há 2 horas")
function timeAgo(date) {
  if (!date) return '';
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + ' anos atrás';
  
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + ' meses atrás';
  
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + ' dias atrás';
  
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + ' horas atrás';
  
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + ' minutos atrás';
  
  return 'agora mesmo';
}

// Sanitizar input (prevenir XSS)
function sanitizeInput(input) {
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
}

// Gerar cor aleatória para avatar
function generateAvatarColor(name) {
  const colors = [
    '#6366f1', '#8b5cf6', '#ec4899', '#f59e0b',
    '#10b981', '#3b82f6', '#14b8a6', '#f97316'
  ];
  const index = name.length % colors.length;
  return colors[index];
}

// Exportar para CSV
function exportToCSV(data, filename) {
  if (!data || !data.length) {
    showToast('Nenhum dado para exportar', 'warning');
    return;
  }
  
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(header => JSON.stringify(row[header] || '')).join(','))
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  
  showToast('Arquivo exportado com sucesso!', 'success');
}

// Verificar se está online
function isOnline() {
  return navigator.onLine;
}

// Storage helpers
const storage = {
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error('Erro ao salvar no localStorage:', e);
      return false;
    }
  },
  get: (key) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (e) {
      console.error('Erro ao ler do localStorage:', e);
      return null;
    }
  },
  remove: (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (e) {
      console.error('Erro ao remover do localStorage:', e);
      return false;
    }
  },
  clear: () => {
    try {
      localStorage.clear();
      return true;
    } catch (e) {
      console.error('Erro ao limpar localStorage:', e);
      return false;
    }
  }
};

// Aplicar máscara em tempo real
function applyMask(input, maskType) {
  input.addEventListener('input', (e) => {
    let value = e.target.value.replace(/\D/g, '');
    
    switch (maskType) {
      case 'cpf':
        if (value.length <= 11) {
          value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
        }
        break;
      case 'phone':
        if (value.length <= 11) {
          value = value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
        }
        break;
      case 'crp':
        if (value.length <= 7) {
          value = value.replace(/(\d{2})(\d{5})/, '$1/$2');
        }
        break;
      case 'cep':
        if (value.length <= 8) {
          value = value.replace(/(\d{5})(\d{3})/, '$1-$2');
        }
        break;
    }
    
    e.target.value = value;
  });
}
