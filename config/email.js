// nodemailer estou configurando por gmail, não é recomendado porém é pra teste
// o ideal é contratar um empresa própria para isso 
// o google permite enviar 400 emails pelo gmail automaticamente sem bloquear
module.exports = {
    host: "smtp.gmail.com",
    port: 465,
    auth: {
        user: "leodarioloja@gmail.com",
        pass: "lojaLeodario2020real"
    }
};