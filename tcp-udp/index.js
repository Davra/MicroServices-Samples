const net = require('net');
const dgram = require('dgram');

const TCP_PORT_1 = 8888;
const TCP_PORT_2 = 8889;
const UDP_PORT_1 = 9998;
const UDP_PORT_2 = 9999;

const server = net.createServer();    
server.on('connection', function (conn) {
  var remoteAddress = conn.remoteAddress + ':' + conn.remotePort;  
  console.log('TCP 1 new client connection from %s', remoteAddress);
  conn.on('data', onConnData);  
  conn.once('close', onConnClose);  
  conn.on('error', onConnError);
  function onConnData(d) {  
    console.log('TCP 1 connection data from %s: %j', remoteAddress, d);  
    conn.write(d);  
  }
  function onConnClose() {  
    console.log('TCP 1 connection from %s closed', remoteAddress);  
  }
  function onConnError(err) {  
    console.log('TCP 1 Connection %s error: %s', remoteAddress, err.message);  
  }  
});
server.listen(TCP_PORT_1, function() {    
  console.log('TCP 1 server listening to %j', server.address());  
});


const server2 = net.createServer();    
server2.on('connection', function (conn) {
  var remoteAddress = conn.remoteAddress + ':' + conn.remotePort;  
  console.log('TCP 2 new client connection from %s', remoteAddress);
  conn.on('data', onConnData);  
  conn.once('close', onConnClose);  
  conn.on('error', onConnError);
  function onConnData(d) {  
    console.log('TCP 2 connection data from %s: %j', remoteAddress, d);  
    conn.write(d);  
  }
  function onConnClose() {  
    console.log('TCP 2 connection from %s closed', remoteAddress);  
  }
  function onConnError(err) {  
    console.log('TCP 2 Connection %s error: %s', remoteAddress, err.message);  
  }  
});
server2.listen(TCP_PORT_2, function() {    
  console.log('TCP 2 server listening to %j', server2.address());  
});


const server3 = dgram.createSocket('udp4');
server3.on('error',function(error){
  console.log('UDP 1 Error: ' + error);
  server3.close();
});
server3.on('message',function(msg,info){
  console.log('UDP 1 Data received from client : ' + msg.toString());
  console.log('UDP 1 Received %d bytes from %s:%d\n',msg.length, info.address, info.port);

    server3.send(msg,info.port,info.address);
});
server3.on('listening',function(){
  var address = server3.address();
  var port = address.port;
  var family = address.family;
  var ipaddr = address.address;
  console.log('UDP 1 Server is listening at port' + port);
  console.log('UDP 1 Server ip :' + ipaddr);
  console.log('UDP 1 Server is IP4/IP6 : ' + family);
});
server3.on('close',function(){
  console.log('UDP 1 Socket is closed !');
});
server3.bind(UDP_PORT_1);

const server4 = dgram.createSocket('udp4');
server4.on('error',function(error){
  console.log('UDP 2 Error: ' + error);
  server4.close();
});
server4.on('message',function(msg,info){
  console.log('UDP 2 Data received from client : ' + msg.toString());
  console.log('UDP 2 Received %d bytes from %s:%d\n',msg.length, info.address, info.port);

    server4.send(msg,info.port,info.address);
});
server4.on('listening',function(){
  var address = server4.address();
  var port = address.port;
  var family = address.family;
  var ipaddr = address.address;
  console.log('UDP 2 Server is listening at port' + port);
  console.log('UDP 2 Server ip :' + ipaddr);
  console.log('UDP 2 Server is IP4/IP6 : ' + family);
});
server4.on('close',function(){
  console.log('UDP 2 Socket is closed !');
});
server4.bind(UDP_PORT_2);


