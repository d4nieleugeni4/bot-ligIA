const { PREFIX } = require(`${BASE_DIR}/config`);
const { errorLog, successLog } = require(`${BASE_DIR}/utils/logger`);

module.exports = {
  name: "delete",
  description: "Apaga a mensagem marcada com o comando",
  commands: ["delete", "del"],
  usage: `${PREFIX}delete`,
  handle: async ({ socket, webMessage, remoteJid, sendReply }) => {
    try {
      // Verifica se a mensagem é uma resposta (marcada)
      if (!webMessage.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
        return await sendReply('⚠️ Você precisa marcar uma mensagem para apagar!');
      }

      // Verifica se o usuário tem permissão (admin ou dono da mensagem)
      const isAdmin = webMessage.key.participant?.endsWith('@s.whatsapp.net') || 
                      webMessage.key.participant === webMessage.key.remoteJid;
      const isSender = webMessage.message.extendedTextMessage.contextInfo.participant === 
                      webMessage.key.participant;

      if (!isAdmin && !isSender) {
        return await sendReply('⚠️ Você só pode apagar suas próprias mensagens ou precisa ser admin!');
      }

      // Obtém os dados da mensagem marcada
      const quotedMessage = webMessage.message.extendedTextMessage.contextInfo;
      
      // Apaga a mensagem
      await socket.sendMessage(remoteJid, {
        delete: {
          id: quotedMessage.stanzaId,
          remoteJid: remoteJid,
          participant: quotedMessage.participant,
          fromMe: quotedMessage.participant === socket.user.id
        }
      });

      // Opcional: Confirmação de deleção
      await sendReply('✅ Mensagem apagada com sucesso!');

    } catch (error) {
      errorLog(`Erro ao apagar mensagem: ${error.message}`);
      await sendReply('❌ Ocorreu um erro ao tentar apagar a mensagem');
    }
  }
};