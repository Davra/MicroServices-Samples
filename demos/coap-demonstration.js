// For HTTP
const express = require('express')
const app = express()
// For COAP
const coap = require("node-coap-client").CoapClient;
var urlBase = "coap://coap.davra.com:5683";



// Establish a constant subscription to a topic
// ie. a GET with Observable enabled
var topicToObserve = "/hello/temperature";
var latestValue = '';
console.log('Setting up an observable get for topic ', topicToObserve);
coap.observe(urlBase + topicToObserve,"get", function(responseObj) {
		if(responseObj.payload) {
			var responseString = responseObj.payload.toString('utf8');
			console.log(new Date().toISOString() + ' Observing get received update ' + responseString);
			try {
				parsedResponse = JSON.parse(responseString);
				if(parsedResponse.payload) {
					latestValue = parsedResponse.payload;
				}
			} 
			catch (err) {
			}
		}
	})
    .then(response => { 
		console.log('Observing get was set up. Awaiting updates...');
	})
	.catch(err => { 
		/* handle error */
		console.log('Error received: ', err);
	});
	

	
// Create a HTTP server to confirming contact to the microservice	
app.get('/', function (reqIncoming, res) {
  res.send('davra.com node microservice!');
});
// Return the latestValue by HTTP if requested
app.get('/latestValue', function (reqIncoming, res) {
  res.send(latestValue);
});

// Use a http endpoint to go get the COAP value for a topic
app.get('/get/:topic*', function (reqIncoming, res) {
    console.log('http request for coap topic ');
    console.dir(reqIncoming.params);
    // Make a single COAP request
    coap.request(urlBase + "/" + reqIncoming.params['topic'],"get")
        .then(response => { 
    		console.log('Called ' + reqIncoming.params['topic'], response.payload.toString('utf8'));
    		res.send(response.payload.toString('utf8'));
    	})
    	.catch(err => { 
    		/* handle error */
    		console.log('Error received: ', err);
    	});
});

// Create the http server
const SERVER_PORT = 8080;
app.listen(SERVER_PORT, function () {
  console.log('davra.com node microservice listening on port ' + SERVER_PORT + '!');
})
	
