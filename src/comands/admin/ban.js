const { PREFIX } = require(`${BASE_DIR}/config`);
const { errorLog, successLog } = require(`${BASE_DIR}/utils/logger`);

module.exports = {
  name: "ban",
  description: "Bane um usuário do grupo",
  commands: ["ban"],
  usage: `${PREFIX}ban [@user | número | @user Xs]`,
  handle: async ({ socket, webMessage, remoteJid, sendReply }) => {
    try {
      // Verifica se o usuário é admin
      const isAdmin = await socket.groupMetadata(remoteJid)
        .then(metadata => metadata.participants
          .some(p => p.id === webMessage.key.participant && p.admin));

      if (!isAdmin) {
        return await sendReply('⚠️ Você precisa ser admin para banir alguém!');
      }

      let target = null;
      let delay = 0;

      // Extrai o texto do comando
      const text = webMessage.message?.conversation || 
                   webMessage.message?.extendedTextMessage?.text || "";
      const args = text.split(' ').slice(1); // Ignora o comando .ban

      // Verifica se há menção (@) ou número
      if (webMessage.message?.extendedTextMessage?.contextInfo?.mentionedJid) {
        target = webMessage.message.extendedTextMessage.contextInfo.mentionedJid[0];
      } else if (args[0] && args[0].match(/^\d+/)) {
        target = `${args[0]}@s.whatsapp.net`;
      }

      // Verifica se há delay (ex: 4s, 7s)
      if (args.length > 1 && args[1].match(/^\d+s$/)) {
        delay = parseInt(args[1]) * 1000; // Converte segundos para milissegundos
      } else if (args[0] && args[0].match(/^\d+s$/)) {
        delay = parseInt(args[0]) * 1000;
      }

      // Se não encontrou alvo
      if (!target) {
        return await sendReply('⚠️ Você precisa mencionar um usuário (@user) ou fornecer um número!');
      }

      // Função para executar o ban
      const executeBan = async () => {
        try {
          await socket.groupParticipantsUpdate(remoteJid, [target], "remove");
          await sendReply(`✅ Usuário ${target.split('@')[0]} banido com sucesso!`);
        } catch (banError) {
          errorLog(`Erro ao banir usuário: ${banError.message}`);
          await sendReply('❌ Erro ao banir o usuário');
        }
      };

      // Executa o ban com ou sem delay
      if (delay > 0) {
        await sendReply(`⏳ Banindo ${target.split('@')[0]} em ${delay/1000} segundos...`);
        setTimeout(executeBan, delay);
      } else {
        await executeBan();
      }

    } catch (error) {
      errorLog(`Erro no comando ban: ${error.message}`);
      await sendReply('❌ Ocorreu um erro ao processar o comando de ban');
    }
  }
};