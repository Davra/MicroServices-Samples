'use strict';

const express = require('express');
const axios = require('axios')
const fs = require('fs')
// Constants
const SERVER_PORT = 8080;

const token = fs.readFileSync('/etc/connecthing-api/token')
// App
const app = express();

app.get('/', (req, res) => {
  res.send('Hello World from Twin microservice');
});

app.get('/list', async (req, res) => {

  try {
    const request = await axios.get("http://api.connecthing/api/v1/twins?limit=10&start=0", {
      headers: {
        'Authorization': 'Bearer ' + token
      }
    })
    console.log(request)


  } catch (err) {
    console.log(err)
  }

});

app.post('/', (req, res) => {
  res.send('The twin MS received your post request')
});

app.listen(SERVER_PORT, function () {
  console.log('davra.com node microservice listening on port ' + SERVER_PORT + '!');
});