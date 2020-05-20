const express = require('express');
const rdkafka = require('node-rdkafka');
const http = require("http");
const app = express();

app.get('/', function (req, res) {
    res.send('Davra node microservice!');
});

const SERVER_PORT = 8080;
var server = http.createServer(app);
server.listen(SERVER_PORT, function () {
    console.log('Davra node microservice listening on port ' + SERVER_PORT + '!');
});


const KAFKA_GLOBAL_CONFIG = {
    // 'debug': 'all',
    'metadata.broker.list': KAFKA_HOST,
    'group.id': KAFKA_GROUP_ID,
    'enable.auto.commit': true,
    'security.protocol': 'ssl',
    'ssl.key.location': './kafka-client-tls-assets/client_key.pem',
    'ssl.certificate.location': './kafka-client-tls-assets/client_cert.pem',
    'ssl.ca.location': './kafka-client-tls-assets/ca-cert'
};
const KAFKA_TOPIC_CONFIG = {
};


var consumer = null;


///////////////////////////////////////
setupKafkaConsumer();

function setupKafkaConsumer() {
    try {
        consumer = new rdkafka.KafkaConsumer(KAFKA_GLOBAL_CONFIG, KAFKA_TOPIC_CONFIG);
        console.log("Kafka consumer listening to host "+process.env.KAFKA_HOST+" for groupId "+process.env.KAFKA_CONSUMER_GROUP_ID);
        console.dir(consumer);

        consumer.on('ready', function(arg) {
            // Connect to topic starting at latest.
            consumer.assign([ { topic: process.env.IoT_DATA_TOPIC_NAME, partition: 0, offset: rdkafka.Topic.OFFSET_END } ]);
            consumer.consume();
            console.log("Kafka consumer ready: "+JSON.stringify(arg)+"  Subscribed to ["+process.env.IoT_DATA_TOPIC_NAME+"]");
            console.dir(consumer);
        })
        .on('data', function(data) {
            console.log("Got data: "+data.value.toString());
            //TODO: consumer.commit(); if 'enable.auto.commit': false
        })
        .on('disconnected', function(arg) {
            console.log('Kafka consumer disconnected. ' + JSON.stringify(arg));
        })
        .on("event.log", function(msg) {
            console.log("Kafka event.log = "+JSON.stringify(msg));
        })
        .on("event.error", function(err) {
            console.error("Kafka consumer error", err);
            console.log(new Date() + "Kafka consumer error. Retrying connection...");
            setTimeout(function() {
                setupKafkaConsumer();
            }, 3000);
        });

        consumer.connect();
    }
    catch (err) {
        console.error("Failed to connect/handle to Kafka topic: ", err);
    }
}
