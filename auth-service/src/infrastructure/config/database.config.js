const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'postgres',
  host: process.env.POSTGRES_HOST,
  port: process.env.POSTGRES_PORT,
  database: process.env.POSTGRES_DB,
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  logging: false,
  define: {
    timestamps: true,
    underscored: true
  }
});

// Função para sincronizar o banco de dados
const syncDatabase = async () => {
  try {
    await sequelize.sync({ force: false });
    console.log('Banco de dados sincronizado com sucesso');
  } catch (error) {
    console.error('Erro ao sincronizar o banco de dados:', error);
  }
};

module.exports = { sequelize, syncDatabase }; 