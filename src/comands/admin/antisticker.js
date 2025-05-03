const { PREFIX } = require("../../config");
const { errorLog, successLog } = require("../../utils/logger");
const isAdmin = require("../../middlewares/isAdmin");

// Variável global para grupos com anti-sticker ativo
global.ANTI_STICKER_GROUPS = global.ANTI_STICKER_GROUPS || new Set();

module.exports = {
  name: "anti-sticker",
  description: "Bloqueia o envio de stickers no grupo",
  commands: ["antisticker", "blocksticker"],
  usage: `${PREFIX}antisticker [on/off/status]`,
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
        const status = global.ANTI_STICKER_GROUPS.has(remoteJid) ? 'ON ✅' : 'OFF ❌';
        return await sendReply(`Status do anti-sticker: ${status}`);
      }

      // Ativar
      if (action === 'on') {
        if (global.ANTI_STICKER_GROUPS.has(remoteJid)) {
          return await sendReply('⚠️ O anti-sticker já está ativado!');
        }
        global.ANTI_STICKER_GROUPS.add(remoteJid);
        successLog(`Anti-sticker ativado em: ${remoteJid}`);
        return await sendReply('✅ *Anti-sticker ATIVADO!* Stickers serão deletados.');
      }

      // Desativar
      if (action === 'off') {
        if (!global.ANTI_STICKER_GROUPS.has(remoteJid)) {
          return await sendReply('⚠️ O anti-sticker já está desativado!');
        }
        global.ANTI_STICKER_GROUPS.delete(remoteJid);
        successLog(`Anti-sticker desativado em: ${remoteJid}`);
        return await sendReply('❌ *Anti-sticker DESATIVADO*');
      }

      // Ajuda
      return await sendReply(
        `❌ *Como usar:*\n` +
        `• ${PREFIX}antisticker on - Ativa\n` +
        `• ${PREFIX}antisticker off - Desativa\n` +
        `• ${PREFIX}antisticker status - Verifica\n\n` +
        `⚠️ *Requer:* Admin`
      );
    } catch (error) {
      errorLog(`Erro no anti-sticker: ${error.message}`);
      return await sendReply('❌ Erro ao executar o comando!');
    }
  }
};