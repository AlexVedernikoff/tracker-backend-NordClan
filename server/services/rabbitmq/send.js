const amqp = require("amqplib/callback_api")
const config = require('../../configs').rabbitMq;

const queue = config.queue;

let channel;

const initRMQ = () => {
  amqp.connect(config.options, (err, connection) => {
    if (err) {
      return
    }
    connection.createChannel((err, ch) => {
      ch.assertQueue(queue)
      channel = ch
    })
  })
}

const sendToRMQ = async(body) => {
  if (!channel) {
    return
  }
  const message = typeof body === "object" ? JSON.stringify(body) : body.toString();
  channel.assertQueue(queue)
  await channel.sendToQueue(queue, Buffer.from(message))
}

module.exports = {
  initRMQ,
  sendToRMQ
}


