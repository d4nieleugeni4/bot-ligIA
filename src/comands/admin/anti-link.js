const { PREFIX } = require(`${BASE_DIR}/config`);
const { errorLog, successLog } = require(`${BASE_DIR}/utils/logger`);

module.exports = {
  name: "anti-link",
  description: "Deleta mensagens com links e avisa o remetente",
  commands: ["antilink"],
  usage: `${PREFIX}antilink [on/off/status]`,
  handle: async ({ args, remoteJid, sendReply }) => {
    const action = args[0]?.toLowerCase();

    // Comando de status
    if (action === 'status') {
      const status = global.ANTI_LINK_GROUPS?.has(remoteJid) ? 'ON ✅' : 'OFF ❌';
      return await sendReply(`Status do anti-link: ${status}`);
    }

    // Ativação
    if (action === 'on') {
      if (global.ANTI_LINK_GROUPS?.has(remoteJid)) {
        return await sendReply('⚠️ O anti-link já está ativado neste grupo!');
      }
      global.ANTI_LINK_GROUPS.add(remoteJid);
      successLog(`Anti-link ativado no grupo: ${remoteJid}`);
      return await sendReply('✅ Anti-link ATIVADO! Agora vou apagar:\n• Links (http/https)\n• Sites (www)\n• URLs encurtadas');
    }

    // Desativação
    if (action === 'off') {
      if (!global.ANTI_LINK_GROUPS?.has(remoteJid)) {
        return await sendReply('⚠️ O anti-link já está desativado neste grupo!');
      }
      global.ANTI_LINK_GROUPS.delete(remoteJid);
      successLog(`Anti-link desativado no grupo: ${remoteJid}`);
      return await sendReply('❌ Anti-link DESATIVADO');
    }

    // Ajuda
    return await sendReply(
      `🔧 Como usar:\n` +
      `${PREFIX}antilink on - Ativa a proteção\n` +
      `${PREFIX}antilink off - Desativa\n` +
      `${PREFIX}antilink status - Verifica o estado atual\n\n` +
      `⚠️ Requer: Permissões de administrador`
    );
  }
};