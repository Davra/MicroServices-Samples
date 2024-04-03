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
    res.send('Hello World from Device MS');
});

app.get('/list', async (req, res) => {
    try {
        const request = await axios.get("http://api.connecthing/api/v1/devices?limit=10&start=0", {
            headers: {
                'Authorization': 'Bearer ' + token
            }
        })

        res.json(request.data)
    } catch (err) {
        console.log(err)
    }
});
app.post('/', (req, res) => {
    res.send('The device MS received your post request')
});

app.put('/', (req, res) => {
    res.send('The device MS received your put request')
});

app.listen(SERVER_PORT, function () {
    console.log('davra.com node microservice listening on port ' + SERVER_PORT + '!');
});