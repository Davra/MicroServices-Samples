// Microservice webex sample to send message to webex room 

const request = require('request');
const express = require('express');
const app = express();
app.use(express.json());

// Supply an API token for uploading datapoints
var bearerToken = 'YzhmNThhZDItMWM5ZC00ZWQ5LTlkMTgtM2VkNTM2OTljODM5MTEyZmFhZjQtZGIz_P0A1_f98b67b3-1ec1-437e-acce-3fd02f2f5d04';
var baseUrl = 'https://api.ciscospark.com/v1/messages';

// Set the microservice running and listening for incoming HTTP requests
const SERVER_PORT = 8080;
app.listen(SERVER_PORT, function () {
    console.log('Davra node microservice listening on port ' + SERVER_PORT);
});

app.post('/sendmessage', function (req, res) {
        const dataToSend = {
            roomId:   req.body.message.roomId,
            text: req.body.message.message
        };

        request.post({
            url: baseUrl,
            'auth': {
                'bearer': bearerToken
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
        res.send("200 OK")
});