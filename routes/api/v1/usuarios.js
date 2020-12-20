const router = require("express").Router();
const auth = require("../../auth");
const UsuarioController = require("../../../controllers/UsuarioController");


const usuarioController = new UsuarioController();


// ENVIANDO DADOS PARA O SERVIDOR
router.post("/login", usuarioController.login);
router.post("/registrar", usuarioController.store);
router.put("/", auth.required, usuarioController.update);
router.delete("/", auth.required, usuarioController.remove); // opção para o cliente deletar a própria conta

// PARTE DE RECUPERAÇÃO DE SENHA
// vai ser com views do próprio servidor, não vai ser via api, vai ser via html
router.get("/recuperar-senha", usuarioController.showRecovery); // rota qdo clicado esqueci a senha
router.post("/recuperar-senha", usuarioController.createRecovery); // post em que envia o email a ser recuperado
router.get("/senha-recuperada", usuarioController.showCompleteRecovery); // digitar a senha recuperada
router.post("/senha-recuperada", usuarioController.showCompleteRecovery); // envio da nova senha para o servidor

router.get("/", auth.required, usuarioController.index); // pegar dados do usuário que está pedindo a requisição
// ou seja do usuário que está autenticado

router.get("/:id", auth.required, usuarioController.show); // mostrar os dados do usuário

module.exports = router;