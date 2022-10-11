// Express API
const express = require('express');

// Servidor
const app = express();

// Model Group (Obs: ../ pois está em uma pasta anterior)
const User = require('../models/User');
const Admin = require('../models/Admin');
const { Op } = require('sequelize');

// Diz pro servidor que irá receber em json
app.use(express.json());

// Básica de teste
app.get("/", async (req, res) => {
    res.send("Página inicial");
});


// Não há necessidade de usar o Express API mas já deixei pré-configurado para implementar uma possivel comunicação com algum outro bot, por exemplo do Telegram!
// ----------------------------------------------

// ---------------------------------------------

// Função que envia os comandos admin no comando /help

async function helpAdmin(message) {

    // Verifica se é admin
    let isAdmin = await checkAdmin(message.chat.id, message.sender.id).catch((error) => {
        console.log(error);
    });

    if (isAdmin[0] === true) {
        return `
        
        */novoAdmin* 551199887766 ->
        Comando + numero de celular sem o '+', 'espaços' ou '-'.

        *# --------------- #*

        */removeAdmin* 551199887766 ->
        Comando + numero de celular sem o '+', 'espaços' ou '-'.

        *# --------------- #*

        */guerra mensagem* ->
        Comando menciona todos os membros presentes no grupo.
        é possivel utilizar apenas */guerra* ou */guerra + mensagem*

        exemplo: */guerra* bora pessoal, WoW vai começar já, já.

        `
    } else {
        return false
    }

}

// Função para adicionar um novo admin
// Admins type 1, podem criar e remover admins type 2
async function newAdmin(client, message, parameter) {

    // Mensagem de retorno ao cliente
    let messageReturn = '';

    // Verifica se é admin
    let isAdmin = await checkAdmin(message.chat.id, message.sender.id).catch((error) => {
        console.log(error);
    });

    // Formata o numero para o padrão do whats
    let userId = parameter + '@c.us';

    // Se for admin, realiza a operação no banco de dados
    if (isAdmin[0] === true && isAdmin[1] === 1) {
        await Admin.findOrCreate({
            where: {
                group_id: message.chat.id,
                user_id: userId
            },
            defaults: {
                group_id: message.chat.id,
                user_id: userId,
                type_admin: 2,
                who_registered: message.sender.id
            }
        }).then((result) => {

            if (result[1] === true) {
                messageReturn = 'Novo admin adicionado com sucesso!';
            } else if (result[1] === false) {
                messageReturn = `Esse numero: ${parameter}, já está registrado como admin no bot!`;
            }

        }).catch((error) => {
            console.log(error);
        });
    } else {
        messageReturn = 'Você não tem permissão para usar esse comando!';
    }


    // Retorna uma mensagem ao cliente
    await client.reply(message.sender.id, messageReturn, message.id).catch((error) => {
        console.log(error);
    });

}

// Função para remover um admin.
async function delAdmin (client, message, parameter){

    // Mensagem de retorno
    let messageReturn = '';

    // Verifica se é admin
    let isAdmin = await checkAdmin(message.chat.id, message.sender.id).catch((error) => {
        console.log(error);
    });

    // Formata para o padrão do whats
    let userId = parameter + '@c.us';

    // Se for admin realiza a operação no banco de dados!
    if (isAdmin[0] === true && isAdmin[1] === 1) {

        await Admin.destroy({
            where: {
                group_id: message.chat.id,
                user_id: userId,
                type_admin: isAdmin[1]
            }
        }).then((result) => {
            console.log(result);
            messageReturn = 'Deu certo!';
        }).catch((error) => {
            console.log(error);
        });

    } else if (isAdmin[0] === 'null') {
        messageReturn = 'Você não tem permissão para remover esse admin';
    } else {
        messageReturn = 'Ocorreu um erro, verifique se digitou o comando corretamente!';
    }

    // Retorna uma mensagem ao cliente
    await client.reply(message.sender.id, messageReturn, message.id).catch((error) => {
        console.log(error);
    });
}

// Função para verificar se é admin

async function checkAdmin(groupId, userId) {

    // Recebe os valores do banco de dados para retornar a função que chamar
    let dataReturn = [];

    // Busca no banco de dados se é admin
    const find = await Admin.findOne({
        where: {
            group_id: groupId,
            user_id: userId
        } 
    }).then((result) => {
        if (result != null) {
            if (result.type_admin == 1 || result.type_admin == 2) {
                dataReturn.push(true);
                dataReturn.push(result.type_admin);
            } else {
                dataReturn.push('null');
            }
        } else {
            dataReturn.push('null');
        }
    }).catch((error) => {
        console.log(error);
    });
  
    // retorna os dados a função
    return dataReturn;
}


// Função admin para marcar todos os membros do grupo
async function getAllMembers(client, message, parameter) {

    // Verifica se o numero que enviou comando é Admin
    let isAdmin = await checkAdmin(message.chat.id, message.sender.id);

    if (isAdmin[0] === true) {

        // Pega o numero de todos os membros
        let allMembers = await client.getGroupMembersIds(message.chat.id);

        // Recebe a messagem que será enviada no grupo
        let dataMessage = '';

        // Recebe os numeros que seram mencionados no grupo
        let dataNumbers = [];

        allMembers.forEach((element) => {

            // Adiciona cada numero a mensagem
            dataMessage = dataMessage + ' ' + '@' + element.user;

            // Adiciona cada numero no array de numeros a ser enviado
            dataNumbers.push(element.user);

        });

        // Se o cliente mandar uma mensagem como parametro, será adicionado ao inicio.
        if (parameter != '') {
            dataMessage = parameter + dataMessage;
        }

        // Envia a mensagem no grupo com todos os membros mencionados
        await client.sendMentioned(message.chat.id, dataMessage, dataNumbers).catch((error) => {
            console.log(error);
        });

    }

}

