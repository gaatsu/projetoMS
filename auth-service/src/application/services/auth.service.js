const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../../domain/entities/user.entity');
const userRepository = require('../../infrastructure/repositories/user.repository');
const emailService = require('../../infrastructure/services/email.service');
const rabbitmqConfig = require('../../infrastructure/config/rabbitmq.config');
const eventService = require('../../infrastructure/services/event.service');

class AuthService {
  async register(email, password) {
    console.log('Tentando registrar usuário:', email);
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error('Usuário já existe');
    }

    // Criar usuário e fazer hash da senha
    const user = new User(null, email, password);
    await user.hashPassword();
    
    // Salvar usuário com a senha já hasheada
    const savedUser = await userRepository.create({
      email: user.email,
      password: user.password // Senha já está hasheada
    });
    
    // Publicar evento de usuário criado
    await eventService.publishUserCreated(savedUser);
    
    console.log('Usuário registrado com sucesso:', email);
    return this.generateTokens(savedUser);
  }

  async login(email, password) {
    console.log('Tentando login para:', email);
    const user = await userRepository.findByEmail(email);
    if (!user) {
      console.log('Usuário não encontrado:', email);
      await eventService.publishLoginFailed(email, 'user_not_found');
      throw new Error('Usuário não encontrado');
    }

    console.log('Verificando senha para:', email);
    const isValidPassword = await user.comparePassword(password);
    console.log('Resultado da verificação de senha:', isValidPassword);
    
    if (!isValidPassword) {
      console.log('Senha inválida para:', email);
      await eventService.publishLoginFailed(email, 'invalid_password');
      throw new Error('Senha inválida');
    }

    // Publicar evento de login bem-sucedido
    await eventService.publishLoginSuccess(user);
    
    console.log('Login bem-sucedido para:', email);
    return this.generateTokens(user);
  }

  async updateUser(id, updateData) {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    const updatedUser = await userRepository.update(id, {
      ...user,
      ...updateData
    });

    // Publicar evento de usuário atualizado
    await eventService.publishUserUpdated(updatedUser);

    return updatedUser;
  }

  async deleteUser(id) {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    await userRepository.delete(id);

    // Publicar evento de usuário deletado
    await eventService.publishUserDeleted(user);

    return { message: 'Usuário deletado com sucesso' };
  }

  async requestPasswordRecovery(email) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    const recoveryCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    user.setRecoveryCode(recoveryCode);
    await userRepository.update(user.id, user);

    // Enviar código por email através do RabbitMQ
    await rabbitmqConfig.sendToQueue('email_queue', {
      type: 'recovery_code',
      email: user.email,
      code: recoveryCode
    });

    // Publica evento de recuperação de senha solicitada
    await rabbitmqConfig.sendToQueue('password.recovery.requested', {
      userId: user.id,
      email: user.email
    });

    return { message: 'Código de recuperação enviado para o email' };
  }

  async resetPassword(email, code, newPassword) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    if (!user.isRecoveryCodeValid(code)) {
      throw new Error('Código de recuperação inválido ou expirado');
    }

    // Criar novo usuário com a nova senha e fazer hash
    const updatedUser = new User(user.id, user.email, newPassword);
    await updatedUser.hashPassword();
    
    // Atualizar usuário com a nova senha hasheada
    await userRepository.update(user.id, {
      ...user,
      password: updatedUser.password,
      recoveryCode: null,
      recoveryCodeExpires: null
    });

    // Publicar evento de senha alterada
    await eventService.publishPasswordChanged(updatedUser);

    return { message: 'Senha alterada com sucesso' };
  }

  async refreshToken(refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      const user = await userRepository.findById(decoded.id);
      
      if (!user) {
        throw new Error('Usuário não encontrado');
      }

      return this.generateTokens(user);
    } catch (error) {
      throw new Error('Refresh token inválido');
    }
  }

  generateTokens(user) {
    const accessToken = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { id: user.id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    return { accessToken, refreshToken };
  }
}

module.exports = new AuthService(); 