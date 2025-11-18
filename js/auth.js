// --- URLs dos Webhooks (Defina estes no n8n) ---
const N8N_LOGIN_WEBHOOK = 'https://n8n.ferlp.top/webhook/seu_login_id';
const N8N_REGISTER_WEBHOOK = 'https://n8n.ferlp.top/webhook/seu_registro_id';

// --- Elementos DOM ---
const authTitle = document.getElementById('authTitle');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const authMessage = document.getElementById('authMessage');


// --- Funções de Controle de UI ---

// CORRIGIDO: Aceita 'type' como segundo parâmetro (ex: 'error', 'success', 'info')
function updateAuthStatus(message, type = '') {
    authMessage.textContent = message;

    // Zera TODOS os estilos e classes de cor
    authMessage.style.backgroundColor = '';
    authMessage.style.borderColor = '';
    authMessage.style.color = '';
    authMessage.className = 'status-message'; // Volta para a classe base

    if (type === 'error') {
        // Usa classe para erro, deixando o CSS definir todas as cores
        authMessage.classList.add('status-error');
        // Removido: authMessage.style.backgroundColor = '#fdd';
        // Removido: authMessage.style.borderColor = '#f00';
    } else if (type === 'success') {
        // Usa classe para sucesso
        authMessage.classList.add('status-success');
    } else if (type === 'info') {
        // NOVO: Usa classe para info (corrigindo o problema do inline style)
        authMessage.classList.add('status-info');
    }
}

function showRegister() {
    authTitle.textContent = '📝 Novo Cadastro';
    loginForm.style.display = 'none';
    registerForm.style.display = 'block';

    // CORRIGIDO: Usando o tipo 'info'
    updateAuthStatus('Preencha seus dados para se cadastrar.', 'info');
}

function showLogin() {
    authTitle.textContent = '🔒 Login de Usuário';
    loginForm.style.display = 'block';
    registerForm.style.display = 'none';

    // CORRIGIDO: Usando o tipo 'info'
    updateAuthStatus('Digite seu email e senha para entrar.', 'info');
}

// REMOVIDA: A função updateNeutralStatus foi incorporada à lógica de updateAuthStatus.

// --- Funções de Submissão ---

async function handleRegister() {
    const data = {
        name: document.getElementById('regName').value,
        surname: document.getElementById('regSurname').value,
        email: document.getElementById('regEmail').value,
        password: document.getElementById('regPassword').value,
        cpf: document.getElementById('regCpf').value,
        // Outros dados fiscais (se necessário)
    };

    // Verificação básica
    if (!data.email || !data.password || !data.name) {
        // CORRIGIDO: Usando o tipo 'error'
        updateAuthStatus('Preencha todos os campos obrigatórios!', 'error');
        return;
    }

    // Usando status neutro (sem tipo) para indicar processamento
    updateAuthStatus('Enviando dados de cadastro...');

    try {
        const response = await fetch(N8N_REGISTER_WEBHOOK, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (response.ok) {
            // CORRIGIDO: Usando o tipo 'success'
            updateAuthStatus('Cadastro realizado com sucesso! Faça seu login.', 'success');
            showLogin(); // Redireciona para login após sucesso
        } else {
            // CORRIGIDO: Usando o tipo 'error'
            updateAuthStatus(`Falha no cadastro: ${result.message || 'Erro desconhecido.'}`, 'error');
        }
    } catch (error) {
        // CORRIGIDO: Usando o tipo 'error'
        updateAuthStatus(`Erro de comunicação com o servidor: ${error.message}`, 'error');
    }
}


async function handleLogin() {
    const data = {
        email: document.getElementById('loginEmail').value,
        password: document.getElementById('loginPassword').value,
    };

    if (!data.email || !data.password) {
        // CORRIGIDO: Usando o tipo 'error'
        updateAuthStatus('Preencha email e senha!', 'error');
        return;
    }

    updateAuthStatus('Tentando autenticação...');

    try {
        const response = await fetch(N8N_LOGIN_WEBHOOK, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            const result = await response.json();

            // O n8n deve retornar o API Token aqui!
            const apiToken = result.api_token;

            localStorage.setItem('userToken', apiToken);
            // CORRIGIDO: Usando o tipo 'success'
            updateAuthStatus('Login efetuado! Redirecionando...', 'success');

            window.location.href = 'dashboard.html';

        } else if (response.status === 401) {
            // CORRIGIDO: Usando o tipo 'error'
            updateAuthStatus('Email ou senha inválidos.', 'error');
        } else {
            // CORRIGIDO: Usando o tipo 'error'
            updateAuthStatus(`Erro no login: ${response.statusText}`, 'error');
        }
    } catch (error) {
        // CORRIGIDO: Usando o tipo 'error'
        updateAuthStatus(`Erro de rede: ${error.message}`, 'error');
    }
}

// Inicializa a tela como Login
showLogin();


// --- Lógica do Modo Escuro ---

const toggleButton = document.getElementById('darkModeToggle');

function enableDarkMode() {
    document.body.classList.add('dark-mode');
    localStorage.setItem('darkMode', 'enabled');
    toggleButton.textContent = 'Desativar Modo Escuro';
}

function disableDarkMode() {
    document.body.classList.remove('dark-mode');
    localStorage.setItem('darkMode', 'disabled');
    toggleButton.textContent = 'Ativar Modo Escuro';
}

function setupDarkModeToggle() {
    // 1. Carrega a preferência salva ao iniciar
    if (localStorage.getItem('darkMode') === 'enabled') {
        enableDarkMode();
    } else {
        disableDarkMode(); // Garante o texto correto do botão
    }

    // 2. Define o evento de clique
    toggleButton.addEventListener('click', () => {
        if (document.body.classList.contains('dark-mode')) {
            disableDarkMode();
        } else {
            enableDarkMode();
        }
    });
}

// Chame esta função no final do seu auth.js (após showLogin())
setupDarkModeToggle();