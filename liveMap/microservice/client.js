const WebSocket = require('ws');
 
const ws = new WebSocket('ws://localhost:8080/');
 
ws.on('open', function open() {
  ws.send('something');
});
 
ws.on('message', data => {
  console.log(data);
});

ws.on("error", err => {
    console.error("Socket failure: ", err);
});
