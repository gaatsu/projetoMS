const authService = require('../../application/services/auth.service');
const AuthMiddleware = require('../../infrastructure/middlewares/auth.middleware');

class AuthController {
  async register(req, res) {
    try {
      const { email, password } = req.body;
      const tokens = await authService.register(email, password);
      AuthMiddleware.setAuthCookies(res, tokens);
      res.status(201).json({ message: 'Usuário registrado com sucesso' });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;
      const tokens = await authService.login(email, password);
      AuthMiddleware.setAuthCookies(res, tokens);
      res.json({ message: 'Login realizado com sucesso' });
    } catch (error) {
      res.status(401).json({ error: error.message });
    }
  }

  async refresh(req, res) {
    try {
      const { refreshToken } = req.body;
      const tokens = await authService.refreshToken(refreshToken);
      AuthMiddleware.setAuthCookies(res, tokens);
      res.json({ message: 'Tokens atualizados com sucesso' });
    } catch (error) {
      res.status(401).json({ error: error.message });
    }
  }

  async logout(req, res) {
    AuthMiddleware.clearAuthCookies(res);
    res.json({ message: 'Logout realizado com sucesso' });
  }

  async requestPasswordRecovery(req, res) {
    try {
      const { email } = req.body;
      const result = await authService.requestPasswordRecovery(email);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async resetPassword(req, res) {
    try {
      const { email, code, newPassword } = req.body;
      const result = await authService.resetPassword(email, code, newPassword);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = new AuthController(); 