// ----------------------------------------------

// Função para verificar o tempo atual e o tempo em que o comando de notificação foi chamado. retorna os numeros de membros a serem notificados
async function verifyTime(groupId, columnStatus) {
    const date = new Date();
    let hour = date.getHours();

    // Recebe os resultados dos membros encontrado no banco de dados
    let findResults = [];

    // Retorna os numeros dos membros a serem notificados.
    let usersReturns = [];

    // Busca todos os usuarios do grupo, registrado no banco de dados do bot
    await User.findAll({
        where: {
            group_id: groupId,
        }
    }).then((result) => {
        findResults = result;
    }).catch((error) => {
        console.log(error);
    });

    // Filtra em os usuarios achados, todos usuarios onde:
    // Se é permitido notificar (columnStatus) = 1 // 0 - Não permitido, 1 - Permitido
    // hora atual for maior que horario minimo permitido para notificar (infernal_time_start)
    // hora atual for menor que horario maximo permitido para notificar (infernal_time_end)
    Object.keys(findResults).forEach((key) => {
        if (findResults[key]['dataValues'][columnStatus] == 1 && hour >= findResults[key]['dataValues']['infernal_time_start'] && hour <= findResults[key]['dataValues']['infernal_time_end']) {
            usersReturns.push(findResults[key]['dataValues']['user_id']);
        }
    });

    // retorna os numeros para notificar
    return usersReturns;

}


// Verifica se o usuario está registrado no banco de dados do bot, caso não tiver a função fará o registro.
async function userInit(client, message) {

    // Variavel para receber a mensagem enviada ao usuario
    let messageReturn = '';

    // Variavel para receber a busca do banco de dados.
    let resultReturn = [];

    // Busca no banco de dados, caso não encontrar, ele registra com opções padrão.
    await User.findOrCreate({
        where: {
            group_id: message.chat.id,
            user_id: message.sender.id
        },
        defaults: {
            group_id: message.chat.id,
            user_id: message.sender.id,
            castle_id: null,
            war_time_start: 0,
            war_time_end: 0,
            shield_status: 0,
            infernal_time_start: 0,
            infernal_time_end: 0,
            orb_red_research_status: 0,
            orb_red_pact_status: 0,
            orb_red_troop_status: 0,
            orb_yellow_research_status: 0,
            orb_yellow_pact_status: 0,
            orb_yellow_troop_status: 0,
            dc_research_status: 0,
            dc_pact_status: 0,
            vigilant_research_status: 0,
            vigilant_pact_status: 0,
            core_research_status: 0,
            core_pact_status: 0,
            core_troop_status: 0
        }
    }).then((result)=>{
        resultReturn = result;
    }).catch((error) => {
        console.log(error);
    });


    // Verifica se foi registrado ou se já existia
    if (resultReturn[1] === true) {
        messageReturn = 'Usuario foi registrado!';
    }else if (resultReturn[1] === false){
        messageReturn = 'Usuario já está registrado!';
    }else {
        messageReturn = 'Verifique se digitou o comando corretamente!';
    }

    // Retorna uma mensagem ao cliente, modo: resposta a mensagem
    await client.reply(message.sender.id, messageReturn, message.id).catch((error) => {
        console.log(error);
    });

    // Retorna uma mensagem ao cliente, modo: resposta a mensagem
    await client.reply(message.sender.id, 'Digite no grupo o comando */help* pra saber quais comandos estão disponiveis!', message.id).catch((error) => {
        console.log(error);
    });

}

// Definir horario que é permitida as notificações de infernais
async function setTimeInfernal(client, message, parameter) {

    // Variavel para receber a mensagem do usuario
    let messageReturn = '';

    // pega o parametro da função e separa por '-' para pegar os valores de cada horario
    let timeSplit = parameter.split('-');
    let timeStart = parseInt(timeSplit[0]);
    let timeEnd = parseInt(timeSplit[1]);
    
    // Verifica se o numero é inteiro e grava no banco de dados
    if (Number.isInteger(timeStart) == true && Number.isInteger(timeEnd) == true) {

        await User.update({
            infernal_time_start: timeStart,
            infernal_time_end: timeEnd
        },{
            where: {
                group_id: message.chat.id,
                user_id: message.sender.id
            }
        }).catch((error) => {
            console.log(error);
        });

        messageReturn = 'Horario definido com sucesso!';

    }else {
        messageReturn = 'Vefique se digitou o comando certo! \nUse o comando */help*';
    }

    // Envia uma mensagem pro clientem, modo: resposta
    await client.reply(message.sender.id, messageReturn, message.id).catch((error) => {
        console.log(error);
    });

}


// Comandos de Castelo --------------------------------


// Função que define o nome do castelo no numero registrado no banco de dados do bot
async function setCastle(client, message, parameter) {

    // Variavel que recebe a mensagem de reposta para o cliente
    let messageReturn = ''

    // variavel que recebe o parametro para gravar no banco de dados
    let status = parameter;

    // Verifica se é um numero inteiro e grava no banco de dados
    if (status != '') {
        await User.update({
            castle_id: status
        },{
            where: {
                group_id: message.chat.id,
                user_id: message.sender.id
            }
        }).catch((error) => {
            console.log(error);
        });

        messageReturn = `Castelo definido com sucesso: ${status}`;
    } else {
        messageReturn = 'Ocorreu algum erro, verifique se digitou o comando corretamente!';
    }

    // Retorna uma mensagem para o cliente, modo: resposta.
    await client.reply(message.sender.id, messageReturn, message.id).catch((error) => {
        console.log(error);
    });

}

