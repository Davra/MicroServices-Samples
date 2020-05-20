// Watch for incoming calls from Jenkins and make calls to webex
// to insert messages into appropriate webex spaces
//
const api = require("@connecthing.io/connecthing-api"); // Required for local API calls
const request = require('request');
const http = require("http");
const https = require("https");
const express = require('express');
const app = express();

// Supply an API token for uploading datapoints
var bearerToken = 'XXXXXXXX';
var baseUrl = 'https://api.ciscospark.com/v1/messages';

// GET YOUR ROOM ID from: https://developer.webex.com/endpoint-rooms-get.html
var roomId = 'XXXXXXXXXXXXXXX';

console.log('Jenkins Webex bridge has started');

app.post('/', function (req, res) {
    var bodyStr = '';
    req.on("data",function(chunk){
        bodyStr += chunk.toString();
    });
    req.on("end",function(){
        var body2 = decodeURIComponent(bodyStr);
        res.send('thanks, bridge has received the call ');
        console.log('Making call to webex for ', body2);
        var myStatus = (bodyStr.indexOf('failure') > -1) ? 'FAIL' : 'success';
        const dataToSend = {
            "roomId":   roomId,
            "text": myStatus + " Jenkins build: " + body2
        };
        request.post({
            url: baseUrl,
            'auth': {
                'bearer': 'XXXXX'
            },
            contentType: "application/json",
            json: true,
            body: dataToSend,
            method: "POST",
            callback: function(err, response, body){
                if(err === undefined || err === null) {
                    console.log('Request made to webex. response was ' + JSON.stringify(response));
                } else {
                    console.log('Request made to webex. ERROR was encountered ', err);
                }
            }
        });
    });
});


// Set the microservice running and listening for incoming HTTP requests
const SERVER_PORT = 8080;
app.listen(SERVER_PORT, function () {
    console.log('Davra node microservice listening on port ' + SERVER_PORT);
});
