const express = require('express');
const kafka = require('kafka-node');
const fs = require("fs");
const app = express();


app.get('/', function (req, res) {
    res.send('Davra node microservice!');
});

const SERVER_PORT = 8080;
app.listen(SERVER_PORT, function () {
    console.log('Davra node microservice listening on port ' + SERVER_PORT + '!');
});

const ConsumerGroup = kafka.ConsumerGroup;
const consumer = new ConsumerGroup({
    kafkaHost: process.env.KAFKA_HOST,
    groupId: process.env.KAFKA_CONSUMER_GROUP_ID,
    fromOffset: "earliest",
    ssl: true,
    sslOptions: {
        key: fs.readFileSync('/etc/davra/tls/tls.key'),
        cert: fs.readFileSync('/etc/davra/tls/tls.crt'),
        ca: [ fs.readFileSync("/etc/davra/tls/ca-cert") ],
        rejectUnauthorized: false
    } 
  },
  [ process.env.IoT_DATA_TOPIC_NAME ]);

consumer.on('error', function (err) {
    console.error("Kafka consumer group reporting error", err);
    console.error(err.stack);  
    process.exit(1);
});

let count=0;
consumer.on("message", function(message){
    if(count++ % 1000 === 0){
        console.dir(message);
    }
});
