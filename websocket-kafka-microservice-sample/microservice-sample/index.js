const kafka = require('kafka-node');
const fs = require("fs");
const ws = require('ws');
const moment = require('moment')

const wss = new ws.Server({ port: 8080 });

wss.on('connection', function connection(ws) {
    ws.on('message', function incoming(message) {
    });

    console.log('New Connection')
    const ConsumerGroup = kafka.ConsumerGroup;
    const consumer = new ConsumerGroup({
        kafkaHost: process.env.KAFKA_HOST,
        groupId: process.env.KAFKA_CONSUMER_GROUP_ID,
        fromOffset: "earliest",
        ssl: true,
        sslOptions: {
            key: fs.readFileSync('/etc/davra/tls/tls.key'),
            cert: fs.readFileSync('/etc/davra/tls/tls.crt'),
            ca: [fs.readFileSync("/etc/davra/tls/ca-cert")],
            rejectUnauthorized: false
        }
    },
        [process.env.IoT_DATA_TOPIC_NAME]);

    consumer.on('error', function (err) {
        console.error("Kafka consumer group reporting error", err);
        console.error(err.stack);
        process.exit(1);
    });

    function processMessage(message) {
        try {
            var datum = JSON.parse(message.value);

            if (datum.name != "43040_100") {
                return;
            }

            if (!datum.tags) {
                return;
            }
            //Only send if data created in the last 30 seconds
            if (moment().subtract(30, 'seconds').valueOf() <= datum.timestamp) {
                wss.broadcast(JSON.stringify(datum));
                console.log("Data Sent!");
            }
        }
        catch (err) {
            console.error("failed to process datum: ", err);
        }
    }

    consumer.on("message", function (message) {
        processMessage(message);
    });

});

wss.broadcast = function broadcast(msg) {
    console.log(msg);
    wss.clients.forEach(function each(client) {
        client.send(msg);
    });
};