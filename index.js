const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

// Cria uma nova instância do cliente
const client = new Client({
    authStrategy: new LocalAuth() // Salva a sessão localmente para não precisar escanear o QR code toda vez
});

// Gera o QR code para autenticação
client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
});

// Confirmação de que o cliente está pronto
client.on('ready', () => {
    console.log('Client is ready!');
});

// Escuta as mensagens recebidas
client.on('message', message => {
    if (message.body === '/ping') {
        message.reply('Pong');
    } else if (message.body === '/menu') {
        const menu = `
        *Menu de Comandos:*
        /ping - Responde com "Pong"
        /menu - Exibe este menu
        `;
        message.reply(menu);
    }
});

// Inicializa o cliente
client.initialize();
