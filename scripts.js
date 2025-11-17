// Substitua esta URL pela URL do Webhook do seu N8N
const N8N_WEBHOOK_URL = 'https://n8n.ferlp.top/webhook-test/11929e27-e8e5-444b-9fb4-8a87bad68a74';
const N8N_STATUS_URL = 'https://n8n.ferlp.top/webhook-test/5d9aaa3c-097c-44c0-8a4d-a258b81ff363';


async function fetchBotStatus() {
    const clientToken = clientTokenInput.value;
    if (!clientToken) return;

    // Constrói a URL de consulta
    const url = `${N8N_STATUS_URL}?client_id=${clientToken}`;

    try {
        const response = await fetch(url);
        const result = await response.json();

        if (response.ok && result.status === 'success') {
            const currentStatus = result.bot_status;

            // Chama a função para atualizar a UI
            updateToggleButton(currentStatus);
        } else {
            // Trata erro de leitura
            updateStatus('Erro ao ler status do bot.', true);
        }
    } catch (error) {
        // Trata erro de conexão
        updateStatus(`Erro de rede ao buscar status: ${error.message}`, true);
    }
}

// Nova função para atualizar o botão e UI
function updateToggleButton(currentStatus) {
    const newState = currentStatus === 'ON' ? 'OFF' : 'ON'; // Define o estado do PRÓXIMO clique

    toggleButton.textContent = `${newState} BOT`;
    toggleButton.style.backgroundColor = currentStatus === 'ON' ? 'red' : 'green';

    // Configura o próximo clique para o estado oposto ao atual
    toggleButton.onclick = () => toggleBot(currentStatus);

    // Mensagem inicial de status
    document.getElementById('statusMessage').textContent = `🤖 Status Atual: ${currentStatus}`;
}

const statusMessage = document.getElementById('statusMessage');
const toggleButton = document.getElementById('toggleButton');

function updateStatus(message, isError = false) {
    statusMessage.textContent = message;
    statusMessage.style.backgroundColor = isError ? '#fdd' : '#dfd';
    statusMessage.style.borderColor = isError ? '#f00' : '#0f0';
}

async function sendConfiguration() {
    const clientToken = document.getElementById('clientToken').value;
    const newSchedule = document.getElementById('newSchedule').value;

    if (!clientToken || !newSchedule) {
        updateStatus('Preencha todos os campos!', true);
        return;
    }

    const payload = {
        action: 'SAVE_CONFIG',
        client_id: clientToken,
        schedule_data: newSchedule,
        timestamp: new Date().toISOString()
    };

    updateStatus('Enviando dados de configuração para o n8n...');

    try {
        const response = await fetch(N8N_WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (response.ok) {
            updateStatus(`Configuração salva com sucesso! Resposta do n8n: ${JSON.stringify(result)}`);
        } else {
            updateStatus(`Erro ao salvar (Status: ${response.status}). Resposta: ${JSON.stringify(result)}`, true);
        }

    } catch (error) {
        updateStatus(`Erro na comunicação: ${error.message}`, true);
    }
}

async function toggleBot(newState) {
    const clientToken = document.getElementById('clientToken').value;

    const payload = {
        action: newState === 'ON' ? 'BOT_ON' : 'BOT_OFF',
        client_id: clientToken,
    };

    updateStatus(`Enviando comando para ${newState}...`);

    try {
        const response = await fetch(N8N_WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            const nextState = newState === 'ON' ? 'OFF' : 'ON';
            toggleButton.textContent = `${nextState} BOT`;
            toggleButton.onclick = () => toggleBot(nextState);
            toggleButton.style.backgroundColor = newState === 'ON' ? 'red' : 'green';
            updateStatus(`Comando ${newState} enviado com sucesso. Bot no status: ${newState}.`);
        } else {
            updateStatus(`Erro ao enviar comando (Status: ${response.status}).`, true);
        }
    } catch (error) {
        updateStatus(`Erro na comunicação: ${error.message}`, true);
    }
}

// Inicializa o botão
toggleBot('OFF'); 

// Adicione esta linha no final do seu scripts.js para buscar o status a cada 5 segundos
setInterval(fetchBotStatus, 1000); // Consulta o n8n a cada 5 segundos