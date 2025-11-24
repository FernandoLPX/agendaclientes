// js/auth.js - Lógica Pura de Autenticação

// --- URLs dos Webhooks ---
const N8N_LOGIN_WEBHOOK = 'https://n8n.ferlp.top/webhook/0c5490a9-f457-40ee-9a6f-84f8d76e225e';
const N8N_REGISTER_WEBHOOK = 'https://n8n.ferlp.top/webhook/1eeb26b4-1de9-42b7-8ffb-6791378144bf';

// As funções de UI (updateAuthStatus, showLogin) são agora importadas
// (Ou assumidas como globais se não usar type="module")

// --- Funções de Submissão ---

// Expõe a função para ser usada no auth_ui.js
export async function handleRegister(event) {
    // ... (O corpo da função handleRegister permanece inalterado, exceto pela remoção do console.log no final) ...

    if (event) event.preventDefault();
    // Coleta dados
    const data = {
        name: document.getElementById('regName').value,
        surname: document.getElementById('regSurname').value,
        email: document.getElementById('regEmail').value,
        cpf: document.getElementById('regCpf').value,
        password: document.getElementById('regPassword').value,
        // Outros dados fiscais (se necessário)
    };

    // Verificação básica
    if (!data.email || !data.password || !data.name || !data.surname || !data.cpf) {
        // CORRIGIDO: Usando o tipo 'error'
        updateAuthStatus('Preencha todos os campos obrigatórios!', 'error');
        return;
    }

    // Assumindo que updateAuthStatus e showLogin estão disponíveis globalmente ou importados
    const updateAuthStatus = window.updateAuthStatus || console.log;
    const showLogin = window.showLogin || function () { };

    updateAuthStatus('Enviando dados de cadastro...');

    try {
        const response = await fetch(N8N_REGISTER_WEBHOOK, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const isJson = response.headers.get('content-type')?.includes('application/json');
        const result = isJson ? await response.json() : { message: response.statusText };

        if (response.ok) {
            updateAuthStatus('Cadastro realizado com sucesso! Faça seu login.', 'success');
            showLogin();
        } else if (response.status === 409) {
            const errorMessage = result.message || 'Email já existe.';
            updateAuthStatus(`Falha no cadastro: ${errorMessage}`, 'error');
        } else {
            const errorMessage = result.message || result.statusText || 'Erro desconhecido.';
            updateAuthStatus(`Falha no cadastro: ${errorMessage}`, 'error');
        }
    } catch (error) {
        updateAuthStatus(`Erro de comunicação com o servidor: ${error.message}. Verifique o CORS ou URL.`, 'error');
    }
}


export async function handleLogin(event) {
    if (event) event.preventDefault();

    const data = {
        email: document.getElementById('loginEmail').value.trim(),
        password: document.getElementById('loginPassword').value,
    };

    if (!data.email || !data.password) {
        updateAuthStatus('Preencha email e senha!', 'error');
        return;
    }

    const updateAuthStatus = window.updateAuthStatus || console.log;
    updateAuthStatus('Tentando autenticação...');

    try {
        const response = await fetch(N8N_LOGIN_WEBHOOK, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        let result = {};
        const contentType = response.headers.get("content-type");
        const isJson = contentType && contentType.includes("application/json");

        // 1. LEITURA ÚNICA E CONDICIONAL DO CORPO
        if (isJson) {
            result = await response.json();
        }

        // 2. TRATAMENTO DE SUCESSO HTTP
        if (response.ok) {

            // 🚨 Correção: Acessa o primeiro item do array de resposta do n8n (result[0])
            const dataItem = result[0];

            if (!dataItem) {
                updateAuthStatus('Login efetuado, mas o servidor não retornou dados de acesso.', 'error');
                return;
            }

            const apiToken = dataItem.api_token;

            // Montagem dos dados do usuário
            const userData = {
                api_token: apiToken,
                is_admin: dataItem.is_admin === true,
                is_complete: dataItem.is_complete === true,
                name: dataItem.name || 'Cliente',
                client_id: dataItem.client_id || null
            };

            if (apiToken) {
                localStorage.setItem('userToken', apiToken);
                localStorage.setItem('userData', JSON.stringify(userData));
                updateAuthStatus('Login efetuado! Redirecionando...', 'success');

                // 3. REDIRECIONAMENTO E SAÍDA IMEDIATA (Impede que caia no catch)
                window.location.href = 'dashboard.html';
                return;
            } else {
                updateAuthStatus('Login efetuado, mas o servidor não retornou o token.', 'error');
                return;
            }

        } else {
            // 4. TRATAMENTO DE ERRO (401, 404, 500)
            let errorMessage;
            if (isJson) {
                // Se era JSON, use a mensagem de erro do n8n
                errorMessage = result.message || response.statusText;
            } else {
                // Se não era JSON, use o status HTTP
                errorMessage = response.statusText || `Erro no servidor: Status ${response.status}`;
            }

            if (response.status === 401 || response.status === 404) {
                updateAuthStatus('Email ou senha inválidos.', 'error');
            } else {
                updateAuthStatus(`Falha no login: ${errorMessage}`, 'error');
            }
        }

    } catch (error) {
        // 5. ERRO DE CONEXÃO REAL (CORS, URL, Timeout, etc.)
        updateAuthStatus(`Falha na comunicação: Verifique o CORS, a URL ou a sua conexão.`, 'error');
        console.error("Erro fatal no fetch:", error);
    }
}