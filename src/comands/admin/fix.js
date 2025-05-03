const { PREFIX } = require(`${BASE_DIR}/config`);
const { errorLog, successLog } = require(`${BASE_DIR}/utils/logger`);

module.exports = {
  name: "fixar",
  description: "Fixa mensagens no topo do grupo igual no WhatsApp",
  commands: ["fixar", "fix", "pin"],
  usage: `${PREFIX}fixar (respondendo a mensagem)`,
  handle: async ({ socket, webMessage, remoteJid, sendReply }) => {
    try {
      // 1. Verifica se é grupo
      if (!remoteJid.endsWith('@g.us')) {
        return await sendReply('⚠️ Só funciona em grupos!');
      }

      // 2. Verifica se é admin
      const participant = webMessage.key.participant;
      const metadata = await socket.groupMetadata(remoteJid);
      const isAdmin = metadata.participants.find(p => p.id === participant)?.admin === 'admin';

      if (!isAdmin) {
        return await sendReply('❌ Só admins podem fixar mensagens!');
      }

      // 3. Pega a mensagem respondida
      const quotedMsg = webMessage.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      if (!quotedMsg) {
        return await sendReply(`⚠️ Responda a mensagem com:\n${PREFIX}fixar`);
      }

      // 4. Fixa a mensagem usando a API do WhatsApp
      const messageKey = {
        remoteJid: remoteJid,
        id: webMessage.message.extendedTextMessage.contextInfo.stanzaId,
        fromMe: false
      };

      await socket.sendMessage(remoteJid, {
        pin: messageKey
      });

      // 5. Confirmação
      await sendReply('✅ Mensagem fixada no grupo!');
      successLog(`Mensagem fixada em ${remoteJid}`);

    } catch (error) {
      errorLog(`Erro ao fixar: ${error.message}`);
      await sendReply('❌ Erro ao fixar. Verifique se o bot é admin!');
    }
  }
};