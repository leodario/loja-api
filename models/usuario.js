const mongoose = require("mongoose"),
    Schema = mongoose.Schema; 
const uniqueValidator = require('mongoose-unique-validator');
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const secret = require("../config").secret; // secret que foi criado no arquivo de configuração

const UsuarioSchema = new mongoose.Schema( {
    nome: {
        type: String,
        required:[true, "não pode ficar vazio."]
    },
    email: {
        type: String,
        lowercase: true,
        unique: true, // não pode ter emails iguais no sistema
        required: [true, "não pode ficar vazio."],
        index: true,
        match: [/\S+@\S+\.\S+/, 'é inválido.']
    },
    // esse formato mongose facilita o desenvovimento no relacionamento
    loja: { // relacionando loja que o tipo vai ser loja
        type: Schema.Types.ObjectId,
        ref: "Loja", // o ObjectId é referente a loja 
        required: [true,"loja não pode ser vazia"]
    },
    permissao: {
        // por padrão é somente cliente, mas se for um administrador, ele pode ser admin ou cliente ou somente admin
        type: Array,
        default: ["cliente"] // como é default não preciso colocar required
    },
    hash: String, // gera uma senha que é comparado com o salt
    salt: String, // comparando a senha para ver se bate

    // qudo o cliente esquecer a senha e precisar resgatar
    recovery: {
        type: {
            token: String,
            date: Date // data de validade do token
        },
        default: { } // por default é um objeto vazio
    }

}, { timestamps: true  }) // uma configuração do mongoose que ele mantem dois dados de forma automática
// ele matém uma data que o usuário foi criado e qdo ele for alterado ele vai manter um campo updateat
// ele mostra a última data que foi feita a atualização

// ativando plugin uniqueValidator - neste cado é o email
UsuarioSchema.plugin(uniqueValidator, {message: "Já está sendo utilizado"});

// método para criar uma nova senha para o usuário
UsuarioSchema.methods.setSenha = function(password){
    this.salt = crypto.randomBytes(16).toString("hex"); // gerar uma sitring de 16 bytes de forma aleatória
    this.hash = crypto.pbkdf2Sync(password, this.salt, 10000,512, "sha512").toString("hex");  // de forma síncrona
    // transformar em hexadecimal no formato stirng 
    // 10000 - número de vezes que esse valor vai ser misturado para estar fazendo a combinação do hash
    // 512 - a chave vai ser de 512 caracteres
    // sha512 - padrão de criptografia
};

// verificar se a senha está correta
UsuarioSchema.methods.validarSenha = function(password){
    const hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, "sha512").toString("hex");
    return hash === this.hash; // se a has q foi digitada for igual a q está salva, então estará correta true senão false
};

// gerando o token
UsuarioSchema.methods.gerarToken  = function(){
    const hoje = new Date();
    const exp = new Date(today); // gerando data de expiração
    exp.setDate(today.getDate() + 15); // expira em 15 dias

    // usando const jwt = require "jsonwebtoken"; função do jsonwebtoen assinando o token
    return jwt.sign({
        // colocando os dados dentro dele
        id: this._id,
        email: this.email,
        nome: this.nome,
        exp: parseFloat(exp.getTime() /1000, 10) // data de expiração
    }, secret); // apartir do secret que faz a parte da criptografia
};

// funão que envia o token qdo o usuário precisar
UsuarioSchema.methods.enviarAuthJSON = function(){
    return {
        nome: this.nome,
        email: this.email,
        loja: this.loja,
        role: this.permissao,
        token: this.gerarToken()
    };
};

// RECUPERAÇÃO DE SENHA
UsuarioSchema.methods.criarTokenRecuperacaoSenha = function(){
    this.recovery = {};
    this.recovery.token = crypto.randomBytes(16).toString("hex");
    this.recovery.date = new Date( new Date().getTime() + 24*60*60*1000 ); // data de expiração do token
    //24 horas 60 minutos 60 segundos 1000 milisegundos = 1 dia

    return this.recovery;
}

// após o usuário finalizar a recuperação de senha é preciso de um método para limpar essa configuração do token
UsuarioSchema.methods.finalizarTokenRecuperacaoSenha = function(){
    this.recovery = { token: null, date: null};
    return this.recovery;
};

module.exports = mongoose.model("Usuario", UsuarioSchema);
