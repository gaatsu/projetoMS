const jwt = require('jsonwebtoken');

class AuthMiddleware {
  static async authenticate(req, res, next) {
    try {
      const token = req.cookies['auth_token'];
      
      if (!token) {
        return res.status(401).json({ error: 'Token não fornecido' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Token expirado' });
      }
      return res.status(401).json({ error: 'Token inválido' });
    }
  }

  static setAuthCookies(res, { accessToken, refreshToken }) {
    // Configurações de segurança para os cookies
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/'
    };

    // Cookie para o token de acesso (15 minutos)
    res.cookie('auth_token', accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000 // 15 minutos
    });

    // Cookie para o refresh token (7 dias)
    res.cookie('refresh_token', refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 dias
    });
  }

  static clearAuthCookies(res) {
    res.clearCookie('auth_token');
    res.clearCookie('refresh_token');
  }
}

module.exports = AuthMiddleware; 