// Definir horario que é permitida as notificações de guerra
async function setTimeWar(client, message, parameter) {

    // Variavel para receber a mensagem do usuario
    let messageReturn = '';

    // pega o parametro da função e separa por '-' para pegar os valores de cada horario
    let timeSplit = parameter.split('-');
    let timeStart = parseInt(timeSplit[0]);
    let timeEnd = parseInt(timeSplit[1]);
    
    // Verifica se o numero é inteiro e grava no banco de dados
    if (Number.isInteger(timeStart) == true && Number.isInteger(timeEnd) == true) {

        await User.update({
            war_time_start: timeStart,
            war_time_end: timeEnd
        },{
            where: {
                group_id: message.chat.id,
                user_id: message.sender.id
            }
        }).catch((error) => {
            console.log(error);
        });

        messageReturn = 'Horario definido com sucesso!';

    }else {
        messageReturn = 'Vefique se digitou o comando certo! \nUse o comando */help*';
    }

    // Envia uma mensagem pro clientem, modo: resposta
    await client.reply(message.sender.id, messageReturn, message.id).catch((error) => {
        console.log(error);
    });

}

// Função que liga e desliga as notificações de guerra em caso de castelo sem escudo
async function setStatusShield(client, message, parameter) {

    // Variavel que recebe a mensagem de reposta para o cliente
    let messageReturn = ''

    // variavel que recebe o parametro para gravar no banco de dados
    let status = -1;

    if (parameter == 'On') {
        status = 1;
    }else if (parameter == 'Off') {
        status = 0;
    }else {
        messageReturn = 'Vefique se digitou o comando certo! \nUse o comando */help*'
    }

    // Verifica se é um numero inteiro e grava no banco de dados
    if (Number.isInteger(status) == true && status != -1) {
        await User.update({
            shield_status: status
        },{
            where: {
                group_id: message.chat.id,
                user_id: message.sender.id
            }
        }).catch((error) => {
            console.log(error);
        });

        messageReturn = 'Status alterado com sucesso!';
    }

    // Retorna uma mensagem para o cliente, modo: resposta.
    await client.reply(message.sender.id, messageReturn, message.id).catch((error) => {
        console.log(error);
    });

}

// Função para notificar que está tendo infernal de pacto com orbes vermelhos
async function notifyCastle(client, message, parameter) {

    // Recebe a mensagem que será retornada ao cliente
    let messageReturn = '';

    // Recebe o resultado da consulta no banco de dados
    let resultReturn = [];

    // Recebe os numeros que serão notificado
    let notifyNumber = [];

    // Se o parametro não estiver vazio, busca o nome do castelo no banco de dados e retorna os dados
    if (parameter != '') {
        await User.findAll({
            where: {
                castle_id: parameter
            }
        }).then((result) => {
            resultReturn = result
        }).catch((error) => {
            console.log(error);
            messageReturn = 'Ocorreu algum erro, verifique se digitou o comando corretamente!'
        });
    } else {
        messageReturn = 'Verifique se digitou o comando corretamente!';
    }

    // Se houve algum resultado do banco de dados, filtra as colunas e pega a coluna user_id com o numero do usuario
    if (resultReturn != []) {
        Object.keys(resultReturn).forEach((key) => {
           notifyNumber.push(resultReturn[key]['dataValues']['user_id']);
        });
    } else {
        messageReturn = 'Ocorreu algum erro, verifique se digitou o comando corretamente!';
    }

    // Se tiver algum numero, formata o numero para Mencionar no grupo e também enviar uma mensagem tiramente ao usuario dono do castelo
    if (notifyNumber != []) {
        notifyNumber.forEach((element) => {
            let number = element.replace('@c.us', '');
            let dataMessage = `O castelo de @${number} está sem escudo!`;
            let dataNumber = [];
            dataNumber.push(number);
            client.sendMentioned(message.chat.id, dataMessage, dataNumber).catch((error) => {
                console.log(error);
            });
            client.sendText(element, 'Seu castelo está sem escudo!').catch((error) => {
                console.log(error);
            });
        });
    } else {
        messageReturn = 'Ocorreu algum erro, verifique se digitou o comando corretamente!';
    }

}


// --------------------------------------------------------


// Funções de Status --------------------------------------------

// Função que liga e desliga as notificações dos infernais de pesquisa com orbes vermelhos
async function setStatusOrbsRedReasearch(client, message, parameter) {

    // Variavel que recebe a mensagem de reposta para o cliente
    let messageReturn = ''

    // variavel que recebe o parametro para gravar no banco de dados
    let status = -1;

    if (parameter == 'On') {
        status = 1;
    }else if (parameter == 'Off') {
        status = 0;
    }else {
        messageReturn = 'Vefique se digitou o comando certo! \nUse o comando */help*'
    }

    // Verifica se é um numero inteiro e grava no banco de dados
    if (Number.isInteger(status) == true && status != -1) {
        await User.update({
            orb_red_research_status: status
        },{
            where: {
                group_id: message.chat.id,
                user_id: message.sender.id
            }
        }).catch((error) => {
            console.log(error);
        });

        messageReturn = 'Status alterado com sucesso!';
    }

    // Retorna uma mensagem para o cliente, modo: resposta.
    await client.reply(message.sender.id, messageReturn, message.id).catch((error) => {
        console.log(error);
    });

}

