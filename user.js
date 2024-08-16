// users.js
var express = require('express');
var router = express.Router();

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({ errorFormat: "minimal" });

/* GET users listing. */
router.get('/', async function (req, res, next) {
  try {
    const clientes = await prisma.cliente.findMany();
    res.json(clientes);
  } catch (exception) {
    exceptionHandler(exception, res);
  }
});

router.post('/login', async (req, res) => {
  try {
    const data = req.body;

    if (!('password' in data) || !('email' in data)) {
      return res.status(401).json({
        error: "Usúario e senha são obrigatórios"
      });
    }

    const cliente = await prisma.cliente.findUnique({
      where: {
        email: data.email
      }
    });

    const passwordCheck = await bcrypt.compare(data.password, cliente.password);

    if (!passwordCheck) {
      return res.status(401).json({
        error: "Usuário e/ou senha incorreta(s)"
      });
    }

    delete cliente.password;
    const jwt = generateAccessToken(cliente);

    // Retorne um objeto contendo o cliente e o token
    res.json({
      user: cliente,
      token: jwt
    });

  } catch (exception) {
    exceptionHandler(exception, res);
  }
});

// Resposta padrão para rotas que não existem
router.all('*', (req, res) => {
  res.status(501).end();
});

// Exportar o router
module.exports = router;
