/**
 * Logs
 */
const { version } = require("../../package.json");

exports.sayLog = (message) => {
  console.log("\x1b[36m[JARVIS | TALK]\x1b[0m", message);
};

exports.inputLog = (message) => {
  console.log("\x1b[30m[JARVIS | INPUT]\x1b[0m", message);
};

exports.infoLog = (message) => {
  console.log("\x1b[34m[JARVIS | INFO]\x1b[0m", message);
};

exports.successLog = (message) => {
  console.log("\x1b[32m[JARVIS | SUCCESS]\x1b[0m", message);
};

exports.errorLog = (message) => {
  console.log("\x1b[31m[JARVIS | ERROR]\x1b[0m", message);
};

exports.warningLog = (message) => {
  console.log("\x1b[33m[JARVIS | WARNING]\x1b[0m", message);
};

exports.bannerLog = () => {
  // Cores RGB modernas
  const red = '\x1b[38;2;255;90;90m';
  const blue = '\x1b[38;2;100;200;255m';
  const green = '\x1b[38;2;120;255;150m';
  const yellow = '\x1b[38;2;255;255;100m';
  const purple = '\x1b[38;2;180;100;255m';
  const reset = '\x1b[0m';

  // Função para tempo de atividade
  const getUptime = () => {
    const sec = Math.floor(process.uptime());
    const hours = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    return `${hours}h ${mins}m`;
  };

  // Seu banner original com símbolos - MODIFICADO PARA ENCAIXAR MELHOR
  console.log(`${red}╭───────────────────────────────────────────────╮${reset}`);
  console.log(`${red}│ ░▀█▀░█▀▀█░█▀▀▄░█░░░█░▀░█▀▀░░░░█▀▀▄░█▀▀█░▀▀█▀▀░│${reset}`);
  console.log(`${red}│ ░░█░░█░░█░█▄▄▀░█░░░█░█░█▄░░░░░█▄▄▀░█░░█░░░█░░░│${reset}`);
  console.log(`${red}│ █░█░░█▀▀█░█▀▄░░░█░█░░█░░▀█░░░░█▀▀▄░█░░█░░░█░░░│${reset}`);
  console.log(`${red}│ ▀█▀░░█░░█░█░░█░░░█░░░█░▄▄█░░░░█▄▄▀░█▄▄█░░░█░░░│${reset}`);
  console.log(`${red}╰───────────────────────────────────────────────╯${reset}`);
  
  // Informações com bordas alinhadas
  console.log(`${blue}┌───────────────────────────────────────────────┐${reset}`);
  console.log(`${blue}│ ${yellow}📅 ${new Date().toLocaleDateString()} ${blue}         │ ${yellow}⏱️ ${new Date().toLocaleTimeString()} ${blue}         │${reset}`);
  console.log(`${blue}│ ${purple}🔄 Uptime: ${green}${getUptime()} ${blue}     │ ${yellow}📞 ${green}55 24981321901 ${blue}    │${reset}`);
  console.log(`${blue}│ ${blue}💻 by: ${green}dn ${blue}${' '.repeat(31)}     │${reset}`);
  console.log(`${blue}└───────────────────────────────────────────────┘${reset}`);
};

 

      
 