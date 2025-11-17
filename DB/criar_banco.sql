CREATE SCHEMA plataforma;

CREATE TABLE plataforma.client_configs (
    id SERIAL PRIMARY KEY,
    client_id VARCHAR(50) UNIQUE NOT NULL, -- ID único para o cliente (Ex: CLIENTE_001)
    schedule_data TEXT,                    -- Texto da agenda (Ex: Seg a Sex, 9h-18h)
    api_token VARCHAR(255),                -- O token de acesso que o frontend usará para autenticar
    bot_status VARCHAR(10) NOT NULL DEFAULT 'OFF', -- ON / OFF / ERROR
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE plataforma.agendamentos (
    id SERIAL PRIMARY KEY,
    client_id VARCHAR(50) NOT NULL REFERENCES plataforma.client_configs(client_id), -- Liga ao cliente
    service_name VARCHAR(100) NOT NULL,    -- Nome do serviço agendado (Ex: Corte de Cabelo)
    scheduled_datetime TIMESTAMP WITH TIME ZONE NOT NULL, -- Quando o serviço será executado
    customer_name VARCHAR(100),            -- Nome do cliente final (do seu cliente)
    customer_phone VARCHAR(20),            -- Telefone do cliente final
    status VARCHAR(20) NOT NULL DEFAULT 'PENDENTE', -- PENDENTE / CONFIRMADO / CANCELADO
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);