// src/commands/moderation/antimedia.js
const { PREFIX } = require("../../config");
const { errorLog, successLog } = require("../../utils/logger");
const isAdmin = require("../../middlewares/isAdmin");

// Garante que a lista exista
global.ANTI_MEDIA_GROUPS = global.ANTI_MEDIA_GROUPS || new Set();

module.exports = {
    name: "anti-media",
    description: "Bloqueia o envio de mídias no grupo",
    commands: ["antimedia", "antimidia"],
    usage: `${PREFIX}antimedia [on/off/status]`,
    handle: async ({ args, remoteJid, sendReply, socket, userJid }) => {
        try {
            // Verifica se é grupo
            if (!remoteJid.endsWith('@g.us')) {
                return await sendReply('⚠️ Este comando só funciona em grupos!');
            }

            // Verifica se é admin
            const adminCheck = await isAdmin({ socket, remoteJid, userJid });
            if (!adminCheck) {
                return await sendReply('❌ Você precisa ser administrador para usar este comando!');
            }

            const action = args[0]?.toLowerCase();

            // Status
            if (action === 'status') {
                const status = global.ANTI_MEDIA_GROUPS.has(remoteJid) ? 'ON ✅' : 'OFF ❌';
                return await sendReply(`Status do anti-mídia: ${status}`);
            }

            // Ativar
            if (action === 'on') {
                if (global.ANTI_MEDIA_GROUPS.has(remoteJid)) {
                    return await sendReply('⚠️ O anti-mídia já está ativado!');
                }
                global.ANTI_MEDIA_GROUPS.add(remoteJid);
                successLog(`Anti-mídia ativado em: ${remoteJid}`);
                return await sendReply('✅ *Anti-mídia ATIVADO!* Agora vou bloquear:\n• Fotos\n• Vídeos\n• GIFs');
            }

            // Desativar
            if (action === 'off') {
                if (!global.ANTI_MEDIA_GROUPS.has(remoteJid)) {
                    return await sendReply('⚠️ O anti-mídia já está desativado!');
                }
                global.ANTI_MEDIA_GROUPS.delete(remoteJid);
                successLog(`Anti-mídia desativado em: ${remoteJid}`);
                return await sendReply('❌ *Anti-mídia DESATIVADO*');
            }

            // Ajuda
            return await sendReply(
                `📵 *Como usar:*\n` +
                `• ${PREFIX}antimedia on - Ativa o bloqueio\n` +
                `• ${PREFIX}antimedia off - Desativa\n` +
                `• ${PREFIX}antimedia status - Verifica\n\n` +
                `⚠️ *Requer:* Permissão de administrador`
            );

        } catch (error) {
            errorLog(`Erro no comando anti-mídia: ${error.message}`);
            return await sendReply('❌ Ocorreu um erro ao executar este comando!');
        }
    }
};