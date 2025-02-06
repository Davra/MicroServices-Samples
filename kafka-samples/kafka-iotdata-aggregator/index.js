
const express = require('express');
const kafka = require('kafka-node');
const fs = require("fs");
const app = express();

// const aggregator = require("./aggregator.js");



// var config = {
//     DEBUG: false,
//     redis: {
//         host: "redis.default",
//         port: 6379
//     },
//     bucket_size: 60 * 60 * 1000,
//     bucket_ttl: 24 * 60 * 60 * 1000
// };


app.get('/', function (req, res) {
    res.send('Davra node microservice!');
});

const SERVER_PORT = 8080;
app.listen(SERVER_PORT, function () {
    console.log('Davra node microservice listening on port ' + SERVER_PORT + '!');
});

// aggregator.init(config);


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
  [ 'ruban.twin-updates' ]);

consumer.on("message", function(message){
    //console.log("Message: %o", message);
    // aggregator.processMessage(message);
});


consumer.on("error", function(err){
    console.error('Kafka broker error', err);
    process.exit(1);  
});


/*Instruct all aggregators to flush to iotdata*/
// setInterval(function(){
//     aggregator.writeToStore().catch((err) => {console.error("Error writing to iotdata", err);});
// }, 2500);

