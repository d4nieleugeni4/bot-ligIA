// divulgar.js
const { PREFIX } = require(`${BASE_DIR}/config`);
const path = require('path');
const fs = require('fs');

// Configuração de caminhos
const MESSAGES_DIR = path.join(BASE_DIR, 'src', 'mensagens');
const MESSAGES_PATH = path.join(MESSAGES_DIR, 'divulgaçoes.json');
const activeIntervals = {};

// Cria arquivo padrão se não existir
function createDefaultFile() {
  const defaultContent = {
    "exemplo": {
      "message": "📢 Esta é uma mensagem de exemplo! Edite no arquivo JSON.",
      "times": ["08:00", "12:00", "16:00"],
      "active": false
    }
  };

  if (!fs.existsSync(MESSAGES_DIR)) {
    fs.mkdirSync(MESSAGES_DIR, { recursive: true });
  }

  fs.writeFileSync(MESSAGES_PATH, JSON.stringify(defaultContent, null, 2));
  return defaultContent;
}

// Carrega mensagens com tratamento de erro
function loadMessages() {
  try {
    if (!fs.existsSync(MESSAGES_PATH)) {
      return createDefaultFile();
    }

    const fileContent = fs.readFileSync(MESSAGES_PATH, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error) {
    console.error('Erro ao carregar mensagens:', error);
    return createDefaultFile(); // Recria se estiver corrompido
  }
}

module.exports = {
  name: "divulgar",
  description: "Ativa/desativa divulgações automáticas",
  commands: ["divulgar"],
  usage: `${PREFIX}divulgar {nome} [on/off]`,
  handle: async ({ socket, webMessage, remoteJid, sendReply, fullArgs }) => {
    try {
      // Extração dos argumentos
      const nameMatch = fullArgs.match(/\{(.+?)\}/);
      const actionMatch = fullArgs.match(/(on|off)$/i);

      if (!nameMatch || !actionMatch) {
        return await sendReply(`🔧 Formato correto:\n${PREFIX}divulgar {nome} on/off\nEx: ${PREFIX}divulgar {exemplo} on`);
      }

      const messageName = nameMatch[1].trim();
      const action = actionMatch[0].toLowerCase();

      // Verificação de admin
      const metadata = await socket.groupMetadata(remoteJid);
      const sender = webMessage?.key?.participant;
      const isAdmin = metadata.participants.some(p => p.id === sender && p.admin);

      if (!isAdmin) return await sendReply('🚫 Apenas administradores!');

      // Carrega mensagens
      const messages = loadMessages();

      // Verifica existência
      if (!messages[messageName]) {
        const available = Object.keys(messages).join(', ') || 'Nenhuma mensagem';
        return await sendReply(`📌 "${messageName}" não existe!\nDisponíveis: ${available}`);
      }

      // Processa ação
      if (action === 'on') {
        // Cancela existente
        if (activeIntervals[messageName]) {
          clearInterval(activeIntervals[messageName]);
          delete activeIntervals[messageName];
        }

        // Função de envio
        const sendMessage = () => {
          const now = new Date();
          const currentTime = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
          
          if (messages[messageName].times.includes(currentTime)) {
            socket.sendMessage(remoteJid, { text: messages[messageName].message })
              .catch(err => console.error('Erro ao enviar:', err));
          }
        };

        // Agenda verificação a cada minuto
        activeIntervals[messageName] = setInterval(sendMessage, 60000);
        sendMessage(); // Verifica imediatamente

        // Atualiza status
        messages[messageName].active = true;
        fs.writeFileSync(MESSAGES_PATH, JSON.stringify(messages, null, 2));

        return await sendReply(`✅ "${messageName}" ATIVADA!\nHorários: ${messages[messageName].times.join(', ')}`);
      } 
      else { // OFF
        if (activeIntervals[messageName]) {
          clearInterval(activeIntervals[messageName]);
          delete activeIntervals[messageName];
        }

        messages[messageName].active = false;
        fs.writeFileSync(MESSAGES_PATH, JSON.stringify(messages, null, 2));

        return await sendReply(`✅ "${messageName}" DESATIVADA!`);
      }

    } catch (error) {
      console.error('Erro no comando:', error);
      return await sendReply('⚠️ Erro interno! Verifique o formato.');
    }
  }
};