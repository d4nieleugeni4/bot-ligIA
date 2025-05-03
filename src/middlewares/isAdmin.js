// src/middlewares/isAdmin.js
const { OWNER_NUMBER } = require("../config");

module.exports = async ({ socket, remoteJid, userJid }) => {
    try {
        if (userJid === `${OWNER_NUMBER}@s.whatsapp.net`) return true;
        
        const metadata = await socket.groupMetadata(remoteJid);
        const participant = metadata.participants.find(p => p.id === userJid);
        
        return participant?.admin === "admin" || participant?.admin === "superadmin";
    } catch (error) {
        console.error("Erro ao verificar admin:", error);
        return false;
    }
};