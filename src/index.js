const NodeCache = require("node-cache");
const { connect } = require("./connection");
const { load } = require("./loader");
const { infoLog, bannerLog, errorLog, warningLog } = require("./utils/logger");

const safeLoad = async (socket, groupCache, retryCount = 0) => {
  const MAX_RETRIES = 5;
  const RETRY_DELAY = 10000;

  try {
    load(socket, groupCache);
    return true;
  } catch (error) {
    errorLog(`Erro ao carregar o bot: ${error.message}`);

    if (retryCount < MAX_RETRIES) {
      warningLog(
        `Tentativa ${retryCount + 1}/${MAX_RETRIES} - Recriando conexão em ${
          RETRY_DELAY / 1000
        } segundos...`
      );

      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));

      const newSocket = await connect(groupCache);

      return await safeLoad(newSocket, groupCache, retryCount + 1);
    } else {
      errorLog(
        `Número máximo de tentativas (${MAX_RETRIES}) atingido. O bot será encerrado.`
      );
      return false;
    }
  }
};

async function start() {
  try {
    bannerLog();
    infoLog("Iniciando meus componentes internos...");

    const groupCache = new NodeCache({ stdTTL: 5 * 60, useClones: false });
    const socket = await connect(groupCache);

    const loadSuccess = await safeLoad(socket, groupCache);

    if (!loadSuccess) {
      errorLog("Não foi possível iniciar o bot após múltiplas tentativas.");
    }
  } catch (error) {
    errorLog(`Erro fatal: ${error.message}`);
    console.error(error);
  }
}

start();

