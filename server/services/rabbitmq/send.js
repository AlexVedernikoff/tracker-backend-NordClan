const amqp = require("amqplib/callback_api")
const config = require('../../configs').rabbitMq;

const exchange = config.exchange;
const routingKey = config.routingKey;

let channel;

const initRMQ = () => {
  amqp.connect(config.options, (err, connection) => {
    if (err) {
      return
    }
    connection.createChannel((err, ch) => {
      channel = ch
    })
  })
}

const sendToRMQ = async(body) => {
  if (!channel) {
    return;
  }
  const message = typeof body === "object" ? JSON.stringify(body) : body.toString();
  await channel.publish(exchange, routingKey, Buffer.from(message))
}

module.exports = {
  initRMQ,
  sendToRMQ
}


