const { PREFIX } = require(`${BASE_DIR}/config`);
const { errorLog, successLog } = require(`${BASE_DIR}/utils/logger`);

module.exports = {
  name: "nomegp",
  description: "Altera o nome do grupo",
  commands: ["nomegp", "mudarnome"],
  usage: `${PREFIX}nomegp [novo nome]`,
  handle: async ({ socket, webMessage, remoteJid, args, sendReply }) => {
    try {
      // 1. Verifica se é grupo
      if (!remoteJid.endsWith('@g.us')) {
        return await sendReply('⚠️ Este comando só funciona em grupos!');
      }

      // 2. Verifica se quem enviou é admin
      const participant = webMessage.key.participant;
      const metadata = await socket.groupMetadata(remoteJid);
      const isAdmin = metadata.participants.find(p => p.id === participant)?.admin === 'admin';

      if (!isAdmin) {
        return await sendReply('❌ Apenas administradores podem mudar o nome do grupo!');
      }

      // 3. Pega o novo nome
      const newName = args.join(' ');
      if (!newName || newName.length < 2) {
        return await sendReply(`⚠️ Use: ${PREFIX}nomegp [novo nome]`);
      }

      // 4. Altera o nome do grupo
      await socket.groupUpdateSubject(remoteJid, newName);

      // 5. Confirmação
      await sendReply(`✅ Nome do grupo alterado para: "${newName}"`);
      successLog(`Nome do grupo alterado: ${remoteJid} -> "${newName}"`);

    } catch (error) {
      errorLog(`Erro ao alterar nome do grupo: ${error.message}`);
      await sendReply('❌ Erro ao mudar nome. Verifique se o bot é admin!');
    }
  }
};