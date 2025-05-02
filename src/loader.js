/**
 * Loader Corrigido e Otimizado
 * - Garante captura de todos os eventos
 * - Compatível com anti-link
 * - Sistema de fallback para erros
 */
const { TIMEOUT_IN_MILLISECONDS_BY_EVENT } = require("./config");
const { onMessagesUpsert } = require("./middlewares/onMesssagesUpsert");
const { onGroupParticipantsUpdate } = require("./middlewares/onGroupParticipantsUpdate");
const path = require("path");
const { errorLog, warningLog } = require("./utils/logger");

// Cache global para grupos com anti-link ativo
global.ANTI_LINK_GROUPS = new Set();

exports.load = (socket) => {
  global.BASE_DIR = path.resolve(__dirname);

  // 1. Evento principal de mensagens (CRÍTICO para anti-link)
  socket.ev.on("messages.upsert", async ({ messages, type }) => {
    try {
      setTimeout(() => {
        // Filtra apenas mensagens novas (não históricas)
        if (type === "notify") {
          onMessagesUpsert({ socket, messages }).catch(e => {
            errorLog(`Erro no onMessagesUpsert: ${e.message}`);
          });
        }
      }, TIMEOUT_IN_MILLISECONDS_BY_EVENT);
    } catch (e) {
      errorLog(`Falha crítica no messages.upsert: ${e.message}`);
    }
  });

  // 2. Evento de atualização de grupos (para comandos de moderação)
  socket.ev.on("group-participants.update", async (data) => {
    setTimeout(() => {
      onGroupParticipantsUpdate({ socket, groupParticipantsUpdate: data })
        .catch(e => warningLog(`Erro em group-participants: ${e.message}`));
    }, TIMEOUT_IN_MILLISECONDS_BY_EVENT);
  });

  // 3. Evento de exclusão (para feedback do anti-link)
  socket.ev.on("messages.delete", async (data) => {
    if (data.keys[0]?.remoteJid?.endsWith('@g.us')) {
      console.log('[ANTI-LINK] Mensagem deletada:', data.keys[0].id);
    }
  });

  // 4. Fallback para erros globais
  socket.ev.on("connection.update", (update) => {
    if (update.connection === "close") {
      warningLog("Conexão perdida, tentando reconectar...");
    }
  });

  // 5. Log de eventos (debug)
  if (process.env.DEBUG === "true") {
    socket.ev.on("creds.update", () => {});
    socket.ev.on("messages.reaction", (data) => {
      console.debug("[DEBUG] Reaction:", data);
    });
  }
};
