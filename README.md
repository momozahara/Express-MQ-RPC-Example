# Express MQ RPC Example
An example of Message Queue RPC using [`amqplib`](https://www.npmjs.com/package/amqplib) with [`express`](https://www.npmjs.com/package/express) and using [`generic-pool`](https://www.npmjs.com/package/generic-pool) to manage connection pool for [`amqplib`](https://www.npmjs.com/package/amqplib)

## Installation

Rename `.env.example` to `.env` and replace `SERVER_URL` and `QUEUE_NAME` with your own note that `QUEUE_NAME` on the same environment must be the exact same value

## Debug

For VSCode you can use [`compound`](./.vscode/launch.json#L38) to build and start for both project in the same click

## Structure

Backend -> [ MQ ] -> Worker -> [ MQ ] -> Backend

*tested using [`RabbitMQ`](https://www.rabbitmq.com/)