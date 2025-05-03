const { PREFIX } = require(`${BASE_DIR}/config`);

module.exports = {
  name: "descrição",
  description: "Comandos para visualizar e editar a descrição do grupo",
  commands: ["descrição", "descrição-chat", "descrição-edit"],
  usage: `${PREFIX}descrição-edit <nova_descrição>`,
  handle: async ({ socket, remoteJid, args, userJid, sendReply, sendReact, fullMessage }) => {
    try {
      const groupMetadata = await socket.groupMetadata(remoteJid);
      
      // Verificar se o usuário é admin
      const isAdmin = groupMetadata.participants.find(
        p => p.id === userJid && (p.admin === 'admin' || p.admin === 'superadmin')
      );

      // Comando: .descrição ou .descrição visualizar
      if (args.length === 0 || this.commands.includes(fullMessage.split(' ')[0].toLowerCase())) {
        await sendReact("📄");
        return sendReply(
          `📝 Descrição do grupo:\n\n${groupMetadata.desc || "Nenhuma descrição definida"}`,
          { ephemeralExpiration: 86400 }
        );
      }

      // Comando: .descrição-chat
      if (fullMessage.startsWith(`${PREFIX}descrição-chat`)) {
        await sendReact("💬");
        return socket.sendMessage(
          remoteJid, 
          { text: groupMetadata.desc || "Este grupo não possui descrição" },
          { ephemeralExpiration: 0 }
        );
      }

      // Comando: .descrição-edit
      if (fullMessage.startsWith(`${PREFIX}descrição-edit`)) {
        if (!isAdmin) {
          await sendReact("⛔");
          return sendReply("Você precisa ser admin para editar a descrição!");
        }

        const newDescription = fullMessage.replace(`${PREFIX}descrição-edit`, '').trim();
        
        if (!newDescription) {
          await sendReact("❓");
          return sendReply(
            `Digite a nova descrição junto com o comando!\nExemplo:\n${PREFIX}descrição-edit Olá, esta é a nova descrição do grupo`,
            { ephemeralExpiration: 86400 }
          );
        }

        await socket.groupUpdateDescription(remoteJid, newDescription);
        await sendReact("✅");
        return sendReply(
          `✅ Descrição do grupo atualizada com sucesso!\n\nNova descrição:\n${newDescription}`,
          { ephemeralExpiration: 86400 }
        );
      }

    } catch (error) {
      console.error("Erro no comando descrição:", error);
      await sendReact("❌");
      return sendReply("❌ Ocorreu um erro ao processar o comando.");
    }
  },
};