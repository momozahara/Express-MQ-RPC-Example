import amqp from "amqplib/callback_api";
import { createPool, Pool } from "generic-pool";
import { v4 as uuid } from "uuid";

interface AmqpConnection {
  conn: amqp.Connection;
  channel: amqp.Channel;
}

const pool: Pool<AmqpConnection> = createPool(
  {
    create: async () => {
      return new Promise((resolve, reject) => {
        let connection: AmqpConnection;
        amqp.connect(process.env.SERVER_URL!, (err, conn) => {
          if (err) {
            reject(err);
          }
          conn.createChannel((err, channel) => {
            if (err) {
              reject(err);
            }
            connection = {
              conn,
              channel,
            };
            resolve(connection);
          });
        });
      });
    },
    destroy: async (connection) => {
      connection.conn.close();
    },
  },
  {
    max: 10,
    min: 2,
    idleTimeoutMillis: 30000,
    acquireTimeoutMillis: 30000,
  }
);

// eslint-disable-next-line no-unused-vars
export function callRpc(data: string, callback: (response: any) => void) {
  pool
    .acquire()
    .then((connection) => {
      const { channel } = connection;

      channel.assertQueue(
        "",
        {
          exclusive: true,
        },
        (err, queue) => {
          if (err) {
            throw err;
          }

          const correlationId = uuid();

          channel.consume(
            queue.queue,
            (msg) => {
              if (msg?.properties.correlationId === correlationId) {
                callback(JSON.parse(msg.content.toString()));
                connection.channel.deleteQueue(msg.properties.messageId!);
                pool.release(connection);
              }
            },
            {
              noAck: true,
            }
          );

          channel.sendToQueue(process.env.QUEUE_NAME!, Buffer.from(data), {
            correlationId,
            replyTo: queue.queue,
          });
        }
      );
    })
    .catch((err) => {
      console.error("Failed to acquire AMQP connection:", err);
      callback({
        status: 400,
        error: "Failed to acquire AMQP connection",
      });
    });
}
