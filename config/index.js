module.exports = {
    // código de encriptação do json token que vai ser utilizado para autenticação, ele envia algumas informações do cliente
    // e com servidor se o token é válido e vai permitir o não a entrada do usuário
    secret : process.env.NODE_ENV === "production" ? process.env.SECRET : "F9SDF809DF80F7DFDF5SDF4D3DS54DF11DF8DFJ8J344HAZDFE82NHHM3GMEMEAD54F7HKEJH",

    //links que vamos estar utilizando no sistema
    api: process.env.NODE_ENV === "production" ? "https://leodario.com/api-teste-loja" : "http://localhost:3000",
    loja: process.env.NODE_ENV === "production" ? "https://leodario.com/loja" : "http://localhost:8000"
}