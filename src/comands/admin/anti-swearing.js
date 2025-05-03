const path = require('path');
const fs = require('fs');
const { PREFIX } = require(`${global.BASE_DIR}/config`);
const { errorLog, successLog } = require(`${global.BASE_DIR}/utils/logger`);

// Caminhos alternativos para o banco de palavras
const SWEAR_WORDS_PATHS = [
    path.join(global.BASE_DIR, 'banco', 'swearWords.json'),
    path.join(global.BASE_DIR, 'src', 'banco', 'swearWords.json'),
    path.join(__dirname, '..', '..', 'banco', 'swearWords.json')
];

// Tenta carregar de múltiplos locais
let SWEAR_WORDS = [];
for (const dbPath of SWEAR_WORDS_PATHS) {
    try {
        if (fs.existsSync(dbPath)) {
            SWEAR_WORDS = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
            successLog(`Palavras proibidas carregadas de: ${dbPath}`);
            break;
        }
    } catch (error) {
        errorLog(`Erro ao carregar ${dbPath}: ${error.message}`);
    }
}

// Fallback se não encontrar
if (SWEAR_WORDS.length === 0) {
    SWEAR_WORDS = ['palavrão1', 'palavrão2', 'palavrão3'];
    errorLog('Usando lista fallback de palavras proibidas');
}

// Função para verificar se uma mensagem contém palavrões (case-insensitive)
function containsSwearWord(message) {
    const lowerCaseMessage = message.toLowerCase();
    return SWEAR_WORDS.some(word => lowerCaseMessage.includes(word.toLowerCase()));
}

module.exports = {
    name: "anti-swear",
    description: "Sistema avançado de bloqueio de palavrões (case-insensitive)",
    commands: ["antipalavrao", "antixingo"],
    usage: `${PREFIX}antipalavrao [on/off/status]`,
    handle: async ({ args, remoteJid, sendReply, socket, userJid, message }) => {
        try {
            // Verifica se é grupo
            if (!remoteJid.endsWith('@g.us')) {
                return await sendReply('⚠️ Funciona apenas em grupos!');
            }

            // Se a mensagem contém palavrão (verificação case-insensitive)
            if (message && containsSwearWord(message.body || message.text)) {
                await socket.sendMessage(remoteJid, {
                    text: `🚫 *Palavrão detectado!* ${message.pushName}, evite linguagem inadequada.`
                });
                return; // Encerra a execução se detectar palavrão
            }

            const action = args[0]?.toLowerCase();

            // Status
            if (action === 'status') {
                const status = global.ANTI_SWEAR_GROUPS.has(remoteJid) ? 'ON ✅' : 'OFF ❌';
                return await sendReply(`🔞 Status: ${status} | ${SWEAR_WORDS.length} palavras bloqueadas`);
            }

            // Ativar/Desativar
            if (action === 'on' || action === 'off') {
                const isAdmin = await require(`${global.BASE_DIR}/middlewares/isAdmin`)({ 
                    socket, 
                    remoteJid, 
                    userJid 
                });
                if (!isAdmin) return await sendReply('❌ Apenas admins!');

                if (action === 'on') {
                    global.ANTI_SWEAR_GROUPS.add(remoteJid);
                    successLog(`Anti-palavrões ativado em ${remoteJid}`);
                    return await sendReply('✅ *Sistema ativado!*\nPalavras bloqueadas: ' + SWEAR_WORDS.length);
                } else {
                    global.ANTI_SWEAR_GROUPS.delete(remoteJid);
                    successLog(`Anti-palavrões desativado em ${remoteJid}`);
                    return await sendReply('❌ Sistema desativado');
                }
            }

            // Ajuda
            return await sendReply(
                `📝 *Como usar:*\n` +
                `${PREFIX}antipalavrao on - Ativa\n` +
                `${PREFIX}antipalavrao off - Desativa\n` +
                `${PREFIX}antipalavrao status - Verifica\n\n` +
                `🔞 Palavras bloqueadas: ${SWEAR_WORDS.length}`
            );

        } catch (error) {
            errorLog(`Erro no anti-palavrões: ${error.stack}`);
            return await sendReply('❌ Erro no sistema!');
        }
    }
};