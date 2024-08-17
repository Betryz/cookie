const express = require('express');
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const { setCookie, getCookie } = require('./cookie'); // Importa as funções do cookie.js

const prisma = new PrismaClient();
const router = express.Router();



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

    // Remove a senha antes de armazenar nos cookies
    delete cliente.password;

    // Define um cookie assinado com as informações do usuário usando a função do cookie.js
    setCookie(res, 'userData', JSON.stringify(cliente), { 
      maxAge: 24 * 60 * 60 * 1000 // Define a duração do cookie (24 horas)
    });

    // Retorna um objeto contendo o cliente
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

// Rota para ler o cookie
router.get('/get-user', (req, res) => {
  // Acessa o cookie assinado 'userData' usando a função do cookie.js
  const userData = getCookie(req, 'userData');
  if (userData) {
    res.json({
      success: true,
      user: JSON.parse(userData)
    });
  } else {
    res.status(401).json({
      success: false,
      error: "Nenhum usuário autenticado"
    });
  }
});

module.exports = router;
