import dotenv from "dotenv";
dotenv.config();

import amqp, { Channel, Message } from "amqplib/callback_api";

amqp.connect(process.env.SERVER_URL!, (err, connection) => {
  if (err) {
    throw err;
  }

  connection.createChannel((err, channel) => {
    if (err) {
      throw err;
    }

    channel.assertQueue(process.env.QUEUE_NAME!, {
      durable: false,
    });
    channel.prefetch(1);
    channel.consume(process.env.QUEUE_NAME!, (msg) =>
      messageHandler(msg, channel)
    );
  });
});

function messageHandler(message: Message | null, channel: Channel) {
  const key = message!.content.toString();

  interface ResponseSuccess {
    status: 200;
    message: string;
  }

  interface ResponseError {
    status: 400;
    error: string;
  }

  type Response = ResponseSuccess | ResponseError;

  let response: Response = {
    status: 200,
    message: `Key ${key} created`,
  };

  if (key === "pcode") {
    response = {
      status: 400,
      error: `Key ${key} already exsted`,
    };
  }

  channel.sendToQueue(
    message!.properties.replyTo,
    Buffer.from(JSON.stringify(response)),
    {
      correlationId: message!.properties.correlationId,
    }
  );

  channel.ack(message!);
}
