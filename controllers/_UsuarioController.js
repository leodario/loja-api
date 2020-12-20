const mongoose = require("mongoose");
const {  restart } = require("nodemon");

const Usuario = mongoose.model("Usuario");

// const enviarEmailRecovery = require("../helpers/email-recovery");

class UsuarioController {

    //GET /
    index(req, res, next) {
        // findById é uma função do mongoose - encontrar pelo id
        Usuario.findById(req.payload.id).then(usuario => { // o pacote express jwt está colocando dentro da requisição payload
            // o id email e nome do usuário que fez a requisição     
            if(!usuario) return res.status(401).json({ errors: "Usuario não registrado" });
            return res.json({ usuario: usuario.enviarAuthJSON() });
        }).catch(next); // se acontecer algum erro ele joga para outras rotas que cuidará do erro
    }

    //GET /:id - pegar informações de um usuário que não seja você 
    show(req, res, next) {
        // populate para pegar os dados da loja junto com a do usuário
        Usuario.findById(req.params.id).populate({ path: "loja" })
        .then(usuario => {
            if(!usuario) return res.status(401).json({ errors: "Usuario não registrado" });
            return res.json({
                usuario: {
                    nome: usuario.nome,
                    email: usuario.email,
                    permissao: usuario.permissao,
                    loja: usuario.loja
                }
            });
        }).catch(next);
    }

    // POST /registrar
    store(req, res, next) {
        const {
            nome,
            email,
            password
        } = req.body;

        if(!nome || !email, password) return res.status(422).json({ erros: "Preencha todos os dados de cadastro." });

        const usuario = new Usuario({
            nome,
            email
        });
        usuario.setSenha(password);

        usuario.save()
            .then(() => res.json({
                usuario: usuario.enviarAuthJSON
            }))
            .catch(next); // caso aconteça algum erro na hora de salvar o usário
    }

    // PUT /
    update(req, res, next) {
        const {
            nome,
            email,
            password
        } = req.body; // do body da requisição "dados que são enviados post, put..."

        // req.payload.id - pq só pode alterar os dados dele mesmo
        Usuario.findById(req.payload.id).then((usuario) => {
            if (!usuario) return res.status(401).json({
                erros: "Usuário não registrado"
            });
            if (typeof nome !== "undefined") usuario.nome = nome; // se for diferente de undefined atualiza nome
            if (typeof email !== "undefined") usuario.email = email;
            if (typeof password !== "undefined") usuario.setSenha(password);

            //desse modo caso ele não envie nada diferente mantém os mesmos dados e salva
            return usuario.save().then(() => {
                return res.json({
                    usuario: usuario.enviarAuthJSON()
                });
            }).catch(next);
        }).catch(next);
    }

    // DELETE / 
    // remover o cliente
    remove(req, res, next) {
        Usuario.findById(req.payload.id).then(usuario => {
            if (!usuario) return res.status(401).json({
                errors: "Usuario não registrado"
            });
            return usuario.remove().then(() => {
                return res.json({
                    deletado: true
                });
            }).catch(next)
        }).catch(next);
    }

    // POST /login
    login(req, res, next) {
        const {
            email,
            password
        } = req.body;
        if (!email) return res.status(422).json({
            erros: {
                email: "não pode ficar vazio"
            }
        });
        if (!password) return res.status(422).json({
            erros: {
                password: "não pode ficar vazio"
            }
        });
        Usuario.findOne({
            email
        }).then((usuario) => {
            // como o usuario não vai estar logado ele ainda  não vai ter o req.payload
            if (!usuario) return res.status(401).json({
                erros: "Usuario não registrado"
            });

            // quando ele achar o usuário ele vai validar a senha
            if (!usuario.validarSenha(password)) return res.status(401).json({
                erros: "Senha inválida"
            });

            // quando achar a usuario e senha
            return res.json({
                usuario: enviarAuthJSON()
            });
        }).catch(next);
    }

    // RECOVERY

    // GET /recuperar-senha
    showRecovery(req, res, next){
        return res.render('recovery', { error: null, success: null });
    }

    // POST /recuperar-senha
    createRecovery(req, res, next){
        const { email } = req.body;
        if(!email) return res.render('recovery', { error: "Preencha com o seu email", success: null });

        Usuario.findOne({ email }).then((usuario) => {
            if(!usuario) return res.render("recovery", { error: "Não existe usuário com este email", success: null });
            const recoveryData = usuario.criarTokenRecuperacaoSenha();  // exxecutando isso vamos executar todos os dados da senha
            return usuario.save().then(() => { // salvando os dados
                enviarEmailRecovery({ usuario, recovery: recoveryData }, (error = null, success = null) => {
                    return res.render("recovery", { error: null, success: true });
                });
            }).catch(next);
        }).catch(next);
    }

    // GET /senha-recuperada
    // nele é qdo o usuario está com o token
    showCompleteRecovery(req, res, next){
        if(!req.query.token) return res.render("recovery", { error: "Token não identificado", success: null });

        // localizando quem criou o token
        Usuario.findOne({ "recovery.token": req.query.token }).then(usuario => { // verificando se existe usuario
            if(!usuario) return res.render("recovery", { error: "Não existe usuário com este token", success: null });

            //verificando se o token expirou
            if( new Date(usuario.recovery.date) < new Date() ) return res.render("recovery", { error: "Token expirado. Tente novamente.", success: null });

            // se o token não expirou, e é um token válido
            return res.render("recovery/store", { error: null, success: null, token: req.query.token }); // é a view que salva a senha
        }).catch(next);
    }

    // POST /senha-recuperada
    completeRecovery(req, res, next){
        const { token, password } = req.body; // token e password tem que estar no body
        if(!token || !password) return res.render("recovery/store", { error: "Preencha novamente com sua nova senha", success: null, token: token });
       
       // se existe o token e o usuario
        Usuario.findOne({ "recovery.token": token }).then(usuario => { // encontrando o usuário dono do token

            // se usuario não existir renderizo para a tela inicial
            if(!usuario) return res.render("recovery", { error: "Usuario nao identificado", success: null });

            // se ele passar por isso tudo
            usuario.finalizarTokenRecuperacaoSenha();
            usuario.setSenha(password); // setar a nova senha

            //salvando a nova senha e parte de recuperação deletada para ninguém aproveitar o token aberto
            return usuario.save().then(() => {
                return res.render("recovery/store", {
                    // fazendo um retorno de sucesso
                    error: null,
                    success: "Senha alterada com sucesso. Tente novamente fazer login.",
                    token: null
                });
            }).catch(next);
        });
    }

}

module.exports = UsuarioController;