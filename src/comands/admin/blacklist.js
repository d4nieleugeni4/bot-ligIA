// blacklist.js
const { PREFIX } = require(`${BASE_DIR}/config`);
const fs = require('fs');
const path = require('path');
const { toUserJid, onlyNumbers } = require(`${BASE_DIR}/utils`);

// Caminho para o arquivo JSON da blacklist
const BLACKLIST_PATH = path.join(BASE_DIR, 'data', 'blacklist.json');

// Garante que o arquivo de blacklist existe
function ensureBlacklistFile() {
  if (!fs.existsSync(BLACKLIST_PATH)) {
    fs.writeFileSync(BLACKLIST_PATH, JSON.stringify([], null, 2));
  }
}

// Obtém a lista de números na blacklist
function getBlacklist() {
  ensureBlacklistFile();
  return JSON.parse(fs.readFileSync(BLACKLIST_PATH));
}

module.exports = {
  name: "blacklist",
  description: "Gerencia a blacklist de números banidos",
  commands: ["blacklist"],
  usage: `${PREFIX}blacklist list - Lista números na blacklist\n${PREFIX}blacklist limp - Remove todos da blacklist do grupo`,
  
  handle: async ({
    args,
    socket,
    remoteJid,
    sendReply,
    sendSuccessReact,
    sendText
  }) => {
    const subCommand = args[0]?.toLowerCase();
    
    if (!subCommand) {
      throw new InvalidParameterError("Use: list (para listar) ou limp (para limpar o grupo)");
    }
    
    if (subCommand === "list") {
      // Listar números na blacklist
      const blacklist = getBlacklist();
      
      if (blacklist.length === 0) {
        return await sendReply("A blacklist está vazia.");
      }
      
      const listText = "📜 *Blacklist de Números* 📜\n\n" + 
        blacklist.map(num => `- ${num}`).join("\n");
      
      return await sendReply(listText);
    }
    
    if (subCommand === "limp") {
      // Limpar membros da blacklist do grupo
      const blacklist = getBlacklist();
      if (blacklist.length === 0) {
        return await sendReply("A blacklist está vazia. Nenhum membro para banir.");
      }
      
      const { participants } = await socket.groupMetadata(remoteJid);
      const membersToBan = participants.filter(member => 
        blacklist.includes(onlyNumbers(member.id))
      ).map(member => member.id);
      
      if (membersToBan.length === 0) {
        return await sendReply("✅ Grupo já está limpo! Nenhum membro da blacklist encontrado.");
      }
      
      // Banir todos os membros da blacklist
      await socket.groupParticipantsUpdate(
        remoteJid,
        membersToBan,
        "remove"
      );
      
      await sendSuccessReact();
      
      const banText = `🚫 *${membersToBan.length} membro(s) banido(s)* por estarem na blacklist:\n\n` +
        membersToBan.map(jid => `- ${onlyNumbers(jid)}`).join("\n");
      
      return await sendReply(banText);
    }
    
    throw new InvalidParameterError("Subcomando inválido! Use 'list' ou 'limp'.");
  },
};