// Função que liga e desliga as notificações dos infernais de pacto com orbes vermelhos
async function setStatusOrbsRedPact(client, message, parameter) {

    // Variavel que recebe a mensagem de reposta para o cliente
    let messageReturn = ''

    // variavel que recebe o parametro para gravar no banco de dados
    let status = -1;

    if (parameter == 'On') {
        status = 1;
    }else if (parameter == 'Off') {
        status = 0;
    }else {
        messageReturn = 'Vefique se digitou o comando certo! \nUse o comando */help*'
    }

    // Verifica se é um numero inteiro e grava no banco de dados
    if (Number.isInteger(status) == true && status != -1) {
        await User.update({
            orb_red_pact_status: status
        },{
            where: {
                group_id: message.chat.id,
                user_id: message.sender.id
            }
        }).catch((error) => {
            console.log(error);
        });

        messageReturn = 'Status alterado com sucesso!';
    }

    // Retorna uma mensagem para o cliente, modo: resposta.
    await client.reply(message.sender.id, messageReturn, message.id).catch((error) => {
        console.log(error);
    });

}

// Função que liga e desliga as notificações dos infernais de tropa com orbes vermelhos
async function setStatusOrbsRedTroop(client, message, parameter) {

    // Variavel que recebe a mensagem de reposta para o cliente
    let messageReturn = ''

    // variavel que recebe o parametro para gravar no banco de dados
    let status = -1;

    if (parameter == 'On') {
        status = 1;
    }else if (parameter == 'Off') {
        status = 0;
    }else {
        messageReturn = 'Vefique se digitou o comando certo! \nUse o comando */help*'
    }

    // Verifica se é um numero inteiro e grava no banco de dados
    if (Number.isInteger(status) == true && status != -1) {
        await User.update({
            orb_red_troop_status: status
        },{
            where: {
                group_id: message.chat.id,
                user_id: message.sender.id
            }
        }).catch((error) => {
            console.log(error);
        });

        messageReturn = 'Status alterado com sucesso!';
    }

    // Retorna uma mensagem para o cliente, modo: resposta.
    await client.reply(message.sender.id, messageReturn, message.id).catch((error) => {
        console.log(error);
    });

}

// Função que liga e desliga as notificações dos infernais de pesquisa com orbes amarelos
async function setStatusOrbsYellowReasearch(client, message, parameter) {

    // Variavel que recebe a mensagem de reposta para o cliente
    let messageReturn = ''

    // variavel que recebe o parametro para gravar no banco de dados
    let status = -1;

    if (parameter == 'On') {
        status = 1;
    }else if (parameter == 'Off') {
        status = 0;
    }else {
        messageReturn = 'Vefique se digitou o comando certo! \nUse o comando */help*'
    }

    // Verifica se é um numero inteiro e grava no banco de dados
    if (Number.isInteger(status) == true && status != -1) {
        await User.update({
            orb_yellow_research_status: status
        },{
            where: {
                group_id: message.chat.id,
                user_id: message.sender.id
            }
        }).catch((error) => {
            console.log(error);
        });

        messageReturn = 'Status alterado com sucesso!';
    }

    // Retorna uma mensagem para o cliente, modo: resposta.
    await client.reply(message.sender.id, messageReturn, message.id).catch((error) => {
        console.log(error);
    });

}

// Função que liga e desliga as notificações dos infernais de pacto com orbes amarelos
async function setStatusOrbsYellowPact(client, message, parameter) {

    // Variavel que recebe a mensagem de reposta para o cliente
    let messageReturn = ''

    // variavel que recebe o parametro para gravar no banco de dados
    let status = -1;

    if (parameter == 'On') {
        status = 1;
    }else if (parameter == 'Off') {
        status = 0;
    }else {
        messageReturn = 'Vefique se digitou o comando certo! \nUse o comando */help*'
    }

    // Verifica se é um numero inteiro e grava no banco de dados
    if (Number.isInteger(status) == true && status != -1) {
        await User.update({
            orb_yellow_pact_status: status
        },{
            where: {
                group_id: message.chat.id,
                user_id: message.sender.id
            }
        }).catch((error) => {
            console.log(error);
        });

        messageReturn = 'Status alterado com sucesso!';
    }

    // Retorna uma mensagem para o cliente, modo: resposta.
    await client.reply(message.sender.id, messageReturn, message.id).catch((error) => {
        console.log(error);
    });

}

// Função que liga e desliga as notificações dos infernais de tropa com orbes amarelos
async function setStatusOrbsYellowTroop(client, message, parameter) {

    // Variavel que recebe a mensagem de reposta para o cliente
    let messageReturn = ''

    // variavel que recebe o parametro para gravar no banco de dados
    let status = -1;

    if (parameter == 'On') {
        status = 1;
    }else if (parameter == 'Off') {
        status = 0;
    }else {
        messageReturn = 'Vefique se digitou o comando certo! \nUse o comando */help*'
    }

    // Verifica se é um numero inteiro e grava no banco de dados
    if (Number.isInteger(status) == true && status != -1) {
        await User.update({
            orb_yellow_troop_status: status
        },{
            where: {
                group_id: message.chat.id,
                user_id: message.sender.id
            }
        }).catch((error) => {
            console.log(error);
        });

        messageReturn = 'Status alterado com sucesso!';
    }

    // Retorna uma mensagem para o cliente, modo: resposta.
    await client.reply(message.sender.id, messageReturn, message.id).catch((error) => {
        console.log(error);
    });

}

// Função que liga e desliga as notificações dos infernais de pesquisa com Dragão do Caos
async function setStatusDcResearch(client, message, parameter) {

    // Variavel que recebe a mensagem de reposta para o cliente
    let messageReturn = ''

    // variavel que recebe o parametro para gravar no banco de dados
    let status = -1;

    if (parameter == 'On') {
        status = 1;
    }else if (parameter == 'Off') {
        status = 0;
    }else {
        messageReturn = 'Vefique se digitou o comando certo! \nUse o comando */help*'
    }

    // Verifica se é um numero inteiro e grava no banco de dados
    if (Number.isInteger(status) == true && status != -1) {
        await User.update({
            dc_research_status: status
        },{
            where: {
                group_id: message.chat.id,
                user_id: message.sender.id
            }
        }).catch((error) => {
            console.log(error);
        });

        messageReturn = 'Status alterado com sucesso!';
    }

    // Retorna uma mensagem para o cliente, modo: resposta.
    await client.reply(message.sender.id, messageReturn, message.id).catch((error) => {
        console.log(error);
    });

}

