const { PREFIX } = require(`${BASE_DIR}/config`);

module.exports = {
  name: "gp-info",
  description: "Mostra informações detalhadas sobre o grupo",
  commands: ["gpinfo", "grupoinfo", "infogrupo"],
  usage: `${PREFIX}gp-info`,
  handle: async ({ socket, remoteJid, sendSuccessReply, sendReact }) => {
    try {
      // Adiciona reação de confirmação
      await sendReact("✅");
      
      // Obtém e gera os dados do grupo
      const groupMetadata = await socket.groupMetadata(remoteJid);
      const inviteCode = await socket.groupInviteCode(remoteJid).catch(() => null);
      
      // Formatação dos dados
      const info = `
*🏷️ Nome:* ${groupMetadata.subject}
*🆔 ID:* ${groupMetadata.id}
*👑 Criador:* @${groupMetadata.owner.split('@')[0]}
*👥 Participantes:* ${groupMetadata.participants.length} membros
*📅 Criação:* ${new Date(groupMetadata.creation * 1000).toLocaleDateString()}
*📝 Descrição:* ${groupMetadata.desc || "Nenhuma descrição"}

*🔗 Link do grupo:* ${inviteCode ? `https://chat.whatsapp.com/${inviteCode}` : "Não foi possível gerar o link"}
      `.trim();

      // Envia com menção ao dono
      await socket.sendMessage(
        remoteJid,
        {
          text: info,
          mentions: [groupMetadata.owner]
        },
        { ephemeralExpiration: 86400 } // Opcional: some em 24h
      );

    } catch (error) {
      console.error("Erro no gp-info:", error);
      await sendReact("❌");
      await sendSuccessReply("⚠️ Falha ao obter dados do grupo!");
    }
  },
};