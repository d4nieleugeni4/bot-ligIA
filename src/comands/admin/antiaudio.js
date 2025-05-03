const { PREFIX } = require("../../config");
const { errorLog, successLog } = require("../../utils/logger");
const isAdmin = require("../../middlewares/isAdmin");

// Variável global para grupos com anti-áudio ativo
global.ANTI_AUDIO_GROUPS = global.ANTI_AUDIO_GROUPS || new Set();

module.exports = {
  name: "anti-audio",
  description: "Bloqueia o envio de áudios no grupo",
  commands: ["antiaudio", "bloquearaudio"],
  usage: `${PREFIX}antiaudio [on/off/status]`,
  handle: async ({ args, remoteJid, sendReply, socket, userJid }) => {
    try {
      // Verifica se é grupo
      if (!remoteJid.endsWith('@g.us')) {
        return await sendReply('⚠️ Este comando só funciona em grupos!');
      }

      // Verifica permissão
      const adminCheck = await isAdmin({ socket, remoteJid, userJid });
      if (!adminCheck) {
        return await sendReply('❌ Você precisa ser admin!');
      }

      const action = args[0]?.toLowerCase();

      // Status
      if (action === 'status') {
        const status = global.ANTI_AUDIO_GROUPS.has(remoteJid) ? 'ON ✅' : 'OFF ❌';
        return await sendReply(`Status do anti-áudio: ${status}`);
      }

      // Ativar
      if (action === 'on') {
        if (global.ANTI_AUDIO_GROUPS.has(remoteJid)) {
          return await sendReply('⚠️ O anti-áudio já está ativado!');
        }
        global.ANTI_AUDIO_GROUPS.add(remoteJid);
        successLog(`Anti-áudio ativado em: ${remoteJid}`);
        return await sendReply('✅ *Anti-áudio ATIVADO!* Áudios serão deletados.');
      }

      // Desativar
      if (action === 'off') {
        if (!global.ANTI_AUDIO_GROUPS.has(remoteJid)) {
          return await sendReply('⚠️ O anti-áudio já está desativado!');
        }
        global.ANTI_AUDIO_GROUPS.delete(remoteJid);
        successLog(`Anti-áudio desativado em: ${remoteJid}`);
        return await sendReply('❌ *Anti-áudio DESATIVADO*');
      }

      // Ajuda
      return await sendReply(
        `🔇 *Como usar:*\n` +
        `• ${PREFIX}antiaudio on - Ativa\n` +
        `• ${PREFIX}antiaudio off - Desativa\n` +
        `• ${PREFIX}antiaudio status - Verifica\n\n` +
        `⚠️ *Requer:* Admin`
      );
    } catch (error) {
      errorLog(`Erro no anti-áudio: ${error.message}`);
      return await sendReply('❌ Erro ao executar o comando!');
    }
  }
};