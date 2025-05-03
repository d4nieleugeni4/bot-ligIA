const { PREFIX } = require(`${BASE_DIR}/config`);
const {
  InvalidParameterError,
} = require(`${BASE_DIR}/errors/InvalidParameterError`);

module.exports = {
  name: "chatadm",
  description: "Ativa/desativa o modo somente administradores podem enviar mensagens",
  commands: ["chatadm", "onlyadmins", "somenteadmins"],
  usage: `${PREFIX}chatadm on/off`,
  handle: async ({ args, socket, remoteJid, sendReply, sendSuccessReact, sendWarningReact }) => {
    if (!args.length) {
      throw new InvalidParameterError(
        `Você precisa especificar "on" (ativar) ou "off" (desativar)!\nExemplo: ${PREFIX}chatadm on`
      );
    }

    const action = args[0].toLowerCase();
    const validActions = ["on", "off"];

    if (!validActions.includes(action)) {
      throw new InvalidParameterError(
        `Comando inválido! Use "${PREFIX}chatadm on" ou "${PREFIX}chatadm off"`
      );
    }

    try {
      // Verifica o status atual do grupo
      const groupMetadata = await socket.groupMetadata(remoteJid);
      const currentMode = groupMetadata.announce ? "on" : "off";

      if (action === currentMode) {
        await sendWarningReact();
        await sendReply(`⚠️ O modo chatadm já está ${action === "on" ? "ativado" : "desativado"}!`);
        return;
      }

      // Atualiza as configurações do grupo
      await socket.groupSettingUpdate(
        remoteJid,
        action === "on" ? "announcement" : "not_announcement"
      );

      await sendSuccessReact();
      const status = action === "on" ? "ativado" : "desativado";
      await sendReply(`✅ Modo chatadm foi ${status} com sucesso!`);
    } catch (error) {
      console.error("Erro ao alterar modo chatadm:", error);
      await sendReply(
        "❌ Erro ao configurar. Verifique se:\n" +
        "1. Eu sou administrador do grupo\n" +
        "2. Você é administrador do grupo"
      );
    }
  },
};