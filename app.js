// app.js
var express = require('express');
var app = express();

var userRouter = require('./user'); // Importa o arquivo users.js

app.use(express.json()); // Middleware para interpretar JSON

// Use as rotas definidas no users.js
app.use('/user', userRouter);

app.listen(3000, () => {
  console.log('Servidor rodando na porta 3000');
});
