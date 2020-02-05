const express = require('express');
const kafka = require('kafka-node');
const fs = require("fs");
const http = require("http");
const WebSocketServer = require('ws').Server;
const WebSocket = require("ws");


const app = express();

app.get('/', function (req, res) {
  res.send('connecthing.io node microservice!');
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
    
            let datum = JSON.parse(message.value);
            if(datum.name !== "davranetworks.event-gps"){
                return;
            }
            
    listeners.forEach(l => {
        try{
            l.send(message.value);
        }
        catch(err){
            console.error("Error sending msg", err);
        }
    });
    if(count++ % 1000 === 0){
        console.dir(message);
    }
});


let listeners = [];



var server = http.createServer(app);
var wss = new WebSocketServer({ server: server });
wss.on('connection', function connection(ws) {
    
    console.log("New connection");
    
    listeners.push(ws);
        
    ws.on("close", function(code, message){
        console.log("Close");
        
    });

    ws.on('message', function(data, flags) {
        console.log("Received " + data + " from clent");
    });

    ws.on("ping", function(data, flags){
        console.log("ping");
    });

    ws.on("pong", function(data, flags){
        console.log("pong");
    });

    ws.on("open", function(){            
        console.log("open");
    });
});

                       
const SERVER_PORT = 8080;
server.listen(SERVER_PORT, function () {
  console.log('microservice listening on port ' + SERVER_PORT + '!');
})

