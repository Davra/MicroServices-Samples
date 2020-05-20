// Note dependencies in package.json may be like:
//    "express": "^4.15.4",
//    "@connecthing.io/connecthing-api": "~1.0.2",
//    "fs": "0.0.2",
//    "request": "2.83.0",
//	  "http": "0.0.0"


const express = require('express');
const app = express();
const fs = require('fs');
const api = require("@connecthing.io/connecthing-api"); // Required for local API calls
const request = require('request');
const http = require("http");
const https = require("https");

// An example of microservice responding to incoming HTTP requests (GET)
// You can test this by clicking the "Send" button on your far right of the code editor
app.get('/', function (req, res) {
    res.send('Davra node microservice here!');
    console.log('Http call seen arriving at this microservice');
});

app.get('/test', function (req, res) {
    res.send('Davra node microservice at /test ');
    console.log('Http call seen arriving at this microservice /test : ', req);
});


// Example of repeatedly writing to the logs, thus demonstrating microservice is running
setInterval(function() {
    console.log('microservice running. Timestamp is:' + new Date());
    // Example of making an API call to another microservice inside Connecthing
    api.request({
        url: "http://api.connecthing/api/v1/devices",
        callback: function(err, response, body){
            console.log('Http call was made to /api/v1/devices and got back: ', body);
        }
    });
}, 30000);


// Example of repeatedly writing to the logs, thus demonstrating microservice is running
setInterval(function() {
    console.log('this is an example of a change');
}, 30000);




// Set the microservice running and listening for incoming HTTP requests
const SERVER_PORT = 8080;
app.listen(SERVER_PORT, function () {
    console.log('Davra node microservice listening on port ' + SERVER_PORT);
});




// Demonstrate reading a file: package.json
app.get('/readfile', function(req, res){
   try {  
        var data = fs.readFileSync('package.json', 'utf8');
        console.log(data);    
        res.send(data);
    } catch(e) {
        console.log('Error:', e.stack);
    } 
});

// Demonstrate reading a file: data.txt
app.get('/readdata', function(req, res){
   try {  
        var data = fs.readFileSync('data.txt', 'utf8');
        console.log('Returning the contents of data.txt');    
        res.send(data);
    } catch(e) {
        console.log('Error:', e.stack);
    } 
});



//  Create an endpoint which supplies back data
app.get('/random', function (req, res) {
  res.send(Math.round( Math.random() * 100 ).toString());
});



// Retrieve data from Connecthing timeseries DB
// Optionally put ?device=123 in the url when makeing the GET request
app.get('/localdata', function (req, res) {
    console.log('Request made for local data');
    var uuidToGet = "660d5a82-64ce-44a4-b201-add9a6029a24";
    if(req.query.device != undefined) {
        console.log('A particular device was specified in the params: ', req.query.device);
        uuidToGet = req.query.device;
    }
    var copyOfRes = res;
    var queryForDb = {
        "metrics": [
            {
                "name": "43040_100",
                "tags": {
                    "UUID": uuidToGet,
                }
            }
        ],
        "start_relative": {
            "value": "1",
            "unit": "days"
        }
    }
    api.request({
        url: "http://api.connecthing/api/v1/timeseriesData",
        contentType: "application/json",
        headers: {
          'Content-Type': 'application/json'
	},	    
        body: JSON.stringify(queryForDb),
        method: "POST",
        callback: function(err, response, body){
            console.log('Http call was made to /api/v1/timeseriesData and got back: ', body);
            copyOfRes.send(body);
        }
    });

});


// Retrieve remote data from elsewhere
app.get('/remotedata', function (req, res) {
    console.log('Request made for remote data');
    var copyOfRes = res;
	var options = {
	  hostname: 'stationdata.wunderground.com',
	  port: 443,
	  path: '/cgi-bin/stationlookup?station=ILONDON581&units=metric&v=2.0&format=json',
	  method: 'GET',
	  headers: {
       'User-Agent': 'Chrome/59.0.3071.115'
	  },
	  ciphers: 'DES-CBC3-SHA'
	};
	//console.log('getting options ', options);
    https.get(options, function(res2){
        var str = '';
        res2.on('data', function (chunk) {
            str += chunk;
        });
        res2.on('end', function () {
            console.log('Retrieved remote data ', str);
			copyOfRes.send(str);
        });
    });
});
