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
    this.password = await bcrypt.hash(this.password, 10);
  }

  async comparePassword(password) {
    return await bcrypt.compare(password, this.password);
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