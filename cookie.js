var express = require('express');
var cookieParser = require('cookie-parser');

var app = express();
app.use(cookieParser('secret-key'));  // Use uma chave secreta para assinar os cookies

// Rota que define um cookie assinado
app.get('/set-cookie', function (req, res) {
  // Definir um cookie chamado 'myData' com o valor '12345', assinado
  res.cookie('myData', '12345', { signed: true });
  res.send('Signed cookie has been set');
});

// Rota para ler o cookie
app.get('/get-cookie', function (req, res) {
  // Acessar o cookie assinado 'myData'
  var myData = req.signedCookies.myData;
  res.send('Signed cookie value: ' + myData);
});



app.listen(8080, function () {
  console.log('Server is running on http://localhost:8080');
});