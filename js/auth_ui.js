// js/auth_ui.js
import { handleRegister, handleLogin } from './auth.js';

// --- Elementos DOM ---
// Usamos validação posterior para não quebrar em páginas onde eles não existem
const authTitle = document.getElementById('authTitle');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const authMessage = document.getElementById('authMessage');

// --- Funções Globais (Úteis para cadastro.js e outros) ---

window.updateAuthStatus = function (message, type = '') {
    // Se não houver elemento de mensagem na página, retorna sem erro
    const msgElement = document.getElementById('authMessage') || document.getElementById('statusMessage');

    if (!msgElement) return;

    msgElement.textContent = message;

    // Reseta as classes mantendo a base 'status-message'
    msgElement.className = 'status-message';

    // Adiciona classe específica se houver tipo
    if (type === 'error') msgElement.classList.add('status-error');
    else if (type === 'success') msgElement.classList.add('status-success');
    else if (type === 'info') msgElement.classList.add('status-info');

    // CORREÇÃO: Garante que ela fique visível mesmo sem tipo específico
    // O CSS base .status-message agora cuida da borda padrão.
    msgElement.style.display = 'block';
}

window.showRegister = function (event) {
    if (event) event.preventDefault();
    if (!authTitle || !loginForm || !registerForm) return;

    authTitle.textContent = '📝 Novo Cadastro';
    loginForm.style.display = 'none';
    registerForm.style.display = 'block';
    window.updateAuthStatus('Preencha seus dados para se cadastrar.', 'info');
}

window.showLogin = function (event) {
    if (event) event.preventDefault();
    if (!authTitle || !loginForm || !registerForm) return;

    authTitle.textContent = '🔒 Login de Usuário';
    loginForm.style.display = 'block';
    registerForm.style.display = 'none';
    window.updateAuthStatus('Digite seu email e senha para entrar.', 'info');
}

// --- Inicialização ---
document.addEventListener('DOMContentLoaded', () => {

    // Tenta inicializar a tela de login APENAS se os formulários existirem
    if (loginForm && registerForm) {
        window.showLogin();

        // Listener de Registro
        registerForm.addEventListener('submit', function(event) {
            // Se o formulário tiver validação nativa OK, chame a lógica JS
            // Note que handleRegister já está esperando o event e deve usar event.preventDefault()
            handleRegister(event);
        });
        
        // Listener de Login
        loginForm.addEventListener('submit', function(event) {
            // Se o formulário tiver validação nativa OK, chame a lógica JS
            // Note que handleLogin já está esperando o event e deve usar event.preventDefault()
            handleLogin(event);
        });

        // Listeners de Login/Registro
        // const registerButton = registerForm.querySelector('button');
        // if (registerButton) {
        //     registerButton.addEventListener('click', handleRegister);
        // }

        // const loginButton = loginForm.querySelector('button');
        // if (loginButton) {
        //     loginButton.addEventListener('click', handleLogin);
        // }
    }
});