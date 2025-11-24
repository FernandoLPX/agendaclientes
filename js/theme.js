// js/theme.js

document.addEventListener('DOMContentLoaded', () => {
    // Agora pegamos o input checkbox, não um botão
    const toggleInput = document.getElementById('darkModeToggle');
    const body = document.body;

    // 1. Função para ativar Dark Mode
    function enableDarkMode() {
        body.classList.add('dark-mode');
        localStorage.setItem('darkMode', 'enabled');
        if (toggleInput) toggleInput.checked = true; // Marca o switch
    }

    // 2. Função para desativar Dark Mode
    function disableDarkMode() {
        body.classList.remove('dark-mode');
        localStorage.setItem('darkMode', 'disabled');
        if (toggleInput) toggleInput.checked = false; // Desmarca o switch
    }

    // 3. Verificação Inicial
    if (localStorage.getItem('darkMode') === 'enabled') {
        enableDarkMode();
    } else {
        disableDarkMode();
    }

    // 4. Listener de Mudança (Change para Checkbox)
    if (toggleInput) {
        toggleInput.addEventListener('change', (event) => {
            if (event.target.checked) {
                enableDarkMode();
            } else {
                disableDarkMode();
            }
        });
    }
});