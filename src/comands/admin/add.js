// add.js
const { PREFIX } = require(`${BASE_DIR}/config`);
const { DangerError } = require(`${BASE_DIR}/errors/DangerError`);
const { InvalidParameterError } = require(`${BASE_DIR}/errors/InvalidParameterError`);
const { onlyNumbers } = require(`${BASE_DIR}/utils`);

module.exports = {
  name: "add",
  description: "Adiciona um membro ao grupo",
  commands: ["add"],
  usage: `${PREFIX}add 551199999999`,
  
  handle: async ({
    args,
    socket,
    remoteJid,
    sendReply,
    sendSuccessReact,
    sendWarningReact
  }) => {
    if (!args.length) {
      throw new InvalidParameterError("Você precisa fornecer um número!");
    }

    const number = args[0];
    const cleanNumber = onlyNumbers(number);

    // Validação do número
    if (cleanNumber.length < 7 || cleanNumber.length > 15) {
      throw new InvalidParameterError("Número inválido! Use o formato 551199999999");
    }

    const userJid = `${cleanNumber}@s.whatsapp.net`;

    try {
      // Verifica SE JÁ ESTÁ NO GRUPO
      const groupData = await socket.groupMetadata(remoteJid);
      const isMember = groupData.participants.some(p => p.id === userJid);
      
      if (isMember) {
        await sendReply(`⚠️ O número ${cleanNumber} JÁ ESTÁ no grupo.`);
        return;
      }

      // Tenta adicionar
      const response = await socket.groupParticipantsUpdate(
        remoteJid,
        [userJid],
        "add"
      );

      // Verifica se realmente foi adicionado
      if (response[0].status === "200") {
        await sendSuccessReact();
        await sendReply(`✅ ${cleanNumber} adicionado com sucesso!`);
      } else {
        throw new Error("Falha ao adicionar");
      }

    } catch (error) {
      console.error("ERRO NO ADD:", error);
      await sendWarningReact();

      // Mensagens ESPECÍFICAS igual nos outros comandos
      if (error.message.includes("403")) {
        await sendReply("❌ EU PRECISO SER ADMIN para adicionar membros!");
      } else if (error.message.includes("404")) {
        await sendReply("❌ Número NÃO REGISTRADO no WhatsApp!");
      } else if (error.message.includes("409")) {
        await sendReply("⚠️ O usuário JÁ ESTÁ em outro grupo meu!");
      } else {
        await sendReply("❌ NÃO CONSEGUI adicionar: " + error.message);
      }
    }
  },
};