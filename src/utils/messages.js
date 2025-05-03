
const { BOT_NAME, PREFIX } = require("../config");

exports.waitMessage = "Carregando dados...";

exports.menuMessage = () => {
  const date = new Date();

  return `
┏━━⫸ ✮BEM VINDO!✮ ⫷━━┓
┃                       
┃➤ ${BOT_NAME}              
┃➤ Data: ${date.toLocaleDateString("pt-br")}              
┃➤ Hora: ${date.toLocaleTimeString("pt-br")}              
┃➤ Prefixo: ${PREFIX}           
┃                       
┗━━━━━「🪐」━━━━━┛

┏━━⫸ ★DONO (DN)★ ⫷━━┓
┃                      
┃➤ ${PREFIX}off               
┃➤ ${PREFIX}on                
┃                      
┗━━━━━「🌌」━━━━━┛

┏━━⫸ ✮ADMINS✮ ⫷━━┓
┃                      
┃➤ ${PREFIX}anti-link (on/off)    
┃➤ ${PREFIX}auto-responder (1/0)
┃➤ ${PREFIX}ban                
┃➤ ${PREFIX}hidetag            
┃➤ ${PREFIX}welcome (1/0)
┃➤ ${PREFIX}ban 
┃➤ ${PREFIX}add
┃➤ ${PREFIX}admin (1/0)
┃➤ ${PREFIX}onlyadm (1/0)
┃➤ ${PREFIX}blacklist (list/limp)
┃➤ ${PREFIX}antimedia (on/off)
┃➤ ${PREFIX}antiaudio (on/off)
┃➤ ${PREFIX}antisticker (on/off)
┃➤ ${PREFIX}antipalavrao (on/off)
┃                      
┗━━━━━「⭐」━━━━━┛

┏━━⫸ ✮MENU✮ ⫷━━┓
┃
┃➤ ${PREFIX}convite                         
┃➤ ${PREFIX}ping   
┃➤ ${PREFIX}descrição 
┃➤ ${PREFIX}gpinfo
┃                
┗━━━━━「🚀」━━━━━┛`;
};