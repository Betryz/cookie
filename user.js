var express = require('express');
var router = express.Router();

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient({ errorFormat: "minimal" });

/* GET users listing. */
router.get('/', async function (req, res) {
  try {
    const clientes = await prisma.cliente.findMany();
    res.json(clientes);
  } catch (exception) {
    res.status(500).json({
      success: false,
      message: "Ocorreu um erro interno no servidor.",
      error: exception.message
    });
  }
});


router.post('/', async (req, res) => {
    const data = req.body;
  
    // Verifica se a senha é obrigatória e se tem no mínimo 8 caracteres
    if (!data.password || data.password.length < 8) {
      return res.status(400).json({
        error: "A senha é obrigatória e deve ter no mínimo 8 caracteres."
      });
    }
  
    // Criptografa a senha
    data.password = await bcrypt.hash(data.password, 10);
  
    try {
      // Cria um novo cliente no banco de dados
      const cliente = await prisma.cliente.create({
        data: {
          email: data.email,
          password: data.password
        },
        select: {
          id: true,
          email: true
        }
      });
  
      // Retorna o cliente criado
      res.status(201).json(cliente);
  
    } catch (exception) {
      res.status(500).json({
        success: false,
        message: "Ocorreu um erro interno no servidor.",
        error: exception.message
      });
    }
  });
  
  


router.post('/login', async (req, res) => {
  try {
    const data = req.body;

    if (!data.password || !data.email) {
      return res.status(401).json({
        success: false,
        error: "Usuário e senha são obrigatórios"
      });
    }

    const cliente = await prisma.cliente.findUnique({
      where: {
        email: data.email
      }
    });

    if (!cliente) {
      return res.status(401).json({
        success: false,
        error: "Usuário não encontrado"
      });
    }

    const passwordCheck = await bcrypt.compare(data.password, cliente.password);

    if (!passwordCheck) {
      return res.status(401).json({
        success: false,
        error: "Usuário e/ou senha incorreta(s)"
      });
    }

    delete cliente.password;

    // Retorne um objeto contendo o cliente
    res.json({
      success: true,
      user: cliente
    });

  } catch (exception) {
    res.status(500).json({
      success: false,
      message: "Ocorreu um erro interno no servidor.",
      error: exception.message
    });
  }
});

// Resposta padrão para rotas que não existem
router.all('*', (req, res) => {
  res.status(501).end();
});

// Exportar o router
module.exports = router;
