const { PREFIX } = require('../../config');

module.exports = {
    name: "groupinvite",
    description: "Envia o link de convite do grupo",
    commands: ["linkgrupo", "convite", "groupinvite"],
    usage: `${PREFIX}linkgrupo`,
    handle: async ({ socket, remoteJid, sendReply }) => {
        try {
            // 1. Obter o código de convite
            const inviteCode = await socket.groupInviteCode(remoteJid);
            
            // 2. Criar o link completo
            const inviteLink = `https://chat.whatsapp.com/${inviteCode}`;
            
            // 3. Enviar a mensagem formatada
            await sendReply(
                `📌 *Link de convite do grupo:*\n` +
                `${inviteLink}\n\n` +
                `Compartilhe com quem deseja adicionar!`
            );
            
        } catch (error) {
            console.error('Erro ao gerar link:', error);
            await sendReply(
                "❌ Não foi possível gerar o link. Verifique se:\n" +
                "1. Eu sou administrador\n" +
                "2. O grupo permite convites"
            );
        }
    }
};