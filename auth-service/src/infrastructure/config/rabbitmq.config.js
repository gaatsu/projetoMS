const amqp = require('amqplib');

class RabbitMQConfig {
  constructor() {
    this.connection = null;
    this.channel = null;
    this.isConnecting = false;
  }

  async connect() {
    if (this.connection) return;
    if (this.isConnecting) return;
    
    this.isConnecting = true;
    try {
      console.log('Tentando conectar ao RabbitMQ...');
      this.connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost');
      this.channel = await this.connection.createChannel();
      console.log('Conectado ao RabbitMQ com sucesso');

      // Configurar handlers de erro
      this.connection.on('error', (error) => {
        console.error('Erro na conexão RabbitMQ:', error);
        this.connection = null;
        this.channel = null;
      });

      this.connection.on('close', () => {
        console.log('Conexão RabbitMQ fechada');
        this.connection = null;
        this.channel = null;
      });

    } catch (error) {
      console.error('Erro ao conectar ao RabbitMQ:', error);
      this.connection = null;
      this.channel = null;
      throw error;
    } finally {
      this.isConnecting = false;
    }
  }

  async sendToQueue(queue, message) {
    try {
      if (!this.connection || !this.channel) {
        await this.connect();
      }

      await this.channel.assertQueue(queue, { durable: true });
      this.channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));
      console.log(`Mensagem enviada para a fila ${queue}`);
    } catch (error) {
      console.error('Erro ao enviar mensagem para a fila:', error);
      throw error;
    }
  }
}

module.exports = new RabbitMQConfig(); 