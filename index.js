
const { connect } = require("./src/connection");
const { load } = require("./src/loader");
const { infoLog, bannerLog } = require("./src/utils/logger");

async function start() {
  try {
    bannerLog();
    infoLog("Iniciando meus componentes internos...");

    const socket = await connect();

    load(socket);
  } catch (error) {
    console.log(error);
  }
}

start();
