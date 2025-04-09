require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const authRoutes = require('./presentation/routes/auth.routes');
const { syncDatabase } = require('./infrastructure/config/database.config');
const emailService = require('./infrastructure/services/email.service');

const app = express();
const port = process.env.PORT || 3001;

// Middlewares
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Rota de teste
app.get('/', (req, res) => {
  res.json({ message: 'API de Autenticação funcionando!' });
});

// Rotas da API
app.use('/api/auth', authRoutes);

// Inicialização do servidor
const startServer = async () => {
  try {
    await syncDatabase();
    
    // Iniciar serviço de email
    await emailService.start();
    
    app.listen(port, () => {
      console.log(`Servidor rodando em http://localhost:${port}`);
      console.log('Rotas disponíveis:');
      console.log('- POST /api/auth/register');
      console.log('- POST /api/auth/login');
      console.log('- POST /api/auth/refresh');
      console.log('- POST /api/auth/logout');
      console.log('- POST /api/auth/recovery/request');
      console.log('- POST /api/auth/recovery/reset');
    });
  } catch (error) {
    console.error('Erro ao iniciar o servidor:', error);
    process.exit(1);
  }
};

startServer(); 