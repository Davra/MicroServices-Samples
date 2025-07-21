const fs = require("fs");
const axios = require('axios');
const express = require('express');

const app = express();
const API_HOST = process.env.DAVRA_API_HOST || 'http://api.connecthing';
console.log(`Using ${API_HOST} to make davra calls`);

/* Read-in the api token granted to the microservice 
This token is mounted into the container running your custom microservice by the Davra Platform
The token identifies the microservice entity to the Davra Platform when making api calls from the 
microservice.*/
const token = fs.readFileSync("/etc/connecthing-api/token", {encoding: 'utf-8'}).trim();

// An example of microservice responding to incoming HTTP requests (GET)
// You can test this by clicking the "Send" button on your far right of the code editor
app.get('/', function (req, res) {
    res.send('Davra node microservice here!');
    console.log('Http call seen arriving at this microservice');
});

/* An example of an api call being exposed by a custom microservice which in turn makes a call to the Davra platform*/
app.get('/davra', async function (req, res) {
    try {
        const opts = {
            method: "GET",
            baseURL: API_HOST,
            url: '/api/v1/devices',
            params: {
                start: 0,
                limit: 1
            },
            headers: {
                'Authorization': `Bearer ${token}`
            }
        };
        const result = await axios(opts);
        res.send(`Total device records found: ${result.data.totalRecords}`);
    } catch (err) {
        console.error('Error processing api call', err);
        res.status(500).send(`Failed to make api call: ${err.message}`);
    }
});


// Set the microservice running and listening for incoming HTTP requests
const SERVER_PORT = 8080;
app.listen(SERVER_PORT, function () {
    console.log('Davra node microservice listening on port ' + SERVER_PORT);
});