// Função que liga e desliga as notificações dos infernais de pacto com Dragão do Caos
async function setStatusDcPact(client, message, parameter) {

    // Variavel que recebe a mensagem de reposta para o cliente
    let messageReturn = ''

    // variavel que recebe o parametro para gravar no banco de dados
    let status = -1;

    if (parameter == 'On') {
        status = 1;
    }else if (parameter == 'Off') {
        status = 0;
    }else {
        messageReturn = 'Vefique se digitou o comando certo! \nUse o comando */help*'
    }

    // Verifica se é um numero inteiro e grava no banco de dados
    if (Number.isInteger(status) == true && status != -1) {
        await User.update({
            dc_pact_status: status
        },{
            where: {
                group_id: message.chat.id,
                user_id: message.sender.id
            }
        }).catch((error) => {
            console.log(error);
        });

        messageReturn = 'Status alterado com sucesso!';
    }

    // Retorna uma mensagem para o cliente, modo: resposta.
    await client.reply(message.sender.id, messageReturn, message.id).catch((error) => {
        console.log(error);
    });

}

// Função que liga e desliga as notificações dos infernais de pesquisa com Vigilante
async function setStatusVigilantResearch(client, message, parameter) {

    // Variavel que recebe a mensagem de reposta para o cliente
    let messageReturn = ''

    // variavel que recebe o parametro para gravar no banco de dados
    let status = -1;

    if (parameter == 'On') {
        status = 1;
    }else if (parameter == 'Off') {
        status = 0;
    }else {
        messageReturn = 'Vefique se digitou o comando certo! \nUse o comando */help*'
    }

    // Verifica se é um numero inteiro e grava no banco de dados
    if (Number.isInteger(status) == true && status != -1) {
        await User.update({
            vigilant_research_status: status
        },{
            where: {
                group_id: message.chat.id,
                user_id: message.sender.id
            }
        }).catch((error) => {
            console.log(error);
        });

        messageReturn = 'Status alterado com sucesso!';
    }

    // Retorna uma mensagem para o cliente, modo: resposta.
    await client.reply(message.sender.id, messageReturn, message.id).catch((error) => {
        console.log(error);
    });

}

// Função que liga e desliga as notificações dos infernais de pacto com Vigilante
async function setStatusVigilantPact(client, message, parameter) {

    // Variavel que recebe a mensagem de reposta para o cliente
    let messageReturn = ''

    // variavel que recebe o parametro para gravar no banco de dados
    let status = -1;

    if (parameter == 'On') {
        status = 1;
    }else if (parameter == 'Off') {
        status = 0;
    }else {
        messageReturn = 'Vefique se digitou o comando certo! \nUse o comando */help*'
    }

    // Verifica se é um numero inteiro e grava no banco de dados
    if (Number.isInteger(status) == true && status != -1) {
        await User.update({
            vigilant_pact_status: status
        },{
            where: {
                group_id: message.chat.id,
                user_id: message.sender.id
            }
        }).catch((error) => {
            console.log(error);
        });

        messageReturn = 'Status alterado com sucesso!';
    }

    // Retorna uma mensagem para o cliente, modo: resposta.
    await client.reply(message.sender.id, messageReturn, message.id).catch((error) => {
        console.log(error);
    });

}

// Função que liga e desliga as notificações dos infernais de pesquisa com Nucleo do caos
async function setStatusCoreResearch(client, message, parameter) {

    // Variavel que recebe a mensagem de reposta para o cliente
    let messageReturn = ''

    // variavel que recebe o parametro para gravar no banco de dados
    let status = -1;

    if (parameter == 'On') {
        status = 1;
    }else if (parameter == 'Off') {
        status = 0;
    }else {
        messageReturn = 'Vefique se digitou o comando certo! \nUse o comando */help*'
    }

    // Verifica se é um numero inteiro e grava no banco de dados
    if (Number.isInteger(status) == true && status != -1) {
        await User.update({
            core_research_status: status
        },{
            where: {
                group_id: message.chat.id,
                user_id: message.sender.id
            }
        }).catch((error) => {
            console.log(error);
        });

        messageReturn = 'Status alterado com sucesso!';
    }

    // Retorna uma mensagem para o cliente, modo: resposta.
    await client.reply(message.sender.id, messageReturn, message.id).catch((error) => {
        console.log(error);
    });

}

// Função que liga e desliga as notificações dos infernais de pacto com Nucleo do caos
async function setStatusCorePact(client, message, parameter) {

    // Variavel que recebe a mensagem de reposta para o cliente
    let messageReturn = ''

    // variavel que recebe o parametro para gravar no banco de dados
    let status = -1;

    if (parameter == 'On') {
        status = 1;
    }else if (parameter == 'Off') {
        status = 0;
    }else {
        messageReturn = 'Vefique se digitou o comando certo! \nUse o comando */help*'
    }

    // Verifica se é um numero inteiro e grava no banco de dados
    if (Number.isInteger(status) == true && status != -1) {
        await User.update({
            core_pact_status: status
        },{
            where: {
                group_id: message.chat.id,
                user_id: message.sender.id
            }
        }).catch((error) => {
            console.log(error);
        });

        messageReturn = 'Status alterado com sucesso!';
    }

    // Retorna uma mensagem para o cliente, modo: resposta.
    await client.reply(message.sender.id, messageReturn, message.id).catch((error) => {
        console.log(error);
    });

}

