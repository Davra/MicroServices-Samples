const express = require('express');

// Import the prometheus client library
const prom = require("prom-client");

// Enable the collection standard stats for nodejs applications
prom.collectDefaultMetrics();

// Define a custom metric or your own
const requestCount = new prom.Counter({
    name: "request_count",
    help: "The number of requests made to my app"
});


const app = express();

app.get('/', function (req, res) {
    
    // Increment your request counter
    requestCount.inc();
    
    res.send('davra.com node microservice!');
});

app.get('/metrics', (req, res) => {
    res.writeHead(200, {"content-type": "text/plain"});
    res.write(prom.register.metrics());
    res.end();
});

const SERVER_PORT = 8080;
app.listen(SERVER_PORT, function () {
  console.log('davra.com node microservice listening on port ' + SERVER_PORT + '!');
});
