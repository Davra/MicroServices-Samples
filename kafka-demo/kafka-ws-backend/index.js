// Kafka WebSocket Bridge
import { Kafka } from 'kafkajs';
import { WebSocketServer } from 'ws';
import fs from 'fs';

const tenantId = process.env.TENANT_ID || 'default-tenant';
const kafkaBroker = process.env.KAFKA_HOST || 'kafka-broker:9092';
const consumerGroup = process.env.KAFKA_CONSUMER_GROUP_ID || 'iot-microservice-group';
// kafka topics are name env variables are mounted automatically in your container
const twinTopicName = process.env.TWIN_UPDATES_TOPIC_NAME || `${tenantId}.twin-updates`;
const deviceUpdatesTopicName = process.env.DEVICE_UPDATES_TOPIC_NAME || `${tenantId}.device-updates`;
const rubanIotDataTopicName = process.env.IoT_DATA_TOPIC_NAME || `${tenantId}.ruban-iotdata`;
const twintypeUpdatesTopicName = process.env.TWIN_TYPE_UPDATES_TOPIC_NAME || `${tenantId}.twintype-updates`;

const kafka = new Kafka({
    clientId: 'kafka-ws-bridge',
    brokers: [kafkaBroker],
    ssl: fs.existsSync('/etc/davra/tls/tls.key') ? {
        key: fs.readFileSync('/etc/davra/tls/tls.key'),
        cert: fs.readFileSync('/etc/davra/tls/tls.crt'),
        ca: [fs.readFileSync('/etc/davra/tls/ca-cert')],
        rejectUnauthorized: false
    } : false
});



const topics = [
    rubanIotDataTopicName,
    deviceUpdatesTopicName,
    twinTopicName,
    twintypeUpdatesTopicName
];

console.log(topics)

const wss = new WebSocketServer({ port: 8080 });
console.log('WebSocket server started on ws://:8080');

wss.on('connection', ws => {
    ws.send(JSON.stringify({ type: 'info', message: 'Connected to Kafka WebSocket bridge.' }));
});

// Buffer for messages to be sent to WebSocket clients
let messageBuffer = [];

// Throttle interval (ms)
const THROTTLE_INTERVAL = 1000;

// Throttled broadcast function
setInterval(() => {
    if (messageBuffer.length > 0) {
        const payload = JSON.stringify(messageBuffer);
        if (messageBuffer.length === 0) {
            return;
        }
        console.log(`Broadcasting ${messageBuffer.length} messages to WebSocket clients`);
        wss.clients.forEach(client => {
            if (client.readyState === 1) {
                client.send(payload);
            }
        });
        messageBuffer = [];
    }
}, THROTTLE_INTERVAL);

async function run() {
    const consumer = kafka.consumer({ groupId: consumerGroup });
    await consumer.connect();
    for (const topic of topics) {
        await consumer.subscribe({ topic, fromBeginning: false }).catch(err => {
            console.error(`Failed to subscribe to topic ${topic}:`, err);
        });
    }
    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            const value = message.value.toString();
            const payload = { topic, value, partition, timestamp: message.timestamp };
            // Push to buffer instead of sending immediately
            messageBuffer.push(payload);
            console.log(`Received message from topic ${topic}:`, payload);

        }
    });
    console.log('Kafka consumer is running and forwarding messages to WebSocket clients...');
}

run().catch(console.error);
