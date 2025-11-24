// js/cadastro.js

// --- URL do Webhook (Crie um novo no N8N para UPDATE) ---
const N8N_UPDATE_PROFILE_WEBHOOK = 'https://n8n.ferlp.top/webhook/SEU_NOVO_WEBHOOK_ID';

document.addEventListener('DOMContentLoaded', () => {
    const userToken = localStorage.getItem('userToken');
    if (!userToken) {
        window.location.href = 'index.html';
        return;
    }

    const updateAuthStatus = window.updateAuthStatus || function (msg, type) { console.log(msg); };

    // Tenta preencher Nome/Email se já estiverem no localStorage
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    if (userData.name) document.getElementById('name').value = userData.name;
    // Se tiver sobrenome salvo, preencher também (se disponível no userData)

    const form = document.getElementById('completeRegistrationForm');
    form.addEventListener('submit', handleCompleteRegistration);
});


async function handleCompleteRegistration(event) {
    event.preventDefault();

    const updateAuthStatus = window.updateAuthStatus || function () { };
    updateAuthStatus('Enviando dados...', 'info');

    // --- 1. COLETA DE DADOS ---
    const formData = {
        name: document.getElementById('name').value.trim(),
        surname: document.getElementById('surname').value.trim(),
        cpf: document.getElementById('cpf').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        birthDate: document.getElementById('birthDate').value,

        // Endereço Quebrado
        cep: document.getElementById('cep').value.trim(),
        uf: document.getElementById('uf').value.trim().toUpperCase(),
        city: document.getElementById('city').value.trim(),
        street: document.getElementById('street').value.trim(),
        number: document.getElementById('number').value.trim(),
        neighborhood: document.getElementById('neighborhood').value.trim(),
        complement: document.getElementById('complement').value.trim()
    };

    // Validação Básica
    if (!formData.name || !formData.surname || !formData.cpf || !formData.phone || !formData.city || !formData.street || !formData.number) {
        updateAuthStatus('Preencha todos os campos obrigatórios.', 'error');
        return;
    }

    const userToken = localStorage.getItem('userToken');
    const userData = JSON.parse(localStorage.getItem('userData'));

    // --- 2. PREPARA PAYLOAD ---
    const payload = {
        client_id: userData.client_id,
        api_token: userToken,
        ...formData // Espalha todos os dados do form aqui
    };

    try {
        const response = await fetch(N8N_UPDATE_PROFILE_WEBHOOK, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        let result = {};
        try { result = await response.json(); } catch (e) { }

        if (response.ok) {
            // Atualiza flag local para liberar acesso imediato sem relogar
            userData.is_complete = true;
            // Atualiza nome caso tenha mudado
            userData.name = formData.name;

            localStorage.setItem('userData', JSON.stringify(userData));

            updateAuthStatus('Cadastro atualizado! Redirecionando...', 'success');
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);

        } else {
            const errorMessage = result.message || 'Erro ao salvar dados no servidor.';
            updateAuthStatus(`Falha: ${errorMessage}`, 'error');
        }

    } catch (error) {
        updateAuthStatus('Falha de comunicação com o servidor.', 'error');
        console.error(error);
    }
}