# Sistema de Autenticação

Sistema de autenticação desenvolvido com Node.js, seguindo os princípios do Domain-Driven Design (DDD) e arquitetura de microserviços.

## Tecnologias Utilizadas

- Node.js
- Express
- PostgreSQL
- Sequelize
- RabbitMQ
- JWT
- Nodemailer
- Docker
- Cookie-parser
- Helmet

## Estrutura do Projeto

```
src/
├── domain/
│   └── entities/
│       └── user.entity.js
├── application/
│   └── services/
│       └── auth.service.js
├── infrastructure/
│   ├── config/
│   │   ├── database.config.js
│   │   └── rabbitmq.config.js
│   ├── repositories/
│   │   └── user.repository.js
│   └── services/
│       └── email.service.js
└── presentation/
    ├── controllers/
    │   └── auth.controller.js
    └── routes/
        └── auth.routes.js
```

## Configuração

### Rodando com Docker

1. Clone o repositório
2. Configure as variáveis de ambiente no arquivo `docker-compose.yml`:
   - JWT_SECRET: Chave para assinatura dos tokens JWT
   - JWT_REFRESH_SECRET: Chave para assinatura dos refresh tokens
   - SMTP_USER: Email para envio de mensagens
   - SMTP_PASS: Senha do email
   - POSTGRES_PASSWORD: Senha do banco de dados
   - FRONTEND_URL: URL do frontend para configuração do CORS
3. Execute o comando: `docker-compose up --build`
4. Acesse:
   - API: http://localhost:3000
   - RabbitMQ Management: http://localhost:15672 (guest/guest)
   - PostgreSQL: localhost:5432

## Documentação da API

### Autenticação

Todas as rotas de autenticação estão disponíveis em `/api/auth/`

#### Registro de Usuário
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "usuario@exemplo.com",
  "password": "senha123"
}

Resposta (201):
{
  "message": "Usuário registrado com sucesso"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "usuario@exemplo.com",
  "password": "senha123"
}

Resposta (200):
{
  "message": "Login realizado com sucesso"
}
```

#### Refresh Token
```http
POST /api/auth/refresh
Cookie: refresh_token=<token>

Resposta (200):
{
  "message": "Tokens atualizados com sucesso"
}
```

#### Logout
```http
POST /api/auth/logout
Cookie: auth_token=<token>

Resposta (200):
{
  "message": "Logout realizado com sucesso"
}
```

#### Solicitar Recuperação de Senha
```http
POST /api/auth/recovery/request
Content-Type: application/json

{
  "email": "usuario@exemplo.com"
}

Resposta (200):
{
  "message": "Código de recuperação enviado para o email"
}
```

#### Redefinir Senha
```http
POST /api/auth/recovery/reset
Content-Type: application/json

{
  "email": "usuario@exemplo.com",
  "code": "ABC123",
  "newPassword": "nova_senha123"
}

Resposta (200):
{
  "message": "Senha alterada com sucesso"
}
```

### Códigos de Status

- 200: Sucesso
- 201: Criado com sucesso
- 400: Erro de requisição
- 401: Não autorizado
- 500: Erro interno do servidor

### Segurança

- Os tokens JWT são armazenados em cookies HttpOnly
- Token de acesso expira em 15 minutos
- Refresh token expira em 7 dias
- Proteção contra CSRF
- Headers de segurança com Helmet
- CORS configurado

### Exemplo de Uso no Frontend

```javascript
// Configuração do axios
axios.defaults.withCredentials = true;

// Login
async function login(email, password) {
  try {
    const response = await axios.post('http://localhost:3000/api/auth/login', {
      email,
      password
    });
    // Os cookies são gerenciados automaticamente
    return response.data;
  } catch (error) {
    console.error('Erro no login:', error.response.data);
    throw error;
  }
}

// Refresh token automático
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response.status === 401) {
      try {
        await axios.post('http://localhost:3000/api/auth/refresh');
        return axios(error.config);
      } catch (refreshError) {
        // Redirecionar para login
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
``` 