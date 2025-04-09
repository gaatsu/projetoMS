const nodemailer = require('nodemailer');
const rabbitmqConfig = require('../config/rabbitmq.config');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  async start() {
    try {
      await rabbitmqConfig.connect();
      await this.setupQueues();
      console.log('Serviço de email iniciado com sucesso');
    } catch (error) {
      console.error('Erro ao iniciar serviço de email:', error);
      throw error;
    }
  }

  async setupQueues() {
    try {
      const channel = rabbitmqConfig.channel;
      
      // Configurar fila de emails
      await channel.assertQueue('email_queue', { durable: true });
      
      // Configurar consumidor
      channel.consume('email_queue', async (msg) => {
        if (msg) {
          try {
            const data = JSON.parse(msg.content.toString());
            console.log('Processando email:', data);

            if (data.type === 'recovery_code') {
              await this.sendRecoveryEmail(data.email, data.code);
            }

            channel.ack(msg);
          } catch (error) {
            console.error('Erro ao processar mensagem:', error);
            // Rejeitar a mensagem e colocá-la de volta na fila
            channel.nack(msg);
          }
        }
      });

      console.log('Consumidor de email configurado');
    } catch (error) {
      console.error('Erro ao configurar filas:', error);
      throw error;
    }
  }

  async sendRecoveryEmail(email, code) {
    try {
      const mailOptions = {
        from: process.env.SMTP_USER,
        to: email,
        subject: 'Recuperação de Senha',
        html: `
          <h1>Recuperação de Senha</h1>
          <p>Seu código de recuperação é: <strong>${code}</strong></p>
          <p>Este código expira em 15 minutos.</p>
          <p>Se você não solicitou esta recuperação, ignore este email.</p>
        `
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email de recuperação enviado:', info.messageId);
    } catch (error) {
      console.error('Erro ao enviar email de recuperação:', error);
      throw error;
    }
  }
}

module.exports = new EmailService(); 