// Função que liga e desliga as notificações dos infernais de tropa com Nucleo do caos
async function setStatusCoreTroop(client, message, parameter) {

    // Variavel que recebe a mensagem de reposta para o cliente
    let messageReturn = ''

    // variavel que recebe o parametro para gravar no banco de dados
    let status = -1;

    if (parameter == 'On') {
        status = 1;
    }else if (parameter == 'Off') {
        status = 0;
    }else {
        messageReturn = 'Vefique se digitou o comando certo! \nUse o comando */help*'
    }

    // Verifica se é um numero inteiro e grava no banco de dados
    if (Number.isInteger(status) == true && status != -1) {
        await User.update({
            core_troop_status: status
        },{
            where: {
                group_id: message.chat.id,
                user_id: message.sender.id
            }
        }).catch((error) => {
            console.log(error);
        });

        messageReturn = 'Status alterado com sucesso!';
    }

    // Retorna uma mensagem para o cliente, modo: resposta.
    await client.reply(message.sender.id, messageReturn, message.id).catch((error) => {
        console.log(error);
    });

}


// Funções de notificações -----------------------------------------------------------------

// Função para notificar que está tendo infernal de pesquisa com orbes vermelhos
async function notifyOrbsRedResearch(client, message) {

    // Recebe a mensagem que será retornada ao cliente
    let messageReturn = '';

    // Nome da coluna de status, que permitir notificações ou não // 0 - desligado, 1 - ligado
    let columnStatus = 'orb_red_research_status';

    // Chama a função
    const resultUsers = await verifyTime(message.chat.id, columnStatus).catch((error) => {
        console.log(error);
    });

    if (resultUsers != []){
        let dataMsg = 'Infernal de pesquisa com orbes vermelho rolando: ';
        let dataNumbers = [];
        resultUsers.forEach(element => {
            element = element.replace('@c.us', '');
            dataMsg = `${dataMsg}@${element}`;
            dataNumbers.push(element);
        });

        await client.sendMentioned(message.chat.id, dataMsg, dataNumbers).catch((error) => {
            console.log(error);
        });
    }else {
        await client.reply(message.sender.id, messageReturn, message.id).catch((error) => {
            console.log(error);
        });
    }




}

// Função para notificar que está tendo infernal de pacto com orbes vermelhos
async function notifyOrbsRedPact(client, message) {

    // Recebe a mensagem que será retornada ao cliente
    let messageReturn = '';

    // Nome da coluna de status, que permitir notificações ou não // 0 - desligado, 1 - ligado
    let columnStatus = 'orb_red_pact_status';

    // Chama a função
    const resultUsers = await verifyTime(message.chat.id, columnStatus).catch((error) => {
        console.log(error);
    });

    if (resultUsers != []){
        let dataMsg = 'Infernal de pacto com orbes vermelho rolando: ';
        let dataNumbers = [];
        resultUsers.forEach(element => {
            element = element.replace('@c.us', '');
            dataMsg = `${dataMsg}@${element}`;
            dataNumbers.push(element);
        });

        await client.sendMentioned(message.chat.id, dataMsg, dataNumbers).catch((error) => {
            console.log(error);
        });
    }else {
        await client.reply(message.sender.id, messageReturn, message.id).catch((error) => {
            console.log(error);
        });
    }




}

// Função para notificar que está tendo infernal de tropa com orbes vermelhos
async function notifyOrbsRedTroop(client, message) {

    // Recebe a mensagem que será retornada ao cliente
    let messageReturn = '';

    // Nome da coluna de status, que permitir notificações ou não // 0 - desligado, 1 - ligado
    let columnStatus = 'orb_red_troop_status';

    // Chama a função
    const resultUsers = await verifyTime(message.chat.id, columnStatus).catch((error) => {
        console.log(error);
    });

    if (resultUsers != []){
        let dataMsg = 'Infernal de tropa com orbes vermelho rolando: ';
        let dataNumbers = [];
        resultUsers.forEach(element => {
            element = element.replace('@c.us', '');
            dataMsg = `${dataMsg}@${element}`;
            dataNumbers.push(element);
        });

        await client.sendMentioned(message.chat.id, dataMsg, dataNumbers).catch((error) => {
            console.log(error);
        });
    }else {
        await client.reply(message.sender.id, messageReturn, message.id).catch((error) => {
            console.log(error);
        });
    }




}


// Função para notificar que está tendo infernal de pesquisa com orbes amarelo
async function notifyOrbsYellowResearch(client, message) {

    // Recebe a mensagem que será retornada ao cliente
    let messageReturn = '';

    // Nome da coluna de status, que permitir notificações ou não // 0 - desligado, 1 - ligado
    let columnStatus = 'orb_yellow_research_status';

    // Chama a função
    const resultUsers = await verifyTime(message.chat.id, columnStatus).catch((error) => {
        console.log(error);
    });

    if (resultUsers != []){
        let dataMsg = 'Infernal de pesquisa com orbes amarelo rolando: ';
        let dataNumbers = [];
        resultUsers.forEach(element => {
            element = element.replace('@c.us', '');
            dataMsg = `${dataMsg}@${element}`;
            dataNumbers.push(element);
        });

        await client.sendMentioned(message.chat.id, dataMsg, dataNumbers).catch((error) => {
            console.log(error);
        });
    }else {
        await client.reply(message.sender.id, messageReturn, message.id).catch((error) => {
            console.log(error);
        });
    }




}

