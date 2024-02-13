const { Kafka } = require('kafkajs');


class kafkaProducer{

    constructor(){

        this.kafka = new Kafka({
            clientId: 'my-app',
            brokers: ['localhost:9092'], // Replace with your Kafka broker(s)
          });
          this.producer = this.kafka.producer();
    }


    async connectProducer() {
        await this.producer.connect();
      }
    
      async produceMessage(topic, message) {
        try {
          await this.producer.send({
            topic,
            messages: [{ value: JSON.stringify(message) }],
          });
          return true;
        } catch (error) {
          console.error('Error producing message to Kafka:', error);
          return false;
        }
      }
    
      async disconnectProducer() {
        await this.producer.disconnect();
      }
}

module.exports = kafkaProducer;

