// Supports ES6
// import { create, Whatsapp } from 'venom-bot';
const venom = require('venom-bot');
const { helpAdmin } = require('./functions/all');
const functions = require('./functions/all');


venom
  .create({
    session: process.env.SESSION_NAME, //name of session
    multidevice: true, // for version not multidevice use false.(default: true)
    headless: true, // Mostra o chrome aberto = false
    devtools: false, // ferramentas para dev
    debug: false, // debug

  })
  .then((client) => start(client))
  .catch((error) => {
    console.error(error);
  });

async function start(client) {
  await client.onAnyMessage(async (message) => {

    // Verificar se a mensagem é texto (chat) e se começa com '/' pois ai será um comando
    if (message.type == 'chat' && message.body.substring(0,1) == '/') {
      
      // Pega o comando do corpo da mensagem
      var command = message.body.split(" ", 1);

      // Cria um array com o corpo da mensagem e retira o primeiro elemento do array que é o comando, sobrando apenas a mensagem ou parametros da função
      var arrayMsg = message.body.split(" ");
      arrayMsg.shift();

      // transforma o array em uma unica string
      var parameter = '';
      arrayMsg.forEach((element) => {
        parameter = parameter + ' ' + element;
      });

      // Retira o 1º caractere da msg pois é um 'espaço' por causa do forEach, acredito que seja melhor do que usar if a cada loop no forEach
      parameter = parameter.substring(1);
    }

    // Comandos em grupos

    // COMANDO ADMIN -----------------

    // Comando para adicionar novos admin type 2
    if (command == '/novoAdmin' && message.isGroupMsg === true) {

      // Chama a função
      await functions.newAdmin(client, message, parameter).catch((error) => {
        console.log(error);
      });

    }

    // Comando para remover um admin type 2
    if (command == '/removeAdmin' && message.isGroupMsg === true) {

      // Chama a função
      await functions.delAdmin(client, message, parameter).catch((error) => {
        console.log(error);
      });

    }

    

    // Comando para mencionar todos os membros do grupo
    if (command == '/guerra' && message.isGroupMsg === true) {

      // Chama a função
      await functions.getAllMembers(client, message, parameter).catch((error) => {
        console.log(error);
      });

    }

    // ---------------------------------

    // Comando que inicia o registro do usuario no banco de cados
    if (command == '/iniciar' && message.isGroupMsg === true) {

        // Chama a função para verificar se o usuario já existe no banco de dados, caso não, irá ser registrado
        await functions.userInit(client, message).catch((error) => {
          console.log(error);
        });
    }

    // Comando help, mostra todos os comandos disponiveis
    if (command == '/help' && message.isGroupMsg === true) {

        let dataMsgAdmin = await helpAdmin(message).catch((error) => {
          console.log(error);
        });

        dataMsg = `
*Todos os comandos devem ser usados diretamente no grupo* 

*/iniciar* -> 
*-* Registra o seu numero no banco de dados do bot.

*# ---------------------- #*
*# ---------------------- #*

*/definirCastelo nome_do_castelo* ->
*-* Anexa o nome do seu castelo ao seu numero whats no bot

exemplo: */definirCastelo Nick Name*

*# ---------------------- #*

*/statusEscudo On ou Off* ->
*-* Ativa ou desativa as notificações que você recebera caso alguem veja seu castelo sem escudo!

exemplo: */statusEscudo On*

*# ---------------------- #*

*/semEscudo nome_do_castelo* ->
*-* Comando para notificar o dono do castelo que está sem escudo!

exemplo: */semEscudo Fulano X*

*# ---------------------- #*
*# ---------------------- #*
*# ---------------------- #*
*# ---------------------- #*

*/infernalDefinirTempo 0-23* ->
*-* Define o horário que será permitido receber notificações.
*0* = Horário minimo - *23* = Horário máximo 

exemplo: */infernalDefinirTempo 8-22*

*-* Nesse exemplo, você receberá notificações
apartir das *8h* da manhã até às *22h* da noite.

*# ---------------------- #*

*/statusOrbesVermelhoPesquisa On ou Off* ->
*-* Ativa ou Desativa as notificações desse infernal.

exemplo: */statusOrbesVermelhoPesquisa Off*

*# ---------------------- #*

*/statusOrbesVermelhoPacto On ou Off* ->
*-* Ativa ou Desativa as notificações desse infernal.

exemplo: */statusOrbesVermelhoPacto On*

*# ---------------------- #*

*/statusOrbesVermelhoTropa On ou Off* ->
*-* Ativa ou Desativa as notificações desse infernal.

exemplo: */statusOrbesVermelhoTropa On*

*# ---------------------- #*

*/statusOrbesAmareloPesquisa On ou Off* ->
*-* Ativa ou Desativa as notificações desse infernal.

exemplo: */statusOrbesAmareloPesquisa Off*

*# ---------------------- #*

*/statusOrbesAmareloPacto On ou Off* ->
*-* Ativa ou Desativa as notificações desse infernal.

exemplo: */statusOrbesAmareloPacto On*

*# ---------------------- #*

*/statusOrbesAmareloTropa On ou Off* ->
*-* Ativa ou Desativa as notificações desse infernal.

exemplo: */statusOrbesAmareloTropa On*

*# ---------------------- #*

*/statusDcPesquisa On ou Off* ->
*-* Ativa ou Desativa as notificações desse infernal.

exemplo: */statusDcPesquisa On*

*# ---------------------- #*

*/statusDcPacto On ou Off* ->
*-* Ativa ou Desativa as notificações desse infernal.

exemplo: */statusDcPacto Off*

*# ---------------------- #*

*/statusVigilantePesquisa On ou Off* ->
*-* Ativa ou Desativa as notificações desse infernal.

exemplo: */statusDcPesquisa Off*

*# ---------------------- #*

*/statusVigilantePacto On ou Off* ->
*-* Ativa ou Desativa as notificações desse infernal.

exemplo: */statusDcPacto On*

*# ---------------------- #*

*/statusNucleoPesquisa On ou Off* ->
*-* Ativa ou Desativa as notificações desse infernal.

exemplo: */statusNucleoPesquisa On*

*# ---------------------- #*

*/statusNucleoPacto On ou Off* ->
*-* Ativa ou Desativa as notificações desse infernal.

exemplo: */statusNucleoPacto On*

*# ---------------------- #*

*/statusNucleoTropa On ou Off* ->
*-* Ativa ou Desativa as notificações desse infernal.

exemplo: */statusNucleoTropa On*

*# ---------------------- #*
*# ---------------------- #*
*# ---------------------- #*
*# ---------------------- #*

*/orbesVermelhoPesquisa* ->
*-* Notifica a todos que está tendo infernal de *pesquisa* com *orbes vermelho*.

*# ---------------------- #*

*/orbesVermelhoPacto* ->
*-* Notifica a todos que está tendo infernal de *pacto* com *orbes vermelho*.

*# ---------------------- #*

*/orbesVermelhoTropa* ->
*-* Notifica a todos que está tendo infernal de *tropa* com *orbes vermelho*.

*# ---------------------- #*

*/orbesAmareloPesquisa* ->
*-* Notifica a todos que está tendo infernal de *pesquisa* com *orbes amarelo*.

*# ---------------------- #*

*/orbesAmareloPacto* ->
*-* Notifica a todos que está tendo infernal de *pacto* com *orbes amarelo*.

*# ---------------------- #*

*/orbesAmareloTropa* ->
*-* Notifica a todos que está tendo infernal de *tropa* com *orbes amarelo*.

*# ---------------------- #*

*/dcPesquisa* ->
*-* Notifica a todos que está tendo infernal de *pesquisa* com *Dragão do Caos*.

*# ---------------------- #*

*/dcPacto* ->
*-* Notifica a todos que está tendo infernal de *pacto* com *Dragão do Caos*.

*# ---------------------- #*

*/vigilantePesquisa* ->
*-* Notifica a todos que está tendo infernal de *pesquisa* com *Vigilante*.

*# ---------------------- #*

*/vigilantePacto* ->
*-* Notifica a todos que está tendo infernal de *pacto* com *Vigilante*.

*# ---------------------- #*

*/nucleoPesquisa* ->
*-* Notifica a todos que está tendo infernal de *pesquisa* com *Nucleo do caos*.

*# ---------------------- #*

*/nucleoPacto* ->
*-* Notifica a todos que está tendo infernal de *pacto* com *Nucleo do caos*.

*# ---------------------- #*

*/nucleoTropa* ->
*-* Notifica a todos que está tendo infernal de *tropa* com *Nucleo do caos*.

*# ---------------------- #*

        `;

        // Se for admin, recebe os comandos de admin
        if (dataMsgAdmin != false) {
          await client.reply(message.sender.id, dataMsgAdmin, message.id).catch((error) => {
            console.log(error);
          });
        }

        // Envia os comandos normais
        await client.reply(message.sender.id, dataMsg, message.id).catch((error) => {
          console.log(error);
        });
    }


    // Comandos para notificar castelos em caso de ver sem escudo

    // Comando para adicionar o nome do castelo ao numero registrado no bot
    if (command == '/definirCastelo' && message.isGroupMsg === true) {

      // Chama a função para gravar no banco de dados
      await functions.setCastle(client, message, parameter).catch((error) => {
        console.log(error);
      });

    }

    // Comando que define o horario que é permitido notificações de guerra.
    if (command == '/guerraDefinirTempo' && message.isGroupMsg === true) {

      // Chama a função para gravar no banco de dados.
      await functions.setTimeWar(client, message, parameter).catch((error) => {
        console.log(error);
      });

    }

    // Comando que liga e desliga as notificações de guerra em caso de castelos sem escudo 
    if (command == '/statusEscudo' && message.isGroupMsg === true) {

      // Chama a função para definir o status do infernal de pesquisa com orbes vermelho
      await functions.setStatusShield(client, message, parameter).catch((error) => {
        console.log(error);
      });

    }

    // Comando para notificar que o castelo está sem escudo!
    if (command == '/semEscudo' && message.isGroupMsg === true) {

      // Chama a função
      await functions.notifyCastle(client, message, parameter).catch((error) => {
        console.log(error);
      });

    }


    // -------------------------------------------------------------------
    
    // Comando que define o horario que é permitido notificações de infernais.
    if (command == '/infernalDefinirTempo' && message.isGroupMsg === true) {

      // Chama a função para gravar no banco de dados.
      await functions.setTimeInfernal(client, message, parameter).catch((error) => {
        console.log(error);
      });

    }

    // Comandos de Status

    // Comando que liga e desliga as notificações dos infernais de pesquisa com Orbes vermelho 
    if (command == '/statusOrbesVermelhoPesquisa' && message.isGroupMsg === true) {

      // Chama a função para definir o status do infernal de pesquisa com orbes vermelho
      await functions.setStatusOrbsRedReasearch(client, message, parameter).catch((error) => {
        console.log(error);
      });

    }

    // Comando que liga e desliga as notificações dos infernais de pacto com Orbes vermelho 
    if (command == '/statusOrbesVermelhoPacto' && message.isGroupMsg === true) {

      // Chama a função para definir o status do infernal de pacto com orbes vermelho
      await functions.setStatusOrbsRedPact(client, message, parameter).catch((error) => {
        console.log(error);
      });

    }

    // Comando que liga e desliga as notificações dos infernais de tropa com Orbes vermelho 
    if (command == '/statusOrbesVermelhoTropa' && message.isGroupMsg === true) {

      // Chama a função para definir o status do infernal de tropa com orbes vermelho
      await functions.setStatusOrbsRedTroop(client, message, parameter).catch((error) => {
        console.log(error);
      });

    }

    // Comando que liga e desliga as notificações dos infernais de pesquisa com Orbes amarelo 
    if (command == '/statusOrbesAmereloPesquisa' && message.isGroupMsg === true) {

      // Chama a função para definir o status do infernal de pesquisa com orbes amarelo
      await functions.setStatusOrbsYellowReasearch(client, message, parameter).catch((error) => {
        console.log(error);
      });

    }

    // Comando que liga e desliga as notificações dos infernais de pacto com Orbes amarelo 
    if (command == '/statusOrbesAmareloPacto' && message.isGroupMsg === true) {

      // Chama a função para definir o status do infernal de pacto com orbes amarelo
      await functions.setStatusOrbsYellowPact(client, message, parameter).catch((error) => {
        console.log(error);
      });

    }

    // Comando que liga e desliga as notificações dos infernais de tropa com Orbes amarelo
    if (command == '/statusOrbesAmareloTropa' && message.isGroupMsg === true) {

      // Chama a função para definir o status do infernal de tropa com orbes amarelo
      await functions.setStatusOrbsYellowTroop(client, message, parameter).catch((error) => {
        console.log(error);
      });

    }

    // Comando que liga e desliga as notificações dos infernais de pesquisa com Dragão do Caos
    if (command == '/statusDcPesquisa' && message.isGroupMsg === true) {

      // Chama a função para definir o status do infernal de pesquisa com Dragão do Caos
      await functions.setStatusDcResearch(client, message, parameter).catch((error) => {
        console.log(error);
      });

    }

    // Comando que liga e desliga as notificações dos infernais de pacto com Dragão do Caos
    if (command == '/statusDcPacto' && message.isGroupMsg === true) {

      // Chama a função para definir o status do infernal de pacto com Dragão do Caos
      await functions.setStatusDcPact(client, message, parameter).catch((error) => {
        console.log(error);
      });

    }

    // Comando que liga e desliga as notificações dos infernais de pesquisa com Vigilante
    if (command == '/statusVigilantePesquisa' && message.isGroupMsg === true) {

      // Chama a função para definir o status do infernal de pesquisa com Vigilante
      await functions.setStatusDcResearch(client, message, parameter).catch((error) => {
        console.log(error);
      });

    }

    // Comando que liga e desliga as notificações dos infernais de pacto com Vigilante
    if (command == '/statusVigilantePacto' && message.isGroupMsg === true) {

      // Chama a função para definir o status do infernal de pacto com Vigilante
      await functions.setStatusDcPact(client, message, parameter).catch((error) => {
        console.log(error);
      });

    }

    // Comando que liga e desliga as notificações dos infernais de pesquisa com Nucleo do caos
    if (command == '/statusNucleoPesquisa' && message.isGroupMsg === true) {

      // Chama a função para definir o status do infernal de pesquisa com Nucleo do caos
      await functions.setStatusCoreResearch(client, message, parameter).catch((error) => {
        console.log(error);
      });

    }

    // Comando que liga e desliga as notificações dos infernais de pacto com Nucleo do caos
    if (command == '/statusNucleoPacto' && message.isGroupMsg === true) {

      // Chama a função para definir o status do infernal de pacto com Nucleo do caos
      await functions.setStatusCorePact(client, message, parameter).catch((error) => {
        console.log(error);
      });

    }

    // Comando que liga e desliga as notificações dos infernais de tropa com Nucleo do caos
    if (command == '/statusNucleoTropa' && message.isGroupMsg === true) {

      // Chama a função para definir o status do infernal de tropa com Nucleo do caos
      await functions.setStatusCoreTroop(client, message, parameter).catch((error) => {
        console.log(error);
      });

    }


    // Comandos de Notificar

    // Comando para notificar que está tendo infernal de pesquisa com orbes vermelhos
    if (command == '/orbesVermelhoPesquisa' && message.isGroupMsg === true) {

      // Chama a função
      await functions.notifyOrbsRedResearch(client, message).catch((error) => {
        console.log(error);
      });

    }

    // Comando para notificar que está tendo infernal de pacto com orbes vermelhos
    if (command == '/orbesVermelhoPacto' && message.isGroupMsg === true) {

      // Chama a função
      await functions.notifyOrbsRedPact(client, message).catch((error) => {
        console.log(error);
      });

    }

    // Comando para notificar que está tendo infernal de tropa com orbes vermelhos
    if (command == '/orbesVermelhoTropa' && message.isGroupMsg === true) {

      // Chama a função
      await functions.notifyOrbsRedTroop(client, message).catch((error) => {
        console.log(error);
      });

    }

    // Comando para notificar que está tendo infernal de pesquisa com orbes Amarelo
    if (command == '/orbesAmareloPesquisa' && message.isGroupMsg === true) {

      // Chama a função
      await functions.notifyOrbsYellowResearch(client, message).catch((error) => {
        console.log(error);
      });

    }

    // Comando para notificar que está tendo infernal de pacto com orbes Amarelo
    if (command == '/orbesAmareloPacto' && message.isGroupMsg === true) {

      // Chama a função
      await functions.notifyOrbsYellowPact(client, message).catch((error) => {
        console.log(error);
      });

    }

    // Comando para notificar que está tendo infernal de tropa com orbes Amarelo
    if (command == '/orbesAmareloTropa' && message.isGroupMsg === true) {

      // Chama a função
      await functions.notifyOrbsYellowTroop(client, message).catch((error) => {
        console.log(error);
      });

    }

    // Comando para notificar que está tendo infernal de pesquisa com Dragão do Caos
    if (command == '/dcPesquisa' && message.isGroupMsg === true) {

      // Chama a função
      await functions.notifyDcResearch(client, message).catch((error) => {
        console.log(error);
      });

    }

    // Comando para notificar que está tendo infernal de pacto com Dragão do Caos
    if (command == '/dcPacto' && message.isGroupMsg === true) {

      // Chama a função
      await functions.notifyDcPact(client, message).catch((error) => {
        console.log(error);
      });

    }

    // Comando para notificar que está tendo infernal de pesquisa com Vigilante
    if (command == '/vigilantePesquisa' && message.isGroupMsg === true) {

      // Chama a função
      await functions.notifyVigilantResearch(client, message).catch((error) => {
        console.log(error);
      });

    }

    // Comando para notificar que está tendo infernal de pacto com Vigilante
    if (command == '/vigilantePacto' && message.isGroupMsg === true) {

      // Chama a função
      await functions.notifyVigilantPact(client, message).catch((error) => {
        console.log(error);
      });

    }

    // Comando para notificar que está tendo infernal de pesquisa com Nucleo do caos
    if (command == '/nucleoPesquisa' && message.isGroupMsg === true) {

      // Chama a função
      await functions.notifyCoreResearch(client, message).catch((error) => {
        console.log(error);
      });

    }

    // Comando para notificar que está tendo infernal de pacto com Nucleo do caos
    if (command == '/nucleoPacto' && message.isGroupMsg === true) {

      // Chama a função
      await functions.notifyCorePact(client, message).catch((error) => {
        console.log(error);
      });

    }

    // Comando para notificar que está tendo infernal de tropa com Nucleo do caos
    if (command == '/nucleoTropa' && message.isGroupMsg === true) {

      // Chama a função
      await functions.notifyCoreTroop(client, message).catch((error) => {
        console.log(error);
      });

    }



  }).catch((error) => {
    console.log(error);
  });
}