// Função para notificar que está tendo infernal de pacto com orbes amarelo
async function notifyOrbsYellowPact(client, message) {

    // Recebe a mensagem que será retornada ao cliente
    let messageReturn = '';

    // Nome da coluna de status, que permitir notificações ou não // 0 - desligado, 1 - ligado
    let columnStatus = 'orb_yellow_pact_status';

    // Chama a função
    const resultUsers = await verifyTime(message.chat.id, columnStatus).catch((error) => {
        console.log(error);
    });

    if (resultUsers != []){
        let dataMsg = 'Infernal de pacto com orbes amarelo rolando: ';
        let dataNumbers = [];
        resultUsers.forEach(element => {
            element = element.replace('@c.us', '');
            dataMsg = `${dataMsg}@${element}`;
            dataNumbers.push(element);
        });

        await client.sendMentioned(message.chat.id, dataMsg, dataNumbers).catch((error) => {
            console.log(error);
        });
    }else {
        await client.reply(message.sender.id, messageReturn, message.id).catch((error) => {
            console.log(error);
        });
    }




}

// Função para notificar que está tendo infernal de tropa com orbes amarelo
async function notifyOrbsYellowTroop(client, message) {

    // Recebe a mensagem que será retornada ao cliente
    let messageReturn = '';

    // Nome da coluna de status, que permitir notificações ou não // 0 - desligado, 1 - ligado
    let columnStatus = 'orb_yellow_troop_status';

    // Chama a função
    const resultUsers = await verifyTime(message.chat.id, columnStatus).catch((error) => {
        console.log(error);
    });

    if (resultUsers != []){
        let dataMsg = 'Infernal de tropa com orbes amarelo rolando: ';
        let dataNumbers = [];
        resultUsers.forEach(element => {
            element = element.replace('@c.us', '');
            dataMsg = `${dataMsg}@${element}`;
            dataNumbers.push(element);
        });

        await client.sendMentioned(message.chat.id, dataMsg, dataNumbers).catch((error) => {
            console.log(error);
        });
    }else {
        await client.reply(message.sender.id, messageReturn, message.id).catch((error) => {
            console.log(error);
        });
    }




}

// Função para notificar que está tendo infernal de pesquisa com Dragão do Caos
async function notifyDcResearch(client, message) {

    // Recebe a mensagem que será retornada ao cliente
    let messageReturn = '';

    // Nome da coluna de status, que permitir notificações ou não // 0 - desligado, 1 - ligado
    let columnStatus = 'dc_research_status';

    // Chama a função
    const resultUsers = await verifyTime(message.chat.id, columnStatus).catch((error) => {
        console.log(error);
    });

    if (resultUsers != []){
        let dataMsg = 'Infernal de pesquisa com dragão do caos rolando: ';
        let dataNumbers = [];
        resultUsers.forEach(element => {
            element = element.replace('@c.us', '');
            dataMsg = `${dataMsg}@${element}`;
            dataNumbers.push(element);
        });

        await client.sendMentioned(message.chat.id, dataMsg, dataNumbers).catch((error) => {
            console.log(error);
        });
    }else {
        await client.reply(message.sender.id, messageReturn, message.id).catch((error) => {
            console.log(error);
        });
    }




}

// Função para notificar que está tendo infernal de pacto com Dragão do Caos
async function notifyDcPact(client, message) {

    // Recebe a mensagem que será retornada ao cliente
    let messageReturn = '';

    // Nome da coluna de status, que permitir notificações ou não // 0 - desligado, 1 - ligado
    let columnStatus = 'dc_pact_status';

    // Chama a função
    const resultUsers = await verifyTime(message.chat.id, columnStatus).catch((error) => {
        console.log(error);
    });

    if (resultUsers != []){
        let dataMsg = 'Infernal de pacto com dragão do caos rolando: ';
        let dataNumbers = [];
        resultUsers.forEach(element => {
            element = element.replace('@c.us', '');
            dataMsg = `${dataMsg}@${element}`;
            dataNumbers.push(element);
        });

        await client.sendMentioned(message.chat.id, dataMsg, dataNumbers).catch((error) => {
            console.log(error);
        });
    }else {
        await client.reply(message.sender.id, messageReturn, message.id).catch((error) => {
            console.log(error);
        });
    }




}

// Função para notificar que está tendo infernal de pesquisa com Vigilante
async function notifyVigilantResearch(client, message) {

    // Recebe a mensagem que será retornada ao cliente
    let messageReturn = '';

    // Nome da coluna de status, que permitir notificações ou não // 0 - desligado, 1 - ligado
    let columnStatus = 'vigilant_research_status';

    // Chama a função
    const resultUsers = await verifyTime(message.chat.id, columnStatus).catch((error) => {
        console.log(error);
    });

    if (resultUsers != []){
        let dataMsg = 'Infernal de pesquisa com vigilante rolando: ';
        let dataNumbers = [];
        resultUsers.forEach(element => {
            element = element.replace('@c.us', '');
            dataMsg = `${dataMsg}@${element}`;
            dataNumbers.push(element);
        });

        await client.sendMentioned(message.chat.id, dataMsg, dataNumbers).catch((error) => {
            console.log(error);
        });
    }else {
        await client.reply(message.sender.id, messageReturn, message.id).catch((error) => {
            console.log(error);
        });
    }




}

// Função para notificar que está tendo infernal de pacto com Vigilante
async function notifyVigilantPact(client, message) {

    // Recebe a mensagem que será retornada ao cliente
    let messageReturn = '';

    // Nome da coluna de status, que permitir notificações ou não // 0 - desligado, 1 - ligado
    let columnStatus = 'vigilant_pact_status';

    // Chama a função
    const resultUsers = await verifyTime(message.chat.id, columnStatus).catch((error) => {
        console.log(error);
    });

    if (resultUsers != []){
        let dataMsg = 'Infernal de pacto com vigilante rolando: ';
        let dataNumbers = [];
        resultUsers.forEach(element => {
            element = element.replace('@c.us', '');
            dataMsg = `${dataMsg}@${element}`;
            dataNumbers.push(element);
        });

        await client.sendMentioned(message.chat.id, dataMsg, dataNumbers).catch((error) => {
            console.log(error);
        });
    }else {
        await client.reply(message.sender.id, messageReturn, message.id).catch((error) => {
            console.log(error);
        });
    }




}

