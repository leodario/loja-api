// PACOTES
const compression = require("compression");
const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const morgan = require("morgan"); // mostra como está sendo chamado dentro do servidor da minha api
const cors = require("cors");

// START
const app = express(); // cria uma instância dessa framework com todas as opções e preparando p/ ser utilizado como aplicação

// AMBIENTE
// verifica se está sendo executado em produção ou local
const isProduction = process.env.NODE_ENV === "production"; // para ser executado em um ambiente seguro (brechas de segurança)
const PORT = process.env.PORT || 3000; // ela pode vim na variável de ambiente ou pela porta 3000

// ARQUIVOS ESTÁTICOS
// utilizando as pastas públicas
app.use("/public", express.static(__dirname + "/public")); // forma como vou acessar pelo servidor
app.use("/public/images", express.static(__dirname + "/public/images")); // forma que vou acessar pelo servidor

// SETUP MONGODB
const dbs = require("./config/database"); //acessando o database.jon que terá o dbTest e dbProduction
const dburi = isProduction ? dbs.dbProduction : dbs.dbTest;
mongoose.connect(dburi,{useNewUrlParser: true});

// SETUP EJS
// pacote de vizualização
app.set("view engine", "ejs");

// CONFIGURAÇÕES
if(!isProduction) app.use(morgan("dev")); // se não estiver em produção coloco no modo desenvolvedor 
app.use(cors()); // acesso com o react
app.disable('x-powered-by'); // desativando o x-powered-by é um campo que vem no header junto com a resposta
// do express, mostrando que estou utilizando o framework express, isso causa uma brecha de segurança 

app.use(copression()); // deixar mais leve as requisições

//SETUP BODY PARSER
// utilizado para requisições (exemplo: post, put, get)
app.use(bodyParser.urlencoded({extended: false, limit: 1.5*1024*1024})); // urlenoded é o setup que vem na frente da url
// limit - jeito mais simples para aumentar o limite de cache

app.use(bodyParser.json({limit: 1.5*1024*1024})); // json direto com o mesmo limit de cache

//MODELS
require("./models"); // instalando e rodando junto com o mongoDB através da pasta index

//ROTAS
app.use("/", require("./routes"));

// 404 - ROTA
// caso não encotrar nenhuma rota
app.use((req, res, next) => {
    const err = new Error("Not found");
    err.status = 404;
    next(err);
});

// ROTA - 422, 500, 401
// para todos os outros tipos de erro que ocorrer
app.use((err, req, res, next) => {
    res.status(err.status || 500);
    if(err.status !== 404) console.warn("Error: ", err.mesage, new Date());
    res.json({erros: { message: err.message, status: err.status } });
});

// ESCUTAR
// a porta é que eu separei no início deste código
app.listen(PORT, (err) => {
    if(err) throw err;
    console.log(`Rodando na //localhost:${PORT}`); // se não acontecer o erro
});


