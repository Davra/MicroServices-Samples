"use strict";

const express = require('express')
const http = require("http");
const app = express()

/*
NOTE!
You will need to add the ws library to your package.json!!!!
it should look like this:
{
  "name": "microservice",
  "version": "1.0.0",
  "description": "connecthing.io microservice",
  "main": "index.js",
  "scripts": {
    "start": "node index.js 2>&1",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "author": "connecthing.io",
  "license": "ISC",
  "dependencies": {
    "express": "^4.15.4",
    "@connecthing.io/connecthing-api": "~1.0.2",
    "ws": "^1.1.0"
  }
}

*/
const WebSocketServer = require('ws').Server;
const WebSocket = require("ws");


app.get('/', function (req, res) {
  res.send('connecthing.io node microservice!')
})

/*
The following code creates a websocket endpoint in your microservice. To open
a websocket from a custom widget your websocket URL would look like:
ws://[my-domain].davra.com/api/v1/microservices/workspaces/[workspace uuid]/proxy

Here is sample code you can paste into a custom Widget Template

    <script>

        function createWebSocket( path ){
            var target = null;
            console.dir(window.location.protocol);
            if (window.location.protocol == 'http:') {
                target = 'ws://' + window.location.host + path;
            } else {
                target = 'wss://' + window.location.host + path;
            }
            
            var ws = null;
            if ('WebSocket' in window) {
                ws = new WebSocket(target);
            } else if ('MozWebSocket' in window) {
                ws = new MozWebSocket(target);
            } else {
                console.warn('WebSocket is not supported by this browser.');
            }
            return ws;
        }
    
        //CHANGE THE NAME OF THE WORKSPACE UUID HERE
	//YOU GET THIS UUID BY OPENING THE WORKSPACE IDE
	//PRESSING F12 AND IN THE CONSOLE TYPE THE FOLLOWING:
	//document.workspace.UUID
	//TAKE THE VALUE OF THE WORKSPACE UUID AND REPLACE THE
	//TEXT <uuid of your workspace> WITH IT
        var ws = createWebSocket("/api/v1/microservices/workspaces/<uuid of your workspace>/proxy/"); 
    
        ws.onerror = function(e){
      		console.error("Error", e);
      	};

      	ws.onclose = function(e){
	        console.log("Close", e);
    	};
    
        ws.onmessage = function(e){
            $(document.body).html("Message: " + e.data.toString());
        }

    </script>
*/


var server = http.createServer(app);
var wss = new WebSocketServer({ server: server });
wss.on('connection', function connection(ws) {
    
    console.log("Websocket opened: " + ws.upgradeReq.url);
    var timer = setInterval(function(){
        try{
            if(ws.readyState == WebSocket.OPEN){
                var msg = new Date().valueOf() + "....";
                console.log("Sending: " + msg);
                ws.send(msg);
            }
        }
        catch(err){
            console.error(err.stack);
        }
    }, 1000);
        
    ws.on("close", function(code, message){
        console.log("Close");
        clearInterval(timer);
    });

    ws.on('message', function(data, flags) {
        console.log("Received " + data + " from clent");
    });

    ws.on("ping", function(data, flags){
        console.log("ping");
    });

    ws.on("pong", function(data, flags){
        console.log("pong");
    });

    ws.on("open", function(){            
        console.log("open");
    });
});
                        
const SERVER_PORT = 8080;
server.listen(SERVER_PORT, function () {
  console.log('connecthing.io node microservice listening on port ' + SERVER_PORT + '!');
})