// Função para notificar que está tendo infernal de pesquisa com Nucleo do Caos
async function notifyCoreResearch(client, message) {

    // Recebe a mensagem que será retornada ao cliente
    let messageReturn = '';

    // Nome da coluna de status, que permitir notificações ou não // 0 - desligado, 1 - ligado
    let columnStatus = 'core_research_status';

    // Chama a função
    const resultUsers = await verifyTime(message.chat.id, columnStatus).catch((error) => {
        console.log(error);
    });

    if (resultUsers != []){
        let dataMsg = 'Infernal de pesquisa com nucleo do caos rolando: ';
        let dataNumbers = [];
        resultUsers.forEach(element => {
            element = element.replace('@c.us', '');
            dataMsg = `${dataMsg}@${element}`;
            dataNumbers.push(element);
        });

        await client.sendMentioned(message.chat.id, dataMsg, dataNumbers).catch((error) => {
            console.log(error);
        });
    }else {
        await client.reply(message.sender.id, messageReturn, message.id).catch((error) => {
            console.log(error);
        });
    }




}

// Função para notificar que está tendo infernal de pacto com Nucleo do Caos
async function notifyCorePact(client, message) {

    // Recebe a mensagem que será retornada ao cliente
    let messageReturn = '';

    // Nome da coluna de status, que permitir notificações ou não // 0 - desligado, 1 - ligado
    let columnStatus = 'core_pact_status';

    // Chama a função
    const resultUsers = await verifyTime(message.chat.id, columnStatus).catch((error) => {
        console.log(error);
    });

    if (resultUsers != []){
        let dataMsg = 'Infernal de pacto com nucleo do caos rolando: ';
        let dataNumbers = [];
        resultUsers.forEach(element => {
            element = element.replace('@c.us', '');
            dataMsg = `${dataMsg}@${element}`;
            dataNumbers.push(element);
        });

        await client.sendMentioned(message.chat.id, dataMsg, dataNumbers).catch((error) => {
            console.log(error);
        });
    }else {
        await client.reply(message.sender.id, messageReturn, message.id).catch((error) => {
            console.log(error);
        });
    }




}

// Função para notificar que está tendo infernal de tropa com Nucleo do Caos
async function notifyCoreTroop(client, message) {

    // Recebe a mensagem que será retornada ao cliente
    let messageReturn = '';

    // Nome da coluna de status, que permitir notificações ou não // 0 - desligado, 1 - ligado
    let columnStatus = 'core_troop_status';

    // Chama a função
    const resultUsers = await verifyTime(message.chat.id, columnStatus).catch((error) => {
        console.log(error);
    });

    if (resultUsers != []){
        let dataMsg = 'Infernal de tropa com nucleo do caos rolando: ';
        let dataNumbers = [];
        resultUsers.forEach(element => {
            element = element.replace('@c.us', '');
            dataMsg = `${dataMsg}@${element}`;
            dataNumbers.push(element);
        });

        await client.sendMentioned(message.chat.id, dataMsg, dataNumbers).catch((error) => {
            console.log(error);
        });
    }else {
        await client.reply(message.sender.id, messageReturn, message.id).catch((error) => {
            console.log(error);
        });
    }




}





module.exports = {

    getAllMembers: getAllMembers,
    helpAdmin, helpAdmin,
    newAdmin: newAdmin,
    delAdmin: delAdmin,

    userInit: userInit,

    setCastle: setCastle,
    setTimeWar: setTimeWar,
    setStatusShield: setStatusShield,
    notifyCastle: notifyCastle,

    setTimeInfernal: setTimeInfernal,

    setStatusOrbsRedReasearch: setStatusOrbsRedReasearch,
    setStatusOrbsRedPact: setStatusOrbsRedPact,
    setStatusOrbsRedTroop: setStatusOrbsRedTroop,

    setStatusOrbsYellowReasearch: setStatusOrbsYellowReasearch,
    setStatusOrbsYellowPact: setStatusOrbsYellowPact,
    setStatusOrbsYellowTroop: setStatusOrbsYellowTroop,

    setStatusDcResearch: setStatusDcResearch,
    setStatusDcPact: setStatusDcPact,

    setStatusVigilantResearch: setStatusVigilantResearch,
    setStatusVigilantPact: setStatusVigilantPact,

    setStatusCoreResearch: setStatusCoreResearch,
    setStatusCorePact: setStatusCorePact,
    setStatusCoreTroop: setStatusCoreTroop,

    notifyOrbsRedResearch: notifyOrbsRedResearch,
    notifyOrbsRedPact: notifyOrbsRedPact,
    notifyOrbsRedTroop: notifyOrbsRedTroop,

    notifyOrbsYellowResearch: notifyOrbsYellowResearch,
    notifyOrbsYellowPact: notifyOrbsYellowPact,
    notifyOrbsYellowTroop: notifyOrbsYellowTroop,

    notifyDcResearch: notifyDcResearch,
    notifyDcPact: notifyDcPact,

    notifyVigilantResearch: notifyVigilantResearch,
    notifyVigilantPact: notifyVigilantPact,

    notifyCoreResearch: notifyCoreResearch,
    notifyCorePact: notifyCorePact,
    notifyCoreTroop: notifyCoreTroop
}




// Inicia o Servidor
//app.listen(8080, () => {
//    console.log("Servidor inicinado na porta: 8080");
//});