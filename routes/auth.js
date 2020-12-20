//AUTENTICAÇÃO - para identificar se o usuário que está tentando acessar a rota tem o token senão retorna erro 401 para ele

// INSERINDO PACOTES INSTALADOS
const jwt = require("express-jwt"); // esse pacote é exclusivo para o express, analisa o token se é válido 
// se for válido dá a continuidade repassando para a rota senão deleta o usuário

const secret = require("../config").secret;

// pega a nossa requisição 
function getTokenFromHeader(req){
    // se ele não estiver na requisição entre os headers que chegar da requisição retorna null
    if(!req.headers.authorization) return null;

    // se existir coletamos ele
    const token = req.headers.authorization.split(" "); // o split vai dividir em 2 partes como o exemplo abaixo
    // "Ecommerce 5fdf5df5.fed7f98ds79d.u8u89ae3hka"
    if(token[0] !== "Ecommerce") return null;
    return token[1];
}

// a função required qdo a autenticação é necessária
const auth ={
    required: jwt({
        secret,
        userProperty: 'payload',
        getToken: getTokenFromHeader
    }),
    optional: jwt({
        secret, 
        userProperty: 'payload',
        credentialsRequired: false,
        getToken: getTokenFromHeader
    })
};

module.exports = auth;