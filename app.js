const express = require('express');
const { configureCookieParser } = require('./cookie');
const userRouter = require('./user'); 
const cookieRouter = require('./cookieRoutes'); // Corrigido para o arquivo correto

const app = express();

// Configura o middleware cookie-parser com a chave secreta
const COOKIE_SECRET = 'sua_chave_secreta';
configureCookieParser(app, COOKIE_SECRET);

app.use(express.json()); // Middleware para interpretar JSON

// Usa as rotas definidas em user.js
app.use('/user', userRouter);

// Usa as rotas definidas em cookieRoutes.js
app.use('/cookies', cookieRouter);

app.listen(3000, () => {
  console.log('Servidor rodando na porta 3000');
});
