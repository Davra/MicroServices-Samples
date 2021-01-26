const mqtt = require('mqtt');

const MQTT_BROKER = '54.154.232.195:32282';
const client  = mqtt.connect('mqtt://' + MQTT_BROKER);

const TOPIC_NAME = 'testTopic';
 
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
});