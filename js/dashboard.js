// js/dashboard.js

document.addEventListener('DOMContentLoaded', () => {
    const userToken = localStorage.getItem('userToken');
    const userData = JSON.parse(localStorage.getItem('userData'));

    if (!userToken || !userData) {
        window.location.href = 'index.html';
        return;
    }

    // --- 1. Lógica de ADMIN ---
    if (userData.is_admin) {
        document.getElementById('welcomeTitle').textContent = `Bem-vindo, ${userData.name} (Admin)!`;
        const adminLink = document.getElementById('adminPanelLink');
        if (adminLink) adminLink.style.display = 'block';
    } else {
        document.getElementById('welcomeTitle').textContent = `Bem-vindo(a), ${userData.name || 'Cliente'}!`;
    }

    // --- 2. Lógica de Cadastro Incompleto (Soft Gate) ---
    const servicesContainer = document.getElementById('servicesContainer');
    const incompleteMessage = document.getElementById('incompleteCadastroMessage');
    const accessBotButton = document.getElementById('accessBotButton');

    // Se não for completo E não for admin (admin ignora isso no backend, mas o front deve refletir)
    if (userData.is_complete === false) {
        if (incompleteMessage) incompleteMessage.style.display = 'block';
        if (servicesContainer) servicesContainer.classList.add('disabled-access');

        if (accessBotButton) {
            accessBotButton.textContent = '🔒 Cadastro Incompleto';
            accessBotButton.disabled = true;
        }
    } else {
        if (incompleteMessage) incompleteMessage.style.display = 'none';
        if (servicesContainer) servicesContainer.classList.remove('disabled-access');

        // Verifica plano
        checkServiceStatus('bot');
    }
});

// --- FUNÇÕES GLOBAIS (Para onclick no HTML) ---

// Função chamada ao clicar em "Verificar Acesso..."
window.checkAndRedirect = function (targetUrl) {
    const botButton = document.getElementById('accessBotButton');

    if (botButton.dataset.status === 'granted') {
        window.location.href = targetUrl;
    } else if (botButton.dataset.status === 'unavailable') {
        alert('Este serviço não está incluído no seu plano atual.');
    }
}

// Simulação de verificação
async function checkServiceStatus(serviceId) {
    const botButton = document.getElementById('accessBotButton');
    const botStatus = document.getElementById('botStatus');

    if (!botButton) return;

    botButton.textContent = 'Verificando...';
    botButton.disabled = true;
    if (botStatus) botStatus.textContent = 'Conectando ao servidor...';

    // Simulação: Acesso permitido
    const accessGranted = true;

    if (accessGranted) {
        botButton.textContent = 'ACESSAR BOT';
        botButton.style.backgroundColor = 'var(--success-bg)'; // Usa variável CSS
        botButton.style.color = 'var(--success-text)';
        botButton.style.border = '1px solid var(--success-border)';
        botButton.disabled = false;
        botButton.dataset.status = 'granted';
        if (botStatus) botStatus.textContent = 'Acesso liberado.';
    } else {
        botButton.textContent = 'FAZER UPGRADE';
        botButton.dataset.status = 'unavailable';
        botButton.disabled = false;
    }
}