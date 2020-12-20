// upload de arquivos

const multer = require("multer");

// diskStorage - pq vou estar armazenando no próprio disco
const storage = multer.diskStorage({
    destination: (req, file, callback) => callback(null, __dirname + '/../public/images'),
    filename: (req, file, callback) => callback(null, file.fieldname + '-' + Date.now() + '.jpg')
});

// importando para a constante
const upload = multer({ storage });

// exportando nas rotas
module.exports = upload;