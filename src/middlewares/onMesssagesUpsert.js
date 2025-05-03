const { dynamicCommand } = require("../utils/dynamicCommand");
const { loadCommonFunctions } = require("../utils/loadCommonFunctions");
const { errorLog, successLog, warningLog } = require("../utils/logger");
const path = require('path');
const fs = require('fs');

// ================= [ INICIALIZAÇÃO ] ================= //
// → Variáveis globais de moderação
global.ANTI_LINK_GROUPS = global.ANTI_LINK_GROUPS || new Set();
global.ANTI_MEDIA_GROUPS = global.ANTI_MEDIA_GROUPS || new Set();
global.ANTI_AUDIO_GROUPS = global.ANTI_AUDIO_GROUPS || new Set();
global.ANTI_STICKER_GROUPS = global.ANTI_STICKER_GROUPS || new Set();
global.ANTI_SWEAR_GROUPS = global.ANTI_SWEAR_GROUPS || new Set();

// → Carrega palavras proibidas
let SWEAR_WORDS = [];
try {
    const swearPath = path.join(global.BASE_DIR || __dirname, 'banco', 'swearWords.json');
    if (fs.existsSync(swearPath)) {
        SWEAR_WORDS = JSON.parse(fs.readFileSync(swearPath, 'utf8'));
        successLog(`✅ Anti-palavrões: ${SWEAR_WORDS.length} termos carregados`);
    } else {
        SWEAR_WORDS = ["porra", "caralho", "pqp", "puta", "merda"]; // Fallback
        warningLog("⚠️ swearWords.json não encontrado. Usando lista padrão.");
    }
} catch (error) {
    errorLog(`❌ Erro ao carregar palavras proibidas: ${error.message}`);
    SWEAR_WORDS = ["porra", "caralho"]; // Fallback mínimo
}

// ================= [ FUNÇÕES DE MODERAÇÃO ] ================= //

// 1️⃣ Anti-Link
const processAntiLink = async ({ socket, webMessage }) => {
    try {
        if (!global.ANTI_LINK_GROUPS.has(webMessage.key.remoteJid)) return false;

        const text = webMessage.message?.conversation || 
                     webMessage.message?.extendedTextMessage?.text || '';
        if (!/(https?:\/\/|www\.)/i.test(text)) return false;

        await socket.sendMessage(webMessage.key.remoteJid, { delete: webMessage.key });
        
        if (webMessage.key.participant) {
            await socket.sendMessage(webMessage.key.remoteJid, {
                text: `@${webMessage.key.participant.split('@')[0]} • Links não são permitidos! 🔗`,
                mentions: [webMessage.key.participant]
            });
        }
        return true;
    } catch (error) {
        errorLog(`ANTI-LINK ERRO: ${error.message}`);
        return false;
    }
};

// 2️⃣ Anti-Mídia
const processAntiMedia = async ({ socket, webMessage }) => {
    try {
        if (!global.ANTI_MEDIA_GROUPS.has(webMessage.key.remoteJid)) return false;

        const isMedia = webMessage.message?.imageMessage || 
                       webMessage.message?.videoMessage;
        if (!isMedia) return false;

        await socket.sendMessage(webMessage.key.remoteJid, { delete: webMessage.key });
        
        if (webMessage.key.participant) {
            await socket.sendMessage(webMessage.key.remoteJid, {
                text: `@${webMessage.key.participant.split('@')[0]} • Mídias bloqueadas! 📵`,
                mentions: [webMessage.key.participant]
            });
        }
        return true;
    } catch (error) {
        errorLog(`ANTI-MÍDIA ERRO: ${error.message}`);
        return false;
    }
};

