// adicionando as configurações de rotas

const router = require("express").Router();

//configurando a rota
// v1 indica que estou usando uma versão da api. 
// a cada nova versão troca-se aqui para não quebrar as funcionalidades a cada versão nova da api
router.use('/v1/api', require('./api/v1/')); 

// rota só de teste retorna OK se estiver correto. Utilizado para erro de validação. Exemplo se faltar algum campo 
// a ser preenchido
router.get('/',(req, res, next) => res.send( { ok: true } ) );

// midware para validação apenas qdo tiver algum erro mesmo
// 422 é o código para erros de validação
router.use(function(err, req, res, next){
    if(err.name === 'ValidationError'){
        return res.status(422).json({
            erros: Object.keys(err.erros).reduce(function(erros, key){
                erros[key] = err.erros[keys.message];
                return erros;
            }, {})
        });
    }
});

module.exports = router;