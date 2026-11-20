const express = require('express');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');

const app = express();
const PORT = 3000;

app.use(cors()); // Habilita CORS conforme Requisito 8
app.use(express.json()); // Permite leitura de JSON no body

// Direciona todas as requisições que começam com '/users' para o arquivo de rotas
app.use('/users', userRoutes);

// Inicia o servidor HTTP na porta 3000
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});