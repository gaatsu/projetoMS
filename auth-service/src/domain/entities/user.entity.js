const bcrypt = require('bcryptjs');

class User {
  constructor(id, email, password, recoveryCode = null, recoveryCodeExpires = null) {
    this.id = id;
    this.email = email;
    this.password = password;
    this.recoveryCode = recoveryCode;
    this.recoveryCodeExpires = recoveryCodeExpires;
  }

  async hashPassword() {
    console.log('Hashando senha para usuário:', this.email);
    console.log('Senha original:', this.password);
    this.password = await bcrypt.hash(this.password, 10);
    console.log('Senha hasheada:', this.password);
  }

  async comparePassword(password) {
    console.log('Comparando senhas para usuário:', this.email);
    console.log('Senha fornecida:', password);
    console.log('Senha hasheada no banco:', this.password);
    const result = await bcrypt.compare(password, this.password);
    console.log('Resultado da comparação:', result);
    return result;
  }

  setRecoveryCode(code) {
    this.recoveryCode = code;
    this.recoveryCodeExpires = new Date(Date.now() + 15 * 60000); // 15 minutos
  }

  isRecoveryCodeValid(code) {
    return this.recoveryCode === code && 
           this.recoveryCodeExpires && 
           this.recoveryCodeExpires > new Date();
  }
}

module.exports = User; 