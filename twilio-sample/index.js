const express = require('express');
const app = express();
require('dotenv').config();
const fs = require("fs");
const { validateMessageData, formatWhatsappNumber } = require('./validation');

const SERVER_PORT = 8080;
const accountSid = process.env.TWILIO_ACCOUNT_SID ? process.env.TWILIO_ACCOUNT_SID : fs.readFileSync('/etc/secrets/twilio/sid', "utf8");
const authToken = process.env.TWILIO_AUTH_TOKEN ? process.env.TWILIO_AUTH_TOKEN : fs.readFileSync('/etc/secrets/twilio/authtoken', "utf8");
const client = require('twilio')(accountSid, authToken);

app.listen(SERVER_PORT, function () {
    console.log('davra.com node microservice listening on port ' + SERVER_PORT + '!');
});

app.use(express.json());

app.post('/sms', function (req, res) {

    const data = { 
        phoneNumber: req.body.message.phoneNumber,
        message: req.body.message.message
    }

    const { valid, errors } = validateMessageData(data); 
    if (!valid) return res.status(400).json(errors);

    client.messages
        .create({ body: data.message, from: '+13343266458', to: data.phoneNumber })
        .then(message => console.log(message.sid)).catch(err => console.log(err));
    res.send("200 OK")
});

app.post('/whatsapp', function (req, res) {

    const data = { 
        phoneNumber: req.body.message.phoneNumber,
        message: req.body.message.message
    }

    const { valid, errors } = validateMessageData(data); 
    if (!valid) return res.status(400).json(errors);

    const whatsappNumber = formatWhatsappNumber(data.phoneNumber);

    client.messages
        .create({ body: data.message, from: 'whatsapp:+14155238886', to: whatsappNumber })
        .then(message => console.log(message.sid)).catch(err => console.log(err));
    res.send("200 OK")
});
