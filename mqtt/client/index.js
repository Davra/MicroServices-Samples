const mqtt = require('mqtt');

const api = require('@connecthing.io/connecthing-api');

const TENANT_ID = ''; //set this to your tenant ID
const API_HOST = process.env.DAVRA_API_HOST
const MQTT_BROKER = `mqtt.${TENANT_ID}.davra.com:8883`;
const password = fs.readFileSync('/etc/connecthing-api/token','utf8');
const client  = mqtt.connect('mqtts://' + MQTT_BROKER, {
    username: '38131ef2-f8a4-4982-ab13-e71f82066b21', // Set this to your service UUID
    password
});

const TOPIC_NAME = 'device/+/data';
 
client.on('connect', () => {
  console.log('MQTT client connected');
  client.subscribe(TOPIC_NAME, (err) => {
      if (!err) {
        console.log('MQTT client subscribed to ' + TOPIC_NAME);
      } else {
        console.log('Error subscribing to topic ' + TOPIC_NAME);
        console.log(err);
      }
  });
});
 
client.on('message', (topic, message) => {
  console.log('New message on topic: ' + topic);
  console.log('Message: ' + message.toString());
  const [,deviceUuid] = topic.split('/');
  const dataToSend = {
    UUID: deviceUuid,
    name: 'com.davra.test',
    value: message,
    msg_type: 'datum'
  }
  api.request({
    url: API_HOST+'/api/v1/iotdata',
    contentType: 'application/json',
    body: JSON.stringify(dataToSend),
    method: 'PUT'
  });
});