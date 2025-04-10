# Serviço de Autenticação

Serviço de autenticação e gerenciamento de usuários usando Node.js, Express, JWT, RabbitMQ e PostgreSQL.

## 🚀 Tecnologias

- Node.js
- Express
- PostgreSQL
- RabbitMQ
- JWT (JSON Web Tokens)
- Docker & Docker Compose
- Nodemailer (para envio de emails)

## 📋 Pré-requisitos

- Docker
- Docker Compose
- Node.js (para desenvolvimento local)
- NPM ou Yarn

## 🔧 Configuração

1. Clone o repositório
2. Configure as variáveis de ambiente no arquivo `docker-compose.yml`:
   ```yaml
   environment:
     - JWT_SECRET=seu_jwt_secret
     - JWT_REFRESH_SECRET=seu_jwt_refresh_secret
     - SMTP_USER=seu_email@gmail.com
     - SMTP_PASS=sua_senha_de_app_gmail
     - FRONTEND_URL=http://localhost:3000
   ```

3. Inicie os serviços:
   ```bash
   docker-compose up --build
   ```

## 🌐 Endpoints da API

### Autenticação

- `POST /api/auth/register` - Registro de novo usuário
  ```json
  {
    "email": "usuario@email.com",
    "password": "senha123"
  }
  ```

- `POST /api/auth/login` - Login de usuário
  ```json
  {
    "email": "usuario@email.com",
    "password": "senha123"
  }
  ```

- `POST /api/auth/refresh` - Renovar token de acesso
  ```json
  {
    "refreshToken": "seu_refresh_token"
  }
  ```

- `POST /api/auth/logout` - Logout do usuário

### Recuperação de Senha

- `POST /api/auth/recovery/request` - Solicitar recuperação de senha
  ```json
  {
    "email": "usuario@email.com"
  }
  ```

- `POST /api/auth/recovery/reset` - Redefinir senha
  ```json
  {
    "email": "usuario@email.com",
    "code": "123456",
    "newPassword": "nova_senha123"
  }
  ```

### Usuário

- `GET /api/auth/user` - Obter dados do usuário atual
- `PUT /api/auth/user` - Atualizar dados do usuário
  ```json
  {
    "email": "novo_email@email.com"
  }
  ```
- `DELETE /api/auth/user` - Deletar usuário

## 🔐 Segurança

- Tokens JWT com expiração curta (15 minutos)
- Refresh tokens com expiração longa (7 dias)
- Senhas hasheadas com bcrypt
- Cookies HttpOnly para armazenamento seguro
- Headers de segurança com Helmet
- CORS configurado para origem específica
- Rate limiting para proteção contra ataques

## 📨 Eventos do Sistema

O serviço publica eventos no RabbitMQ para integração com outros serviços:

### Eventos Disponíveis

1. **Criação de Usuário**
   - Evento: `auth.user.created`
   - Dados: `{ id, email, createdAt }`

2. **Login**
   - Evento: `auth.login.success`
   - Dados: `{ id, email, timestamp }`
   - Evento: `auth.login.failed`
   - Dados: `{ email, reason, timestamp }`

3. **Atualização de Usuário**
   - Evento: `auth.user.updated`
   - Dados: `{ id, email, updatedAt }`

4. **Deleção de Usuário**
   - Evento: `auth.user.deleted`
   - Dados: `{ id, email, deletedAt }`

5. **Alteração de Senha**
   - Evento: `auth.password.changed`
   - Dados: `{ id, email, changedAt }`

### Como Consumir Eventos

Para consumir eventos em outro serviço:

1. Conecte ao RabbitMQ:
   ```javascript
   const amqp = require('amqplib');
   
   async function connect() {
     const connection = await amqp.connect('amqp://rabbitmq');
     const channel = await connection.createChannel();
     return channel;
   }
   ```

2. Inscreva-se em um evento:
   ```javascript
   async function subscribeToEvent() {
     const channel = await connect();
     const queue = 'auth.user.created';
     
     await channel.assertQueue(queue);
     
     channel.consume(queue, (data) => {
       const event = JSON.parse(data.content);
       console.log('Novo usuário criado:', event);
       channel.ack(data);
     });
   }
   ```

## 📧 Serviço de Email

O sistema utiliza o RabbitMQ para processar emails de forma assíncrona:

1. **Email de Boas-vindas**
   - Enviado após registro
   - Template: `welcome.html`

2. **Email de Recuperação de Senha**
   - Enviado após solicitação
   - Template: `recovery.html`
   - Contém código de 6 dígitos

3. **Email de Confirmação de Alteração de Senha**
   - Enviado após alteração de senha
   - Template: `password-changed.html`

## 🐳 Estrutura do Projeto

```
auth-service/
├── src/
│   ├── application/
│   │   ├── services/
│   │   │   └── auth.service.js
│   │   └── routes/
│   │       └── auth.routes.js
│   ├── domain/
│   │   └── entities/
│   │       └── user.entity.js
│   ├── infrastructure/
│   │   ├── config/
│   │   │   ├── database.config.js
│   │   │   └── rabbitmq.config.js
│   │   ├── repositories/
│   │   │   └── user.repository.js
│   │   └── services/
│   │       ├── email.service.js
│   │       └── event.service.js
│   └── server.js
├── docker-compose.yml
├── Dockerfile
└── package.json
```

## 🔄 Fluxo de Dados

1. **Registro de Usuário**
   ```
   Cliente -> API -> AuthService -> UserRepository -> PostgreSQL
                                    -> EventService -> RabbitMQ
                                    -> EmailService -> RabbitMQ
   ```

2. **Login**
   ```
   Cliente -> API -> AuthService -> UserRepository -> PostgreSQL
                                    -> EventService -> RabbitMQ
   ```

3. **Recuperação de Senha**
   ```
   Cliente -> API -> AuthService -> UserRepository -> PostgreSQL
                                    -> EmailService -> RabbitMQ
   ```

## 🛠️ Desenvolvimento

Para desenvolvimento local:

1. Instale as dependências:
   ```bash
   npm install
   ```

2. Configure o arquivo `.env`:
   ```
   PORT=3001
   JWT_SECRET=seu_jwt_secret
   JWT_REFRESH_SECRET=seu_jwt_refresh_secret
   SMTP_USER=seu_email@gmail.com
   SMTP_PASS=sua_senha_de_app_gmail
   FRONTEND_URL=http://localhost:3000
   ```

3. Inicie o servidor:
   ```bash
   npm run dev
   ```

## 📝 Logs

O sistema utiliza diferentes níveis de log:

- `info`: Operações normais
- `warn`: Avisos e tentativas de login falhas
- `error`: Erros críticos

Para visualizar logs em produção:
```bash
docker-compose logs -f auth-service
```

## 🔍 Monitoramento

Para monitorar o RabbitMQ:
1. Acesse: `http://localhost:15672`
2. Credenciais: guest/guest
3. Monitore:
   - Filas de eventos
   - Filas de email
   - Taxa de mensagens
   - Consumidores ativos 