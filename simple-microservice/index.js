const express = require('express');
const app = express();

// An example of microservice responding to incoming HTTP requests (GET)
// You can test this by clicking the "Send" button on your far right of the code editor
app.get('/', function (req, res) {
    res.send('Davra node microservice here!');
    console.log('Http call seen arriving at this microservice');
});


app.get('/test', function (req, res) {
    res.send('Davra node microservice here!');
    console.log('Http call seen arriving at this microservice /test : ', req);
});


// Example of making an API call to another microservice inside Connecthing
var api = require("@connecthing.io/connecthing-api");
api.request({
    url: "http://api.connecthing/api/v1/devices",
    callback: function(err, response, body){
        console.log('Http call was made to /api/v1/devices and got back: ', body);
    }
});

// Set the microservice running and listening for incoming HTTP requests
const SERVER_PORT = 8080;
app.listen(SERVER_PORT, function () {
    console.log('Davra node microservice listening on port ' + SERVER_PORT);
});

// Example of repeatedly writing to the logs, thus demonstrating microservice is running
setInterval(function() {
    console.log('microservice running. Timestamp is:' + new Date());
}, 3000)
