const { Model, DataTypes } = require('sequelize');
const { sequelize } = require('../config/database.config');
const User = require('../../domain/entities/user.entity');

class UserModel extends Model {}

UserModel.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  recoveryCode: {
    type: DataTypes.STRING,
    allowNull: true
  },
  recoveryCodeExpires: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  sequelize,
  modelName: 'User',
  tableName: 'users'
});

class UserRepository {
  async create(userData) {
    console.log('Criando usuário no repositório:', userData.email);
    const dbUser = await UserModel.create({
      email: userData.email,
      password: userData.password
    });
    console.log('Usuário salvo com sucesso');
    
    return new User(
      dbUser.id,
      dbUser.email,
      dbUser.password,
      dbUser.recoveryCode,
      dbUser.recoveryCodeExpires
    );
  }

  async findByEmail(email) {
    console.log('Buscando usuário por email:', email);
    const dbUser = await UserModel.findOne({ where: { email } });
    if (!dbUser) {
      console.log('Usuário não encontrado');
      return null;
    }
    console.log('Usuário encontrado');
    
    return new User(
      dbUser.id,
      dbUser.email,
      dbUser.password,
      dbUser.recoveryCode,
      dbUser.recoveryCodeExpires
    );
  }

  async findById(id) {
    console.log('Buscando usuário por ID:', id);
    const dbUser = await UserModel.findByPk(id);
    if (!dbUser) {
      console.log('Usuário não encontrado');
      return null;
    }
    console.log('Usuário encontrado');
    
    return new User(
      dbUser.id,
      dbUser.email,
      dbUser.password,
      dbUser.recoveryCode,
      dbUser.recoveryCodeExpires
    );
  }

  async update(id, user) {
    console.log('Atualizando usuário:', id);
    const dbUser = await UserModel.findByPk(id);
    if (!dbUser) {
      console.log('Usuário não encontrado para atualização');
      throw new Error('Usuário não encontrado');
    }

    await dbUser.update({
      email: user.email,
      password: user.password,
      recoveryCode: user.recoveryCode,
      recoveryCodeExpires: user.recoveryCodeExpires
    });
    console.log('Usuário atualizado com sucesso');

    return new User(
      dbUser.id,
      dbUser.email,
      dbUser.password,
      dbUser.recoveryCode,
      dbUser.recoveryCodeExpires
    );
  }
}

module.exports = new UserRepository(); 