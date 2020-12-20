// é a rota de todos os módulos do nosso servidor

const router = require("express").Router();

router.use("/usuarios", require("./usuarios"));

module.exports = router;