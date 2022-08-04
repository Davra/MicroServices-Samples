const express = require('express');
const app = express();
const bodyParser = require("body-parser");

const { processData } = require('./device');

app.use(bodyParser.urlencoded({ limit: "5mb", extended: false }));
app.use(bodyParser.json({ limit: "5mb" }));

app.get('/', function (req, res) {
  res.send('davra.com node microservice!');
});

app.post('/', function (req, res) {
  console.log("New payload...")
  console.log(req.body)
  processData(req.body)
  res.send('Data received by Davra!');
});

app.post('/*', function (req, res) {
  const resp = { received: req.body, at: req.url }
  console.log(JSON.stringify(resp, 4))
  res.json(resp)
}) 

const SERVER_PORT = 8080;
app.listen(SERVER_PORT, function () {
  console.log('davra.com node microservice listening on port ' + SERVER_PORT + '!');
});
