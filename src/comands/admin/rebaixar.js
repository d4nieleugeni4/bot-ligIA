const { PREFIX } = require(`${BASE_DIR}/config`);
const { DangerError } = require(`${BASE_DIR}/errors/DangerError`);
const {
  InvalidParameterError,
} = require(`${BASE_DIR}/errors/InvalidParameterError`);
const { toUserJid, onlyNumbers } = require(`${BASE_DIR}/utils`);

module.exports = {
  name: "rebaixar",
  description: "Rebaixa um administrador do grupo",
  commands: ["rebaixar", "demote", "removeradm"],
  usage: `${PREFIX}rebaixar @membro`,
  handle: async ({
    args,
    isReply,
    socket,
    remoteJid,
    replyJid,
    sendReply,
    userJid,
    sendSuccessReact,
    sendWarningReact,
  }) => {
    if ((!args.length && !isReply)) {
      throw new InvalidParameterError(
        "Você precisa mencionar um membro para rebaixar!"
      );
    }

    // Obtém o JID do membro
    const memberJid = isReply ? replyJid : toUserJid(args[0]);
    const memberNumber = onlyNumbers(memberJid);
    const usuario = memberJid.split('@')[0];

    // Verifica se o número é válido
    if (memberNumber.length < 7 || memberNumber.length > 15) {
      throw new InvalidParameterError("Número inválido!");
    }

    // Verifica se não está tentando modificar a si mesmo
    if (memberJid === userJid) {
      throw new DangerError("Você não pode se rebaixar!");
    }

    try {
      // Verifica se o membro está no grupo
      const groupData = await socket.groupMetadata(remoteJid);
      const memberData = groupData.participants.find(p => p.id === memberJid);
      
      if (!memberData) {
        await socket.sendMessage(remoteJid, {
          text: `❌ @${usuario} não está no grupo!`,
          mentions: [memberJid]
        });
        return;
      }

      // Verifica se já não é admin
      if (!memberData.admin) {
        await socket.sendMessage(remoteJid, {
          text: `⚠️ @${usuario} já não é administrador!`,
          mentions: [memberJid]
        });
        return;
      }

      // Rebaixa o membro
      await socket.groupParticipantsUpdate(remoteJid, [memberJid], "demote");

      await sendSuccessReact();
      await socket.sendMessage(remoteJid, {
        text: `✅ @${usuario} foi rebaixado de administrador!`,
        mentions: [memberJid]
      });

    } catch (error) {
      console.error("Erro ao rebaixar:", error);
      await sendWarningReact();

      if (error.message.includes("403")) {
        await sendReply(
          "❌ Não foi possível rebaixar. Verifique se:\n" +
          "1. Eu sou administrador\n" +
          "2. Você é administrador\n" +
          "3. Não é o dono do grupo"
        );
      } else {
        await sendReply(`❌ Erro: ${error.message}`);
      }
    }
  },
};