// 3️⃣ Anti-Áudio
const processAntiAudio = async ({ socket, webMessage }) => {
    try {
        if (!global.ANTI_AUDIO_GROUPS.has(webMessage.key.remoteJid)) return false;

        const isAudio = webMessage.message?.audioMessage;
        if (!isAudio) return false;

        await socket.sendMessage(webMessage.key.remoteJid, { delete: webMessage.key });
        
        if (webMessage.key.participant) {
            await socket.sendMessage(webMessage.key.remoteJid, {
                text: `@${webMessage.key.participant.split('@')[0]} • Áudios bloqueados! 🔇`,
                mentions: [webMessage.key.participant]
            });
        }
        return true;
    } catch (error) {
        errorLog(`ANTI-ÁUDIO ERRO: ${error.message}`);
        return false;
    }
};

// 4️⃣ Anti-Sticker
const processAntiSticker = async ({ socket, webMessage }) => {
    try {
        if (!global.ANTI_STICKER_GROUPS.has(webMessage.key.remoteJid)) return false;

        const isSticker = webMessage.message?.stickerMessage;
        if (!isSticker) return false;

        await socket.sendMessage(webMessage.key.remoteJid, { delete: webMessage.key });
        
        if (webMessage.key.participant) {
            await socket.sendMessage(webMessage.key.remoteJid, {
                text: `@${webMessage.key.participant.split('@')[0]} • Stickers bloqueados! ❌`,
                mentions: [webMessage.key.participant]
            });
        }
        return true;
    } catch (error) {
        errorLog(`ANTI-STICKER ERRO: ${error.message}`);
        return false;
    }
};

// 5️⃣ Anti-Palavrões (VERSÃO DEFINITIVA)
const processAntiSwearing = async ({ socket, webMessage }) => {
    try {
        if (!global.ANTI_SWEAR_GROUPS.has(webMessage.key.remoteJid) || SWEAR_WORDS.length === 0) {
            return false;
        }

        // Pega o texto da mensagem (suporta texto, legendas de mídia, etc.)
        const text = (
            webMessage.message?.conversation || 
            webMessage.message?.extendedTextMessage?.text || 
            webMessage.message?.imageMessage?.caption || 
            webMessage.message?.videoMessage?.caption || 
            ''
        ).toLowerCase();

        // Verifica cada palavra do banco (usando regex para busca exata)
        const hasSwear = SWEAR_WORDS.some(word => {
            const regex = new RegExp(`\\b${word.toLowerCase()}\\b`, 'i');
            return regex.test(text);
        });

        if (!hasSwear) return false;

        // 🔥 Ação: Apaga a mensagem e avisa o usuário
        await socket.sendMessage(webMessage.key.remoteJid, { 
            delete: webMessage.key 
        });

        if (webMessage.key.participant) {
            await socket.sendMessage(webMessage.key.remoteJid, {
                text: `@${webMessage.key.participant.split('@')[0]} • Palavrão detectado! 🚫`,
                mentions: [webMessage.key.participant]
            });
        }

        return true;
    } catch (error) {
        errorLog(`ANTI-PALAVRÃO ERRO: ${error.message}`);
        return false;
    }
};

// ================= [ HANDLER PRINCIPAL ] ================= //
exports.onMessagesUpsert = async ({ socket, messages }) => {
    if (!messages?.length) return;

    for (const webMessage of messages) {
        try {
            // → Processa apenas em grupos
            if (!webMessage.key.remoteJid?.endsWith('@g.us')) continue;

            // → Ordem de execução dos filtros
            if (await processAntiLink({ socket, webMessage })) continue;
            if (await processAntiMedia({ socket, webMessage })) continue;
            if (await processAntiAudio({ socket, webMessage })) continue;
            if (await processAntiSticker({ socket, webMessage })) continue;
            if (await processAntiSwearing({ socket, webMessage })) continue;

            // → Processa comandos normais
            const commonFunctions = loadCommonFunctions({ socket, webMessage });
            if (commonFunctions) await dynamicCommand(commonFunctions);

        } catch (error) {
            errorLog(`ERRO CRÍTICO: ${error.message}`);
        }
    }
};