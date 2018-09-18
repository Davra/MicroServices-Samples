const express = require('express');
const app = express();
var fs = require('fs');
var api = require("@connecthing.io/connecthing-api"); // Required for local API calls
var request = require('request');
var http = require("http");
var https = require("https");

// An example of microservice responding to incoming HTTP requests (GET)
// You can test this by clicking the "Send" button on your far right of the code editor
app.get('/', function (req, res) {
  res.send('connecthing.io node microservice here!');
  console.log('Http call seen arriving at this microservice');
});


// Put data into the Connecthing timeseries DB
// Simple version, just 1 device with 1 value for a metric
var simplePutDataIntoTimeSeriesDb = function(deviceUuid, metricName, metricValue, callback) {
    console.log('Putting the following data into the db: ', deviceUuid, metricName, metricValue);
    var dataToSend = {
        "UUID": deviceUuid,
        "name": metricName,
        "value": metricValue,
        "msg_type": "datum"
    }
    api.request({
        url: "http://api.connecthing/api/v1/iotdata",
        contentType: "application/json",
        body: JSON.stringify(dataToSend),
        method: "PUT",
        callback: function(err, response, body){
            if(callback) {
                callback(err, response);
            }
        }
    });
};


// Use api endpoint to instigate inserting data into the DB
app.get('/insertdata', function (req, res) {
    console.log('Request made to insert data into DB');
    var copyOfRes = res;
    simplePutDataIntoTimeSeriesDb('e1082ec8-4881-4017-8ce3-ff937c09f6c0', '43040_100', 15, function(err, responseFromServer) {
        if(err === undefined && err === null) {
            copyOfRes.send('Request made to insert data into DB finished. response was ' + responseFromServer.statusCode);
        } else {
            console.log('Request made to insert data into DB finished. ERROR was encountered ', err);
            copyOfRes.send('Request made to insert data into DB finished. ERROR was encountered');
        }
    });
});




// Set the microservice running and listening for incoming HTTP requests
const SERVER_PORT = 8080;
app.listen(SERVER_PORT, function () {
  console.log('connecthing.io node microservice listening on port ' + SERVER_PORT);
});
